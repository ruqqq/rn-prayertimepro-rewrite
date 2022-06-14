import { Database, openDatabase, query } from './Db';
import DbMigrator from './DbMigrator';
import ZonesRepository from './repositories/ZonesRepository';

describe('DbMigrator', () => {
  let db: Database;
  beforeEach(() => {
    db = openDatabase('test');
  });

  it('should create MigrationMeta table', async () => {
    await DbMigrator.migrate(db, []);

    const result = await query(
      db,
      'SELECT name, sql FROM sqlite_schema WHERE type = "table" AND name NOT LIKE "sqlite_%"',
    );
    expect(result).toEqual([
      {
        name: 'migration_meta',
        sql: 'CREATE TABLE migration_meta (name TEXT NOT NULL, status TEXT NOT NULL, PRIMARY KEY (name))',
      },
    ]);
  });

  it('should create MigrationMeta table only once', async () => {
    await DbMigrator.migrate(db, []);
    await DbMigrator.migrate(db, []);

    const result = await query(
      db,
      'SELECT name FROM sqlite_schema WHERE type = "table" AND name NOT LIKE "sqlite_%"',
    );
    expect(result).toEqual([{ name: 'migration_meta' }]);
  });

  describe('Zones', () => {
    it('should migrate Zones', async () => {
      await DbMigrator.migrate(db, [...ZonesRepository.migrations()]);

      const result = await query(
        db,
        'SELECT name, sql FROM sqlite_schema WHERE type = "table" AND name NOT LIKE "sqlite_%"',
      );
      expect(result).toEqual([
        {
          name: 'migration_meta',
          sql: 'CREATE TABLE migration_meta (name TEXT NOT NULL, status TEXT NOT NULL, PRIMARY KEY (name))',
        },
        { name: 'zones', sql: expect.anything() },
      ]);
    });

    it('should migrate Zones only once', async () => {
      await DbMigrator.migrate(db, [...ZonesRepository.migrations()]);
      await DbMigrator.migrate(db, [...ZonesRepository.migrations()]);

      const result = await query(db, 'SELECT * FROM migration_meta');
      expect(result).toHaveLength(1);
      expect(result).toEqual([
        {
          name: expect.stringContaining('zones_'),
          status: 'SUCCESS',
        },
      ]);
    });
  });
});
