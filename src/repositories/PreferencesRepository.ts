import {
  generateCreateTableStatement,
  MigrationId,
  MigrationStatements,
} from './utils';

const PreferencesTableName = 'preferences';

const PreferencesColumns = {
  id: 'id',
  value: 'value',
};

const PreferencesColumnTypes = {
  id: 'TEXT NOT NULL',
  value: 'TEXT NOT NULL',
};

const PreferencesPrimaryKey = [PreferencesColumns.id, PreferencesColumns.value];

export const PreferencesIds = {
  locality_city: 'locality_city',
  locality_code: 'locality_code',
  notification_sound: 'notification_sound',
  notification_sounds: 'notification_sounds',
  prenotification_sounds: 'prenotification_sounds',
  prenotification_minutes: 'prenotification_minutes',
  postnotification_sounds: 'postnotification_sounds',
  postnotification_minutes: 'postnotification_minutes',
  first_install_date: 'first_install_date',
  notification_use_set_alarm: 'notification_use_set_alarm', // Android only
  notification_subuh_alarm: 'notification_subuh_alarm', // Android only
  notification_show_next_prayer: 'notification_show_next_prayer',
};

export type PreferencesId = keyof typeof PreferencesIds;

function migrations(): [MigrationId, MigrationStatements][] {
  return [
    [
      `${PreferencesTableName}_2022-06-14T02:58:50.757Z`,
      [
        generateCreateTableStatement(
          PreferencesTableName,
          PreferencesColumns,
          PreferencesColumnTypes,
          PreferencesPrimaryKey,
        ),
      ],
    ],
  ];
}

export default {
  migrations,
};
