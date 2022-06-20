import { useCallback, useEffect, useState } from 'react';
import PrayertimesAPI from '../api/PrayertimesAPI';
import * as DailyPrayertimes from '../domain/DailyPrayertimes';
import { DownloadDataState } from './util';
import {
  DateOnly,
  dateOnlyFromStr,
  LocalityCode,
} from '../domain/DailyPrayertimes';
import TimesRepository from '../repositories/TimesRepository';
import { valueOf } from '../domain/utils';

export function usePrayertimesDataEffect(
  localityCode: LocalityCode,
  date?: DateOnly,
) {
  const [data, setData] = useState<DailyPrayertimes.T | null>(null);
  const [hasData, setHasData] = useState<boolean>(false);
  const [downloadDataState, setDownloadDataState] = useState<DownloadDataState>(
    { state: 'idle' },
  );

  const loadData = useCallback(() => {
    async function asyncCallback() {
      const prayertimesData = await getPrayertimesData(localityCode, date);
      setData(prayertimesData);
      setHasData(!!prayertimesData);
    }
    asyncCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueOf(localityCode), date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const downloadData = useCallback(() => {
    async function asyncCallback() {
      setDownloadDataState({ state: 'downloading' });
      try {
        await downloadPrayertimes(localityCode, date?.date.getFullYear());
        setDownloadDataState({ state: 'downloaded' });
        loadData();
      } catch (e) {
        setDownloadDataState({ state: 'error', error: e as Error });
      }
    }
    asyncCallback();
  }, [loadData, localityCode, date]);

  return {
    data,
    hasData,
    downloadDataState,
    downloadData,
  };
}

async function getPrayertimesData(
  localityCode: LocalityCode,
  date = dateOnlyFromStr(new Date().toISOString()),
): Promise<DailyPrayertimes.T | null> {
  return TimesRepository.getTimesForDay(localityCode, date);
}

async function downloadPrayertimes(
  localityCode: LocalityCode,
  year: number = new Date().getFullYear(),
): Promise<void> {
  const prayertimesByMonthsDto = await PrayertimesAPI.getTimesForYear(
    localityCode.countryCode,
    localityCode.locality,
    year,
  );
  const prayertimes = prayertimesByMonthsDto.flatMap(dailyPrayertimes =>
    dailyPrayertimes.map(DailyPrayertimes.fromDto),
  );
  await TimesRepository.upsertTimes(prayertimes);
}
