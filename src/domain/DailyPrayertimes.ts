import formatISO from 'date-fns/formatISO';
import getDate from 'date-fns/getDate';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import parseJSON from 'date-fns/parseJSON';
import set from 'date-fns/set';
import toDate from 'date-fns/toDate';
import { valueOf, ValueType } from './utils';
import * as Zone from './Zone';

export type DateOnly = ValueType<'DateOnly', string> & {
  date: Date;
};

export function dateOnlyOf(
  dateOfMonth: number,
  month: number,
  year: number,
): DateOnly {
  const date = set(toDate(new Date(year, month - 1, dateOfMonth)), {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  return {
    type: 'DateOnly',
    date,
    value: formatISO(date),
  };
}

export function dateOnlyFromStr(dateStr: string): DateOnly {
  const date = set(parseJSON(dateStr), {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  return {
    type: 'DateOnly',
    date,
    value: formatISO(date),
  };
}

enum PrayerIdEnum {
  Subuh = 0,
  Syuruk = 1,
  Zuhur = 2,
  Asar = 3,
  Maghrib = 4,
  Isyak = 5,
}

type PrayerId = ValueType<'PrayerId', number> & {
  prayerId: PrayerIdEnum;
};

export function prayerIdOf(prayerIdInt: number): PrayerId {
  const prayerId: PrayerIdEnum = prayerIdInt;

  return {
    type: 'PrayerId',
    prayerId,
    value: prayerIdInt,
    toString: () => PrayerIdEnum[prayerIdInt],
  };
}

type DateTime = ValueType<'DateTime', string> & {
  date: Date;
};

export function dateTimeOf(dateStr: string): DateTime {
  const date = parseJSON(dateStr);

  return {
    type: 'DateTime',
    date,
    value: formatISO(date),
  };
}

export type SourceId = ValueType<'SourceId', number>;
export function sourceIdOf(sourceId: number): SourceId {
  return {
    type: 'SourceId',
    value: sourceId,
  };
}

export type LocalityCode = ValueType<'LocalityCode', string> & {
  countryCode: string;
  locality: string;
};
export function localityCodeOf(localityCode: string): LocalityCode {
  return {
    type: 'LocalityCode',
    countryCode: localityCode.split('-')[0],
    locality: localityCode.split('-')[1],
    value: localityCode,
  };
}

export function localityCodeFrom(zone: Zone.T): LocalityCode {
  return {
    type: 'LocalityCode',
    countryCode: zone.country.value,
    locality: zone.code.value,
    value: `${zone.country.value}-${zone.code.value}`,
  };
}

type DailyPrayertimes = {
  date: DateOnly;
  localityCode: LocalityCode;
  sourceId: SourceId;
  times: {
    [PrayerIdEnum.Subuh]: DateTime;
    [PrayerIdEnum.Syuruk]: DateTime;
    [PrayerIdEnum.Zuhur]: DateTime;
    [PrayerIdEnum.Asar]: DateTime;
    [PrayerIdEnum.Maghrib]: DateTime;
    [PrayerIdEnum.Isyak]: DateTime;
  };
  updated: DateTime;
};
export type T = DailyPrayertimes;

export function fromDto(dto: {
  date: number;
  month: number;
  year: number;
  localityCode: string;
  source_id: number;
  times: [string, string, string, string, string, string];
  updated: string;
}): DailyPrayertimes {
  return {
    date: dateOnlyOf(dto.date, dto.month, dto.year),
    localityCode: localityCodeOf(dto.localityCode),
    sourceId: sourceIdOf(dto.source_id),
    updated: dateTimeOf(dto.updated),
    times: {
      [PrayerIdEnum.Subuh]: dateTimeOf(dto.times[0]),
      [PrayerIdEnum.Syuruk]: dateTimeOf(dto.times[1]),
      [PrayerIdEnum.Zuhur]: dateTimeOf(dto.times[2]),
      [PrayerIdEnum.Asar]: dateTimeOf(dto.times[3]),
      [PrayerIdEnum.Maghrib]: dateTimeOf(dto.times[4]),
      [PrayerIdEnum.Isyak]: dateTimeOf(dto.times[5]),
    },
  };
}

export function fromDb(
  dbValues: {
    date: string;
    prayer_id: number;
    locality_code: string;
    source_id: number;
    time: string;
    updated: string;
  }[],
): DailyPrayertimes {
  if (dbValues.length !== 6) {
    throw new Error(
      `Expecting 6 items required in array for fromDB, received only ${dbValues.length}`,
    );
  }

  const firstDbValues = dbValues[0];
  return {
    date: dateOnlyFromStr(firstDbValues.date),
    localityCode: localityCodeOf(firstDbValues.locality_code),
    sourceId: sourceIdOf(firstDbValues.source_id),
    updated: dateTimeOf(firstDbValues.updated),
    times: {
      [PrayerIdEnum.Subuh]: dateTimeOf(dbValues[0].time),
      [PrayerIdEnum.Syuruk]: dateTimeOf(dbValues[1].time),
      [PrayerIdEnum.Zuhur]: dateTimeOf(dbValues[2].time),
      [PrayerIdEnum.Asar]: dateTimeOf(dbValues[3].time),
      [PrayerIdEnum.Maghrib]: dateTimeOf(dbValues[4].time),
      [PrayerIdEnum.Isyak]: dateTimeOf(dbValues[5].time),
    },
  };
}

export function toDb(prayertimes: DailyPrayertimes): {
  [column: string]: string | number | undefined;
}[] {
  return Object.values(prayertimes.times).map((time, index) => ({
    date: valueOf(prayertimes.date),
    prayer_id: index,
    locality_code: valueOf(prayertimes.localityCode),
    source_id: valueOf(prayertimes.sourceId),
    time: valueOf(time),
    updated: valueOf(prayertimes.updated),
  }));
}

export function toDto(prayertimes: DailyPrayertimes): {
  date: number;
  month: number;
  year: number;
  localityCode: string;
  source_id: number;
  times: [string, string, string, string, string, string];
  updated: string;
} {
  return {
    date: getDate(prayertimes.date.date),
    month: getMonth(prayertimes.date.date),
    year: getYear(prayertimes.date.date),
    localityCode: valueOf(prayertimes.localityCode),
    source_id: valueOf(prayertimes.sourceId),
    times: Object.values(prayertimes.times).map(time => valueOf(time)) as any,
    updated: valueOf(prayertimes.updated),
  };
}
