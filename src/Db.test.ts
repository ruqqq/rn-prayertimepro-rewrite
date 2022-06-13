import {
  executeMultiSql,
  executeSql,
  insert,
  insertMany,
  openDatabase,
  query,
  update,
} from './Db';

describe('db', () => {
  it('should be able to create table and insert data', async () => {
    const db = openDatabase('test');
    await executeSql(
      db,
      'CREATE TABLE IF NOT EXISTS TestTable (id INTEGER NOT NULL, name TEXT NOT NULL);',
    );
    const insertId = await insert(
      db,
      'INSERT INTO TestTable (id, name) VALUES (?, ?)',
      [1, 'hello'],
    );

    expect(insertId).toEqual(1);
  });

  it('should be able to create table and insert many data', async () => {
    const db = openDatabase('test');
    await executeSql(
      db,
      'CREATE TABLE IF NOT EXISTS TestTable (id INTEGER NOT NULL, name TEXT NOT NULL);',
    );
    const insertIds = await insertMany(db, [
      'INSERT INTO TestTable (id, name) VALUES (1, "hello")',
      'INSERT INTO TestTable (id, name) VALUES (2, "hello")',
      'INSERT INTO TestTable (id, name) VALUES (3, "hello")',
    ]);

    expect(insertIds).toEqual([1, 2, 3]);
  });

  it('should be able to retrieve inserted data', async () => {
    const db = openDatabase('test');
    await executeSql(
      db,
      'CREATE TABLE IF NOT EXISTS TestTable (id INTEGER NOT NULL, name TEXT NOT NULL);',
    );
    await insert(db, 'INSERT INTO TestTable (id, name) VALUES (1, "hello");');
    const result = await query(db, 'SELECT * FROM TestTable');

    expect(result).toEqual([
      {
        id: 1,
        name: 'hello',
      },
    ]);
  });

  it('should be able to update data', async () => {
    const db = openDatabase('test');
    await executeSql(
      db,
      'CREATE TABLE IF NOT EXISTS TestTable (id INTEGER NOT NULL, name TEXT NOT NULL);',
    );
    await insert(db, 'INSERT INTO TestTable (id, name) VALUES (1, "hello");');
    const affectedRows = await update(
      db,
      'UPDATE TestTable SET name = "updated name" WHERE id = 1',
    );

    expect(affectedRows).toEqual(1);
  });

  it('should be able to insert and then retrieve data in a single transaction', async () => {
    const db = openDatabase('test');
    const result = await executeMultiSql(
      db,
      [
        'CREATE TABLE IF NOT EXISTS TestTable (id INTEGER NOT NULL, name TEXT NOT NULL)',
        'INSERT INTO TestTable (id, name) VALUES (1, "hello")',
        'UPDATE TestTable SET name = ? WHERE id = 1',
      ],
      [[], [], ['updated name']],
    );

    expect(result.length).toEqual(3);
    expect(result[1].insertId).toEqual(1);
    expect(result[2].rowsAffected).toEqual(1);
    const queryResult = await query(db, 'SELECT * FROM TestTable');
    expect(queryResult).toEqual([
      {
        id: 1,
        name: 'updated name',
      },
    ]);
  });
});
