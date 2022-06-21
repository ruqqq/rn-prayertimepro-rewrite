import { renderHook } from '@testing-library/react-hooks';
import { resetAllWhenMocks, verifyAllWhenMocksCalled, when } from 'jest-when';
import { localityCodeOf } from '../domain/DailyPrayertimes';
import useDataDownloaderEffect from './DataDownloaderEffect';
import { useHijrisDataEffect } from './HijrisDataEffect';
import { usePrayertimesDataEffect } from './PrayertimesDataEffect';
import { DownloadDataState } from './util';

jest.mock('./HijrisDataEffect');
jest.mock('./PrayertimesDataEffect');
const mockedUseHijrisDataEffect = jest.mocked(useHijrisDataEffect);
const mockedUsePrayertimesDataEffect = jest.mocked(usePrayertimesDataEffect);

describe('DataDownloaderEffect', () => {
  const localityCode = localityCodeOf('SG-1');

  afterEach(() => {
    verifyAllWhenMocksCalled();
    resetAllWhenMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [true, true, true],
  ])(
    'when hasData for hijri is %o and hasData for prayertimes is %o should return hasData as %o',
    async (hasDataHijris, hasDataPrayertimes, expectedHasData) => {
      when(mockedUseHijrisDataEffect)
        .calledWith(localityCode)
        .mockReturnValue({
          hasData: hasDataHijris,
          data: [],
          downloadDataState: { state: 'idle' },
          downloadData: jest.fn(),
        });
      when(mockedUsePrayertimesDataEffect)
        .calledWith(localityCode)
        .mockReturnValue({
          hasData: hasDataPrayertimes,
          data: {} as any,
          downloadDataState: { state: 'idle' },
          downloadData: jest.fn(),
        });

      const { result } = renderHook(() =>
        useDataDownloaderEffect(localityCode),
      );

      expect(result.current.hasData).toBe(expectedHasData);
      expect(result.current.downloadDataState).toEqual({ state: 'idle' });
    },
  );

  function s(state: 'idle' | 'downloaded' | 'downloading'): DownloadDataState {
    return { state };
  }

  function e(errString: string = 'error'): DownloadDataState {
    return { state: 'error', error: new Error(errString) };
  }

  it.each([
    [s('idle'), s('idle'), s('idle')],
    [s('downloading'), s('idle'), s('downloading')],
    [s('idle'), s('downloading'), s('downloading')],
    [s('downloading'), s('downloaded'), s('downloading')],
    [s('downloaded'), s('downloading'), s('downloading')],
    [s('downloading'), s('downloading'), s('downloading')],
    [s('downloaded'), s('downloaded'), s('downloaded')],
    [s('downloaded'), s('idle'), s('idle')],
    [s('idle'), s('downloaded'), s('idle')],
    [e(), s('idle'), e()],
    [s('idle'), e(), e()],
    [e(), e(), e()],
  ])(
    'when downloadState for hijri is %o and downloadState for prayertimes is %o should return downloadState as %o',
    async (
      downloadStateHijris,
      downloadStatePrayertimes,
      expectedDownloadState,
    ) => {
      when(mockedUseHijrisDataEffect).calledWith(localityCode).mockReturnValue({
        hasData: false,
        data: [],
        downloadDataState: downloadStateHijris,
        downloadData: jest.fn(),
      });
      when(mockedUsePrayertimesDataEffect)
        .calledWith(localityCode)
        .mockReturnValue({
          hasData: false,
          data: {} as any,
          downloadDataState: downloadStatePrayertimes,
          downloadData: jest.fn(),
        });

      const { result } = renderHook(() =>
        useDataDownloaderEffect(localityCode),
      );

      expect(result.current.hasData).toBe(false);
      expect(result.current.downloadDataState).toEqual(expectedDownloadState);
    },
  );

  it('should download both prayertimes and hijri data', async () => {
    const prayertimesDownloadData = jest.fn();
    const hijrisDownloadData = jest.fn();
    when(mockedUseHijrisDataEffect)
      .calledWith(localityCode)
      .mockReturnValue({
        hasData: false,
        data: [],
        downloadDataState: { state: 'idle' },
        downloadData: hijrisDownloadData,
      });
    when(mockedUsePrayertimesDataEffect)
      .calledWith(localityCode)
      .mockReturnValue({
        hasData: false,
        data: {} as any,
        downloadDataState: { state: 'idle' },
        downloadData: prayertimesDownloadData,
      });

    const { result } = renderHook(() => useDataDownloaderEffect(localityCode));
    result.current.downloadData();

    expect(hijrisDownloadData).toHaveBeenCalledTimes(1);
    expect(prayertimesDownloadData).toHaveBeenCalledTimes(1);
  });
});
