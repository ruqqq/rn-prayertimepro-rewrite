import { openDatabase, SQLResultSet, WebSQLDatabase } from 'expo-sqlite';

export type Database = WebSQLDatabase;

let db: Database;

function open() {
  db = openDatabase('database.db');
}

async function query(
  statement: string,
  args?: (string | number)[],
): Promise<any[]> {
  const result = await executeSql(statement, args);
  if ('_array' in result.rows) {
    return result.rows._array as any;
  }

  return result.rows as any;
}

async function insert(
  statement: string,
  args?: (string | number)[],
): Promise<number | undefined> {
  const result = await executeSql(statement, args);
  return result.insertId;
}

async function insertMany(
  statements: string[],
  args?: (string | number)[][],
): Promise<(number | undefined)[]> {
  const result = await executeMultiSql(statements, args);
  return result.map(r => r.insertId);
}

async function update(
  statement: string,
  args?: (string | number)[],
): Promise<number> {
  const result = await executeSql(statement, args);
  return result.rowsAffected;
}

async function executeSql(
  statement: string,
  args?: (string | number)[],
): Promise<SQLResultSet> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(statement, args, (_, resultSet) => resolve(resultSet));
    }, reject);
  });
}

async function executeMultiSql(
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

export default {
  open,
  query,
  insert,
  insertMany,
  update,
  executeSql,
  executeMultiSql,
  _db: () => db,
};
