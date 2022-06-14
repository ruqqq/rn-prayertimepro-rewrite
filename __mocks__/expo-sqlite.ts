import wOpenDatabase from 'websql';

export function openDatabase(
  _name: string,
  version: string,
  description: string,
  size: number,
  callback: (db: any) => void,
) {
  const db = wOpenDatabase(':memory:', version, description, size, callback);
  db.deleteAsync = () => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'SELECT name FROM sqlite_schema WHERE type = "table" AND name NOT LIKE "sqlite_%"',
        [],
        (_: any, resultSet: any) => {
          resultSet.rows._array.forEach(({ name }: { name: string }) =>
            tx.executeSql(`DROP TABLE ${name}`),
          );
        },
      );
    });
  };
  return db;
}
