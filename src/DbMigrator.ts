import Db from './Db';
import PreferencesRepository from './repositories/PreferencesRepository';
import SystemPreferencesRepository from './repositories/SystemPreferencesRepository';
import {
  generateCreateTableStatement,
  MigrationId,
  MigrationStatements,
} from './repositories/utils';
import ZonesRepository from './repositories/ZonesRepository';

const MigrationMetaTableName = 'migration_meta';

const MigrationMetaColumns = {
  name: 'name',
};

const MigrationMetaColumnTypes = {
  name: 'TEXT NOT NULL',
};

const MigrationMetaPrimaryKey = [MigrationMetaColumns.name];

async function migrate(
  allMigrations: [MigrationId, MigrationStatements][] = [
    ...ZonesRepository.migrations(),
    ...PreferencesRepository.migrations(),
    ...SystemPreferencesRepository.migrations(),
  ],
): Promise<void> {
  const statement = generateCreateTableStatement(
    MigrationMetaTableName,
    MigrationMetaColumns,
    MigrationMetaColumnTypes,
    MigrationMetaPrimaryKey,
  );
  await Db.executeSql(statement);

  for (let i = 0; i < allMigrations.length; i++) {
    const migrationId = allMigrations[i][0];
    const migrations = allMigrations[i][1];

    const existingMigrations = await Db.query(
      `SELECT * FROM ${MigrationMetaTableName} WHERE ${MigrationMetaColumns.name} = ?`,
      [migrationId],
    );
    if (existingMigrations.length === 0) {
      try {
        await Db.executeMultiSql(migrations);
        await Db.insert(
          `INSERT INTO ${MigrationMetaTableName} (${Object.values(
            MigrationMetaColumns,
          ).join(', ')}) VALUES (?)`,
          [migrationId],
        );
      } catch (e) {
        console.error(e);
      }
    }
  }
}

export default {
  migrate,
};
