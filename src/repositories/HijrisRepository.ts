import Db from '../Db';
import { DateOnly } from '../domain/DailyPrayertimes';
import { valueOf } from '../domain/utils';
import * as Hijri from '../domain/Hijri';
import {
  generateCreateTableStatement,
  MigrationId,
  MigrationStatements,
} from './utils';
import formatISO from 'date-fns/formatISO';

export const HijrisTableName = 'hijris';

export const HijrisColumns = {
  date: 'date',
  hijri_date: 'hijri_date',
  hijri_month: 'hijri_month',
  hijri_year: 'hijri_year',
  locality_code: 'locality_code',
  source_id: 'source_id',
};

const HijrisColumnTypes = {
  date: 'TEXT NOT NULL',
  hijri_date: 'INTEGER NOT NULL',
  hijri_month: 'INTEGER NOT NULL',
  hijri_year: 'INTEGER NOT NULL',
  prayer_id: 'INTEGER NOT NULL',
  locality_code: 'TEXT NOT NULL',
  source_id: 'INTEGER NOT NULL',
};

const HijrisPrimaryKey = [HijrisColumns.locality_code, HijrisColumns.date];

function migrations(): [MigrationId, MigrationStatements][] {
  return [
    [
      `${HijrisTableName}_2022-06-16T00:00:00.000Z`,
      [
        generateCreateTableStatement(
          HijrisTableName,
          HijrisColumns,
          HijrisColumnTypes,
          HijrisPrimaryKey,
        ),
      ],
    ],
  ];
}

async function getHijrisForDay(date: DateOnly): Promise<Hijri.T | null> {
  const results = await Db.query(
    `SELECT * FROM ${HijrisTableName} WHERE ${HijrisColumns.date} = ?`,
    [valueOf(date)],
  );
  if (results.length === 0) {
    return null;
  }

  return Hijri.fromDb(results[0]);
}

async function getHijrisForYear(year: number): Promise<Hijri.T[]> {
  const results = await Db.query(
    `SELECT * FROM ${HijrisTableName} WHERE ${HijrisColumns.date} >= ? and ${HijrisColumns.date} <= ? ORDER BY ${HijrisColumns.date} ASC`,
    [formatISO(new Date(year, 1, 1)), formatISO(new Date(year, 12, 31))],
  );

  return results.map(Hijri.fromDb);
}

async function upsertHijris(hijris: Hijri.T[]): Promise<number[]> {
  if (hijris.length === 0) {
    return [];
  }

  const rows: [string, (string | number)[]][] = hijris
    .map(Hijri.toDb)
    .map(h => {
      const columns = Object.keys(h).join(', ');
      const args = Object.keys(h)
        .map(() => '?')
        .join(', ');
      const values = Object.values(h).map(v => (v === undefined ? '' : v));
      return [
        `INSERT INTO ${HijrisTableName} (${columns}) VALUES (${args})`,
        values,
      ];
    });

  const results = await Db.executeMultiSql(
    [
      `DELETE FROM ${HijrisTableName} WHERE ${HijrisColumns.locality_code} = ?`,
      ...rows.map(row => row[0]),
    ],
    [[valueOf(hijris[0].localityCode)], ...rows.map(row => row[1])],
  );
  return results.map(r => r.insertId!);
}

export default {
  HijrisTableName,
  migrations,
  getHijrisForDay,
  getHijrisForYear,
  upsertHijris,
};
