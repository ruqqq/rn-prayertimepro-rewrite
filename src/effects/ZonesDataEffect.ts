import { useCallback, useEffect, useState } from 'react';
import PrayertimesAPI from '../api/PrayertimesAPI';
import ZonesRepository from '../repositories/ZonesRepository';
import * as Zone from '../domain/Zone';
import { DownloadDataState } from './util';

export function useZonesDataEffect() {
  const [data, setData] = useState<Zone.T[]>([]);
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [downloadDataState, setDownloadDataState] = useState<DownloadDataState>(
    { state: 'idle' },
  );

  const loadData = useCallback(() => {
    async function asyncCallback() {
      const zonesData = await getZonesData();
      setData(zonesData);
      setHasData(zonesData.length > 0);
    }
    asyncCallback();
  }, [setData, setHasData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const downloadData = useCallback(() => {
    async function asyncCallback() {
      setDownloadDataState({ state: 'downloading' });
      try {
        await downloadZones();
        setDownloadDataState({ state: 'downloaded' });
        loadData();
      } catch (e) {
        setDownloadDataState({ state: 'error', error: e as Error });
      }
    }
    asyncCallback();
  }, [loadData]);

  return {
    data,
    hasData,
    downloadDataState,
    downloadData,
  };
}

async function getZonesData(): Promise<Zone.T[]> {
  return ZonesRepository.getZones();
}

async function downloadZones(): Promise<void> {
  const zonesDto = await PrayertimesAPI.getZones();
  const zones = Object.values(zonesDto).flatMap(stateZones =>
    stateZones.map(Zone.fromDto),
  );
  await ZonesRepository.replaceZones(zones);
}
