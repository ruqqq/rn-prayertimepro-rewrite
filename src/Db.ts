import {
  openDatabase as webSqlOpenDatabase,
  SQLResultSet,
  SQLResultSetRowList,
  WebSQLDatabase,
} from 'expo-sqlite';

export const openDatabase: typeof webSqlOpenDatabase = (
  name,
  version,
  description,
  size,
  callback,
) => {
  return webSqlOpenDatabase(name, version, description, size, callback);
};

export async function query(
  db: WebSQLDatabase,
  statement: string,
  args?: (string | number)[],
): Promise<SQLResultSetRowList> {
  const result = await executeSql(db, statement, args);
  if ('_array' in result.rows) {
    return result.rows._array as any;
  }

  return result.rows;
}

export async function insert(
  db: WebSQLDatabase,
  statement: string,
  args?: (string | number)[],
): Promise<number | undefined> {
  const result = await executeSql(db, statement, args);
  return result.insertId;
}

export async function insertMany(
  db: WebSQLDatabase,
  statements: string[],
  args?: (string | number)[][],
): Promise<(number | undefined)[]> {
  const result = await executeMultiSql(db, statements, args);
  return result.map(r => r.insertId);
}

export async function update(
  db: WebSQLDatabase,
  statement: string,
  args?: (string | number)[],
): Promise<number> {
  const result = await executeSql(db, statement, args);
  return result.rowsAffected;
}

export async function executeSql(
  db: WebSQLDatabase,
  statement: string,
  args?: (string | number)[],
): Promise<SQLResultSet> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(statement, args, (_, resultSet) => resolve(resultSet));
    }, reject);
  });
}

export async function executeMultiSql(
  db: WebSQLDatabase,
  statements: string[],
  args?: (string | number)[][],
): Promise<SQLResultSet[]> {
  const results: SQLResultSet[] = [];
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          const statementArgs = args?.[i];
          tx.executeSql(statement, statementArgs, (_, resultSet) =>
            results.push(resultSet),
          );
        }
      },
      reject,
      () => resolve(results),
    );
  });
}
