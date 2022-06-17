import Db from '../Db';
import * as DailyPrayertimes from '../domain/DailyPrayertimes';
import { LocalityCode } from '../domain/DailyPrayertimes';
import { valueOf } from '../domain/utils';
import {
  generateCreateTableStatement,
  MigrationId,
  MigrationStatements,
} from './utils';

const TimesTableName = 'times';

const TimesColumns = {
  date: 'date',
  prayer_id: 'prayer_id',
  locality_code: 'locality_code',
  source_id: 'source_id',
  time: 'time',
  updated: 'updated',
};

const TimesColumnTypes = {
  date: 'TEXT NOT NULL',
  prayer_id: 'INTEGER NOT NULL',
  locality_code: 'TEXT NOT NULL',
  source_id: 'INTEGER NOT NULL',
  time: 'TEXT NOT NULL',
  updated: 'INTEGER NOT NULL',
};

const TimesPrimaryKey = [
  TimesColumns.locality_code,
  TimesColumns.date,
  TimesColumns.prayer_id,
];

function migrations(): [MigrationId, MigrationStatements][] {
  return [
    [
      `${TimesTableName}_2022-06-15T02:58:50.757Z`,
      [
        generateCreateTableStatement(
          TimesTableName,
          TimesColumns,
          TimesColumnTypes,
          TimesPrimaryKey,
        ),
      ],
    ],
  ];
}

async function getTimesForDay(
  localityCode: LocalityCode,
  date: DailyPrayertimes.DateOnly,
): Promise<DailyPrayertimes.T | null> {
  const results = await Db.query(
    `SELECT * FROM ${TimesTableName} WHERE ${TimesColumns.locality_code} = ? AND ${TimesColumns.date} = ? ORDER BY ${TimesColumns.prayer_id} ASC`,
    [valueOf(localityCode), valueOf(date)],
  );
  if (results.length === 0) {
    return null;
  }

  return DailyPrayertimes.fromDb(results);
}

async function upsertTimes(
  manyDailyPrayertimes: DailyPrayertimes.T[],
): Promise<number[]> {
  const sqlStatementArgsPairs: [string, (string | number)[]][] =
    manyDailyPrayertimes.map(DailyPrayertimes.toDb).flatMap(prayertimes => {
      const pairs: [string, (string | number)[]][] = prayertimes.map(z => {
        const columns = Object.keys(z).join(', ');
        const args = Object.keys(z)
          .map(() => '?')
          .join(', ');
        const values = Object.values(z).map(v => (v === undefined ? '' : v));
        return [
          `INSERT INTO ${TimesTableName} (${columns}) VALUES (${args})`,
          values,
        ];
      });

      const allPairs: [string, (string | number)[]][] = [
        [
          `DELETE FROM ${TimesTableName} WHERE ${TimesColumns.locality_code} = ? AND ${TimesColumns.date} = ?`,
          [prayertimes[0].locality_code!, prayertimes[0].date!],
        ],
        ...pairs,
      ];

      return allPairs;
    });

  const results = await Db.executeMultiSql(
    sqlStatementArgsPairs.map(row => row[0]),

    sqlStatementArgsPairs.map(row => row[1]),
  );
  return results.map(r => r.insertId!);
}

export default {
  TimesTableName,
  migrations,
  getTimesForDay,
  upsertTimes,
};
