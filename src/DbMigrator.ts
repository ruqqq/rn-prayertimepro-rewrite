import { WebSQLDatabase } from 'expo-sqlite';
import { executeMultiSql, executeSql, insert, query } from './Db';
import {
  generateCreateTableStatement,
  MigrationId,
  MigrationStatements,
} from './repositories/utils';

const MigrationMetaTableName = 'migration_meta';

const MigrationMetaColumns = {
  name: 'name',
};

const MigrationMetaColumnTypes = {
  name: 'TEXT NOT NULL',
};

const MigrationMetaPrimaryKey = [MigrationMetaColumns.name];

async function migrate(
  db: WebSQLDatabase,
  allMigrations: [MigrationId, MigrationStatements][],
): Promise<void> {
  const statement = generateCreateTableStatement(
    MigrationMetaTableName,
    MigrationMetaColumns,
    MigrationMetaColumnTypes,
    MigrationMetaPrimaryKey,
  );
  await executeSql(db, statement);

  for (let i = 0; i < allMigrations.length; i++) {
    const migrationId = allMigrations[i][0];
    const migrations = allMigrations[i][1];

    const existingMigrations = await query(
      db,
      `SELECT * FROM ${MigrationMetaTableName} WHERE ${MigrationMetaColumns.name} = ?`,
      [migrationId],
    );
    if (existingMigrations.length === 0) {
      try {
        await executeMultiSql(db, migrations);
        await insert(
          db,
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
