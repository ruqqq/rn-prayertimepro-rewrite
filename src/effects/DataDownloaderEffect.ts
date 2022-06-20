import { useCallback } from 'react';
import { LocalityCode } from '../domain/DailyPrayertimes';
import { useHijrisDataEffect } from './HijrisDataEffect';
import { usePrayertimesDataEffect } from './PrayertimesDataEffect';

export default function useDataDownloaderEffect(localityCode: LocalityCode) {
  const {
    hasData: prayertimesHasData,
    downloadDataState: prayertimesDownloadDataState,
    downloadData: prayertimesDownloadData,
  } = usePrayertimesDataEffect(localityCode);
  const {
    hasData: hijrisHasData,
    downloadDataState: hijrisDownloadDataState,
    downloadData: hijrisDownloadData,
  } = useHijrisDataEffect(localityCode);

  let downloadDataState: typeof prayertimesDownloadDataState = {
    state: 'idle',
  };
  if (prayertimesDownloadDataState.state === 'downloaded') {
    downloadDataState = prayertimesDownloadDataState;
  }
  if (hijrisDownloadDataState.state === 'downloaded') {
    downloadDataState = hijrisDownloadDataState;
  }
  if (prayertimesDownloadDataState.state === 'downloading') {
    downloadDataState = prayertimesDownloadDataState;
  }
  if (hijrisDownloadDataState.state === 'downloading') {
    downloadDataState = hijrisDownloadDataState;
  }
  if (prayertimesDownloadDataState.state === 'error') {
    downloadDataState = prayertimesDownloadDataState;
  }
  if (hijrisDownloadDataState.state === 'error') {
    downloadDataState = hijrisDownloadDataState;
  }

  const downloadData = useCallback(() => {
    async function asyncCallback() {
      return Promise.all([prayertimesDownloadData(), hijrisDownloadData()]);
    }
    asyncCallback();
  }, [prayertimesDownloadData, hijrisDownloadData]);

  return {
    hasData: prayertimesHasData && hijrisHasData,
    downloadDataState,
    downloadData,
  };
}
