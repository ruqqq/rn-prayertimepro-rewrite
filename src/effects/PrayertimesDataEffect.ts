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
import { useRefValue } from './RefValue';

export function usePrayertimesDataEffect(
  localityCode: LocalityCode,
  date?: DateOnly,
) {
  const [data, setData] = useState<DailyPrayertimes.T | null>(null);
  const [hasData, setHasData] = useState<boolean>(false);
  const [downloadDataState, setDownloadDataState] = useState<DownloadDataState>(
    { state: 'idle' },
  );
  const localityCodeRefValue = useRefValue(localityCode, () =>
    setDownloadDataState({ state: 'idle' }),
  );
  const dateRefValue = useRefValue(date);

  const loadData = useCallback(() => {
    async function asyncCallback() {
      const prayertimesData = await getPrayertimesData(
        localityCodeRefValue,
        dateRefValue,
      );
      setData(prayertimesData);
      setHasData(!!prayertimesData);
    }
    asyncCallback();
  }, [localityCodeRefValue, dateRefValue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const downloadData = useCallback(() => {
    async function asyncCallback() {
      setDownloadDataState({ state: 'downloading' });
      try {
        await downloadPrayertimes(
          localityCodeRefValue,
          dateRefValue?.date.getFullYear(),
        );
        setDownloadDataState({ state: 'downloaded' });
        loadData();
      } catch (e) {
        console.error(e);
        setDownloadDataState({ state: 'error', error: e as Error });
      }
    }
    asyncCallback();
  }, [loadData, localityCodeRefValue, dateRefValue]);

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
