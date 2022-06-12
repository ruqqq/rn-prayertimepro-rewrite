import { openDatabase } from 'expo-sqlite';

describe('db', () => {
  it('should be able to open db', async () => {
    const db = openDatabase('test');
    await new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS TestTable (id INTEGER NOT NULL, name TEXT NOT NULL);',
          );
          tx.executeSql(
            'INSERT INTO TestTable (id, name) VALUES (1, "hello");',
          );
          tx.executeSql(
            'SELECT * FROM TestTable;',
            undefined,
            (_tx, result) => {
              console.log(result.rows);
            },
          );
        },
        reject,
        () => resolve(undefined),
      );
    });
  });
});
