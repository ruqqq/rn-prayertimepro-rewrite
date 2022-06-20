import { useCallback, useEffect, useState } from 'react';
import PrayertimesAPI from '../api/PrayertimesAPI';
import * as Hijri from '../domain/Hijri';
import { DownloadDataState } from './util';
import { LocalityCode } from '../domain/DailyPrayertimes';
import HijrisRepository from '../repositories/HijrisRepository';
import { useRefValue } from './RefValue';

export function useHijrisDataEffect(localityCode: LocalityCode, year?: number) {
  const [data, setData] = useState<Hijri.T[]>([]);
  const [hasData, setHasData] = useState<boolean>(false);
  const [downloadDataState, setDownloadDataState] = useState<DownloadDataState>(
    { state: 'idle' },
  );

  const localityCodeRefValue = useRefValue(localityCode, () =>
    setDownloadDataState({ state: 'idle' }),
  );

  const loadData = useCallback(() => {
    async function asyncCallback() {
      const hijris = await getHijrisData(localityCodeRefValue, year);
      setData(hijris);
      setHasData(hijris.length > 0);
    }
    asyncCallback();
  }, [localityCodeRefValue, year]);

  useEffect(() => {
    setDownloadDataState({ state: 'idle' });
    loadData();
  }, [loadData]);

  const downloadData = useCallback(() => {
    async function asyncCallback() {
      setDownloadDataState({ state: 'downloading' });
      try {
        await downloadHijris(localityCodeRefValue, year);
        setDownloadDataState({ state: 'downloaded' });
        loadData();
      } catch (e) {
        setDownloadDataState({ state: 'error', error: e as Error });
      }
    }
    asyncCallback();
  }, [loadData, localityCodeRefValue, year]);

  return {
    data,
    hasData,
    downloadDataState,
    downloadData,
  };
}

export async function getHijrisData(
  localityCode: LocalityCode,
  year = new Date().getFullYear(),
): Promise<Hijri.T[]> {
  return HijrisRepository.getHijrisForYear(localityCode, year);
}

export async function downloadHijris(
  localityCode: LocalityCode,
  year: number = new Date().getFullYear(),
): Promise<void> {
  const hijrisDto = await PrayertimesAPI.getHijrisForYear(
    localityCode.countryCode,
    localityCode.locality,
    year,
  );
  const hijris = hijrisDto.flatMap(monthlyDto => monthlyDto.map(Hijri.fromDto));
  await HijrisRepository.upsertHijris(hijris);
}
