import Db from '../Db';
import {
  generateCreateTableStatement,
  MigrationId,
  MigrationStatements,
} from './utils';

const SystemPreferencesTableName = 'system_preferences';

const SystemPreferencesColumns = {
  id: 'id',
  value: 'value',
};

const SystemPreferencesColumnTypes = {
  id: 'TEXT NOT NULL',
  value: 'TEXT NOT NULL',
};

const SystemPreferencesPrimaryKey = [
  SystemPreferencesColumns.id,
  SystemPreferencesColumns.value,
];

export const SystemPreferencesIds = {
  prayertimes_data_sha: 'prayertimes_data_sha',
  general_data_loaded: 'general_data_loaded',
  city_data_loaded: 'city_data_loaded',
  musolla_data_sha: 'musolla_data_sha',
  js_version: 'js_version',
  onboarding_completed: 'onboarding_completed',
};

type SystemPreferencesTypes = {
  prayertimes_data_sha: string | null;
  general_data_loaded: boolean;
  city_data_loaded: boolean;
  musolla_data_sha: string | null;
  js_version: string;
  onboarding_completed: boolean;
};

const SystemPreferencesDefaultValues: SystemPreferencesTypes = {
  prayertimes_data_sha: '',
  general_data_loaded: false,
  city_data_loaded: false,
  musolla_data_sha: '',
  js_version: '',
  onboarding_completed: false,
};

export type SystemPreferencesId = keyof typeof SystemPreferencesIds;

async function get<K extends SystemPreferencesId>(
  id: K,
): Promise<SystemPreferencesTypes[K]> {
  const defaultValue = SystemPreferencesDefaultValues[id];
  const results = await Db.query(
    `SELECT * FROM ${SystemPreferencesTableName} WHERE id = ?`,
    [id],
  );
  if (results.length === 0) {
    return defaultValue;
  }

  const { value } = results[0];
  if (typeof defaultValue === 'boolean') {
    return (value === 'true') as any;
  } else if (typeof defaultValue === 'number') {
    return parseFloat(value) as any;
  }

  return `${value}` as any;
}

async function set<K extends SystemPreferencesId>(
  id: K,
  value: SystemPreferencesTypes[K],
): Promise<void> {
  await Db.insert(
    `INSERT INTO ${SystemPreferencesTableName} (${Object.values(
      SystemPreferencesColumns,
    ).join(', ')}) VALUES (?, ?)`,
    [id, `${value}`],
  );
}

async function del<K extends SystemPreferencesId>(id: K): Promise<void> {
  await Db.executeSql(
    `DELETE FROM ${SystemPreferencesTableName} WHERE id = ?`,
    [id],
  );
}

function migrations(): [MigrationId, MigrationStatements][] {
  return [
    [
      `${SystemPreferencesTableName}_2022-06-14T02:58:50.757Z`,
      [
        generateCreateTableStatement(
          SystemPreferencesTableName,
          SystemPreferencesColumns,
          SystemPreferencesColumnTypes,
          SystemPreferencesPrimaryKey,
        ),
      ],
    ],
  ];
}

export default {
  migrations,
  get,
  set,
  del,
};
