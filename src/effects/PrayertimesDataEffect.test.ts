import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import { resetAllWhenMocks, verifyAllWhenMocksCalled, when } from 'jest-when';
import PrayertimesAPI from '../api/PrayertimesAPI';
import TimesRepository from '../repositories/TimesRepository';
import { usePrayertimesDataEffect } from './PrayertimesDataEffect';
import * as DailyPrayertimes from '../domain/DailyPrayertimes';
import { localityCodeOf } from '../domain/DailyPrayertimes';

jest.mock('../repositories/TimesRepository');
jest.mock('../api/PrayertimesAPI');
describe('PrayertimesDataEffect', () => {
  const localityCode = localityCodeOf('SG-1');
  const date = DailyPrayertimes.dateOnlyFromStr('2022-06-01T00:00:00.000+0800');

  const dto = {
    date: 1,
    month: 6,
    year: 2022,
    localityCode: 'SG-1',
    source_id: 0,
    times: [
      '2022-05-31T21:34:00.000Z',
      '2022-05-31T22:58:00.000Z',
      '2022-06-01T05:04:00.000Z',
      '2022-06-01T08:29:00.000Z',
      '2022-06-01T11:09:00.000Z',
      '2022-06-01T12:23:00.000Z',
    ] as [string, string, string, string, string, string],
    updated: '2022-01-31T03:48:24.352Z',
  };

  afterEach(() => {
    verifyAllWhenMocksCalled();
    resetAllWhenMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  function renderMyHook() {
    const prayertimes = DailyPrayertimes.fromDto(dto);
    when(TimesRepository.getTimesForDay)
      .calledWith(localityCode, date)
      .mockResolvedValueOnce(prayertimes);

    return renderHook(() => usePrayertimesDataEffect(localityCode, date));
  }

  it('should load data from db on first render', async () => {
    const { result } = renderMyHook();

    await waitFor(() => {
      expect(result.current.hasData).toBeTruthy();
      expect(DailyPrayertimes.toDto(result.current.data!)).toEqual(
        DailyPrayertimes.toDto(DailyPrayertimes.fromDto(dto)),
      );
      expect(result.current.downloadDataState).toEqual({ state: 'idle' });
      expect(TimesRepository.getTimesForDay).toHaveBeenCalledTimes(1);
      expect(TimesRepository.getTimesForDay).toHaveBeenCalledWith(
        localityCode,
        date,
      );
    });
  });

  it('should load data for current date if not specified', async () => {
    const today = DailyPrayertimes.dateOnlyFromStr(new Date().toISOString());
    const prayertimes = DailyPrayertimes.fromDto(dto);
    when(TimesRepository.getTimesForDay)
      .calledWith(localityCode, expect.anything())
      .mockResolvedValueOnce(prayertimes);

    const { result, waitForNextUpdate } = renderHook(() =>
      usePrayertimesDataEffect(localityCode),
    );
    await waitForNextUpdate();

    await waitFor(() => {
      expect(result.current.hasData).toBeTruthy();
      expect(DailyPrayertimes.toDto(result.current.data!)).toEqual(
        DailyPrayertimes.toDto(DailyPrayertimes.fromDto(dto)),
      );
      expect(TimesRepository.getTimesForDay).toHaveBeenCalledTimes(1);
      expect(TimesRepository.getTimesForDay).toHaveBeenCalledWith(
        localityCode,
        today,
      );
    });
  });

  it('should set downloadDataState to downloading when downloadData is called', async () => {
    const { result } = renderMyHook();
    result.current.downloadData();

    await waitFor(() => {
      expect(result.current.downloadDataState).toEqual({
        state: 'downloading',
      });
      expect(PrayertimesAPI.getTimesForYear).toHaveBeenCalledTimes(1);
      expect(PrayertimesAPI.getTimesForYear).toBeCalledWith('SG', '1', 2022);
    });
  });

  it('should insert data to db and set downloadDataState to downloaded when downloadData is successful', async () => {
    when(PrayertimesAPI.getTimesForYear)
      .calledWith('SG', '1', 2022)
      .mockResolvedValueOnce([[dto]]);

    const { result } = renderMyHook();
    result.current.downloadData();

    await waitFor(() => {
      expect(result.current.downloadDataState).toEqual({
        state: 'downloaded',
      });
      expect(PrayertimesAPI.getTimesForYear).toHaveBeenCalledTimes(1);
      expect(TimesRepository.upsertTimes).toHaveBeenCalledTimes(1);
      expect(
        DailyPrayertimes.toDto(
          jest.mocked(TimesRepository.upsertTimes).mock.calls[0][0][0],
        ),
      ).toEqual(DailyPrayertimes.toDto(DailyPrayertimes.fromDto(dto)));
    });
  });

  it('should download data for current year when date is not specified', async () => {
    const today = DailyPrayertimes.dateOnlyFromStr(new Date().toISOString());
    when(PrayertimesAPI.getTimesForYear)
      .calledWith('SG', '1', 2022)
      .mockResolvedValueOnce([[dto]]);
    const prayertimes = DailyPrayertimes.fromDto(dto);
    when(TimesRepository.getTimesForDay)
      .calledWith(localityCode, today)
      .mockResolvedValueOnce(prayertimes);

    const { result } = renderHook(() => usePrayertimesDataEffect(localityCode));
    result.current.downloadData();

    await waitFor(() => {
      expect(result.current.downloadDataState).toEqual({
        state: 'downloaded',
      });
      expect(PrayertimesAPI.getTimesForYear).toHaveBeenCalledTimes(1);
      expect(TimesRepository.getTimesForDay).toHaveBeenCalledTimes(2);
      expect(
        DailyPrayertimes.toDto(
          jest.mocked(TimesRepository.upsertTimes).mock.calls[0][0][0],
        ),
      ).toEqual(DailyPrayertimes.toDto(DailyPrayertimes.fromDto(dto)));
    });
  });

  it('should set downloadDataState to error when downloadData failed', async () => {
    const error = new Error('some error');
    when(PrayertimesAPI.getTimesForYear)
      .calledWith('SG', '1', 2022)
      .mockRejectedValueOnce(error);

    const { result } = renderMyHook();
    result.current.downloadData();

    await waitFor(() => {
      expect(result.current.downloadDataState).toEqual({
        state: 'error',
        error,
      });
      expect(PrayertimesAPI.getTimesForYear).toHaveBeenCalledTimes(1);
      expect(TimesRepository.upsertTimes).toHaveBeenCalledTimes(0);
    });
  });

  it('should reload data when localityCode changes', async () => {
    let myLocalityCode = localityCode;
    const localityCodeJHR01 = localityCodeOf('MY-JHR01');

    const prayertimes = DailyPrayertimes.fromDto(dto);
    when(TimesRepository.getTimesForDay)
      .calledWith(localityCode, date)
      .mockResolvedValueOnce(prayertimes);
    when(TimesRepository.getTimesForDay)
      .calledWith(localityCodeJHR01, date)
      .mockResolvedValueOnce(
        DailyPrayertimes.fromDto({ ...dto, localityCode: 'MY-JHR01' }),
      );

    const { result, rerender, waitForNextUpdate } = renderHook(() =>
      usePrayertimesDataEffect(myLocalityCode, date),
    );
    await waitForNextUpdate();
    myLocalityCode = localityCodeJHR01;
    rerender();
    await waitForNextUpdate();

    await waitFor(() => {
      expect(result.current.hasData).toBeTruthy();
      expect(DailyPrayertimes.toDto(result.current.data!)).toEqual(
        DailyPrayertimes.toDto(
          DailyPrayertimes.fromDto({ ...dto, localityCode: 'MY-JHR01' }),
        ),
      );
      expect(TimesRepository.getTimesForDay).toHaveBeenCalledTimes(2);
      expect(TimesRepository.getTimesForDay).toHaveBeenCalledWith(
        localityCodeJHR01,
        date,
      );
    });
  });
});
