import {
  generateCreateTableStatement,
  MigrationId,
  MigrationStatements,
} from './utils';

const ZonesTableName = 'zones';

const ZonesColumns = {
  country: 'country',
  state: 'state',
  code: 'code',
  city: 'city',
  lat: 'lat',
  lng: 'lng',
  timezone: 'timezone',
};

const ZonesColumnTypes = {
  country: 'TEXT NOT NULL',
  state: 'TEXT NOT NULL',
  code: 'TEXT NOT NULL',
  city: 'TEXT NOT NULL',
  lat: 'INTEGER NOT NULL',
  lng: 'INTEGER NOT NULL',
  timezone: 'TEXT NULL',
};

const ZonesPrimaryKey = [
  ZonesColumns.country,
  ZonesColumns.city,
  ZonesColumns.code,
];

function migrations(): [MigrationId, MigrationStatements][] {
  return [
    [
      `${ZonesTableName}_2022-06-14T02:58:50.757Z`,
      [
        generateCreateTableStatement(
          ZonesTableName,
          ZonesColumns,
          ZonesColumnTypes,
          ZonesPrimaryKey,
        ),
      ],
    ],
  ];
}

export default {
  migrations,
};
