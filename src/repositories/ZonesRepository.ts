import Db from '../Db';
import * as Zone from '../domain/Zone';
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

async function getZones(): Promise<Zone.T[]> {
  const results = await Db.query(`SELECT * FROM ${ZonesTableName}`);
  return results.map(Zone.fromDb);
}

async function replaceZones(zones: Zone.T[]): Promise<number[]> {
  const rows: [string, (string | number)[]][] = zones.map(Zone.toDb).map(z => {
    const columns = Object.keys(z).join(', ');
    const args = Object.keys(z)
      .map(() => '?')
      .join(', ');
    const values = Object.values(z).map(v => (v === undefined ? '' : v));
    return [
      `INSERT INTO ${ZonesTableName} (${columns}) VALUES (${args})`,
      values,
    ];
  });

  const results = await Db.executeMultiSql(
    [`DELETE FROM ${ZonesTableName}`, ...rows.map(row => row[0])],
    [[], ...rows.map(row => row[1])],
  );
  return results.map(r => r.insertId!);
}

export default {
  ZonesTableName,
  migrations,
  getZones,
  replaceZones,
};
