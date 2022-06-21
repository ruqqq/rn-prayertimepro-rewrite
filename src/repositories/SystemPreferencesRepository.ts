import GenericPreferencesRepository from './GenericPreferencesRepository';
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

const SystemPreferencesPrimaryKey = [SystemPreferencesColumns.id];

export type SystemPreferencesTypes = {
  prayertimes_data_sha: string;
  general_data_loaded: boolean;
  city_data_loaded: boolean;
  musolla_data_sha: string;
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

export type SystemPreferencesId = keyof SystemPreferencesTypes;

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

export default new GenericPreferencesRepository(
  SystemPreferencesTableName,
  Object.values(SystemPreferencesColumns),
  SystemPreferencesDefaultValues,
  migrations,
);
