import Db from './Db';
import DbMigrator from './DbMigrator';
import ZonesRepository from './repositories/ZonesRepository';

describe('DbMigrator', () => {
  it('should create MigrationMeta table', async () => {
    await DbMigrator.migrate([]);

    const result = await Db.query(
      'SELECT name, sql FROM sqlite_schema WHERE type = "table" AND name NOT LIKE "sqlite_%"',
    );
    expect(result).toEqual([
      {
        name: 'migration_meta',
        sql: 'CREATE TABLE migration_meta (name TEXT NOT NULL, PRIMARY KEY (name))',
      },
    ]);
  });

  it('should create MigrationMeta table only once', async () => {
    await DbMigrator.migrate([]);
    await DbMigrator.migrate([]);

    const result = await Db.query(
      'SELECT name FROM sqlite_schema WHERE type = "table" AND name NOT LIKE "sqlite_%"',
    );
    expect(result).toEqual([{ name: 'migration_meta' }]);
  });

  describe('Zones', () => {
    it('should migrate Zones', async () => {
      await DbMigrator.migrate([...ZonesRepository.migrations()]);

      const result = await Db.query(
        'SELECT name, sql FROM sqlite_schema WHERE type = "table" AND name NOT LIKE "sqlite_%"',
      );
      expect(result).toEqual([
        {
          name: 'migration_meta',
          sql: 'CREATE TABLE migration_meta (name TEXT NOT NULL, PRIMARY KEY (name))',
        },
        { name: 'zones', sql: expect.anything() },
      ]);
    });

    it('should migrate Zones only once', async () => {
      await DbMigrator.migrate([...ZonesRepository.migrations()]);
      await DbMigrator.migrate([...ZonesRepository.migrations()]);

      const result = await Db.query('SELECT * FROM migration_meta');
      expect(result).toHaveLength(1);
      expect(result).toEqual([
        {
          name: expect.stringContaining('zones_'),
        },
      ]);
    });
  });
});
