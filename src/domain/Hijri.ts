import getDate from 'date-fns/getDate';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import {
  DateOnly,
  dateOnlyFromStr,
  dateOnlyOf,
  LocalityCode,
  localityCodeOf,
  SourceId,
  sourceIdOf,
} from './DailyPrayertimes';
import { valueOf, ValueType } from './utils';

type HijriDate = ValueType<'HijriDate', string> & {
  hijriDate: number;
  hijriMonth: number;
  hijriYear: number;
};

export function hijriDateOf(
  hijriDate: number,
  hijriMonth: number,
  hijriYear: number,
): HijriDate {
  return {
    type: 'HijriDate',
    hijriDate,
    hijriMonth,
    hijriYear,
    value: `${hijriDate}-${hijriMonth}-${hijriYear}`,
  };
}

type Hijri = {
  date: DateOnly;
  hijriDate: HijriDate;
  localityCode: LocalityCode;
  sourceId: SourceId;
};

export type T = Hijri;

export function fromDto(dto: {
  date: number;
  month: number;
  year: number;
  hijriDate: number;
  hijriMonth: number;
  hijriYear: number;
  localityCode: string;
  source_id: number;
}): Hijri {
  return {
    date: dateOnlyOf(dto.date, dto.month, dto.year),
    hijriDate: hijriDateOf(dto.hijriDate, dto.hijriMonth, dto.hijriYear),
    localityCode: localityCodeOf(dto.localityCode),
    sourceId: sourceIdOf(dto.source_id),
  };
}

export function fromDb(dbValues: {
  date: string;
  hijri_date: number;
  hijri_month: number;
  hijri_year: number;
  locality_code: string;
  source_id: number;
}): Hijri {
  return {
    date: dateOnlyFromStr(dbValues.date),
    hijriDate: hijriDateOf(
      dbValues.hijri_date,
      dbValues.hijri_month,
      dbValues.hijri_year,
    ),
    localityCode: localityCodeOf(dbValues.locality_code),
    sourceId: sourceIdOf(dbValues.source_id),
  };
}

export function toDb(hijri: Hijri): {
  [column: string]: string | number | undefined;
} {
  return {
    date: valueOf(hijri.date),
    hijri_date: hijri.hijriDate.hijriDate,
    hijri_month: hijri.hijriDate.hijriMonth,
    hijri_year: hijri.hijriDate.hijriYear,
    locality_code: valueOf(hijri.localityCode),
    source_id: valueOf(hijri.sourceId),
  };
}

export function toDto(hijri: Hijri): {
  date: number;
  month: number;
  year: number;
  hijriDate: number;
  hijriMonth: number;
  hijriYear: number;
  localityCode: string;
  source_id: number;
} {
  return {
    date: getDate(hijri.date.date),
    month: getMonth(hijri.date.date) + 1,
    year: getYear(hijri.date.date),
    hijriDate: hijri.hijriDate.hijriDate,
    hijriMonth: hijri.hijriDate.hijriMonth,
    hijriYear: hijri.hijriDate.hijriYear,
    localityCode: valueOf(hijri.localityCode),
    source_id: valueOf(hijri.sourceId),
  };
}
