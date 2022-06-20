import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import { resetAllWhenMocks, verifyAllWhenMocksCalled, when } from 'jest-when';
import PrayertimesAPI from '../api/PrayertimesAPI';
import HijrisRepository from '../repositories/HijrisRepository';
import { useHijrisDataEffect } from './HijrisDataEffect';
import * as Hijri from '../domain/Hijri';
import { localityCodeOf } from '../domain/DailyPrayertimes';

jest.mock('../repositories/HijrisRepository');
jest.mock('../api/PrayertimesAPI');
describe('HijrisDataEffect', () => {
  const localityCode = localityCodeOf('SG-1');
  const year = 2022;

  const dto = {
    date: 1,
    month: 6,
    year: 2022,
    hijriDate: 1,
    hijriMonth: 2,
    hijriYear: 1500,
    localityCode: 'SG-1',
    source_id: 0,
  };

  afterEach(() => {
    verifyAllWhenMocksCalled();
    resetAllWhenMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  function renderMyHook() {
    const hijris = [Hijri.fromDto(dto)];
    when(HijrisRepository.getHijrisForYear)
      .calledWith(localityCode, year)
      .mockResolvedValueOnce(hijris);

    return renderHook(() => useHijrisDataEffect(localityCode, year));
  }

  it('should load data from db on first render', async () => {
    const { result } = renderMyHook();

    await waitFor(() => {
      expect(result.current.hasData).toBeTruthy();
      expect(result.current.data).toHaveLength(1);
      expect(result.current.downloadDataState).toEqual({ state: 'idle' });
      expect(HijrisRepository.getHijrisForYear).toHaveBeenCalledTimes(1);
    });
  });

  it('should load data for current year if not specified', async () => {
    const hijris = [Hijri.fromDto(dto)];
    when(HijrisRepository.getHijrisForYear)
      .calledWith(localityCode, year)
      .mockResolvedValueOnce(hijris);

    const { result, waitForNextUpdate } = renderHook(() =>
      useHijrisDataEffect(localityCode),
    );
    await waitForNextUpdate();

    await waitFor(() => {
      expect(result.current.hasData).toBeTruthy();
      expect(result.current.data).toHaveLength(1);
      expect(HijrisRepository.getHijrisForYear).toHaveBeenCalledTimes(1);
      expect(HijrisRepository.getHijrisForYear).toHaveBeenCalledWith(
        localityCode,
        year,
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
      expect(PrayertimesAPI.getHijrisForYear).toHaveBeenCalledTimes(1);
      expect(PrayertimesAPI.getHijrisForYear).toBeCalledWith('SG', '1', year);
    });
  });

  it('should insert data to db and set downloadDataState to downloaded when downloadData is successful', async () => {
    when(PrayertimesAPI.getHijrisForYear)
      .calledWith('SG', '1', year)
      .mockResolvedValueOnce([[dto]]);

    const { result } = renderMyHook();
    result.current.downloadData();

    await waitFor(() => {
      expect(result.current.downloadDataState).toEqual({
        state: 'downloaded',
      });
      expect(PrayertimesAPI.getHijrisForYear).toHaveBeenCalledTimes(1);
      expect(HijrisRepository.upsertHijris).toHaveBeenCalledTimes(1);
      expect(
        Hijri.toDto(
          jest.mocked(HijrisRepository.upsertHijris).mock.calls[0][0][0],
        ),
      ).toEqual(dto);
    });
  });

  it('should download data for current year when year is not specified', async () => {
    when(PrayertimesAPI.getHijrisForYear)
      .calledWith('SG', '1', year)
      .mockResolvedValueOnce([[dto]]);
    const hijris = [Hijri.fromDto(dto)];
    when(HijrisRepository.getHijrisForYear)
      .calledWith(localityCode, year)
      .mockResolvedValueOnce(hijris);

    const { result } = renderHook(() => useHijrisDataEffect(localityCode));
    result.current.downloadData();

    await waitFor(() => {
      expect(result.current.downloadDataState).toEqual({
        state: 'downloaded',
      });
      expect(PrayertimesAPI.getHijrisForYear).toHaveBeenCalledTimes(1);
      expect(HijrisRepository.upsertHijris).toHaveBeenCalledTimes(1);
      expect(
        Hijri.toDto(
          jest.mocked(HijrisRepository.upsertHijris).mock.calls[0][0][0],
        ),
      ).toEqual(dto);
    });
  });

  it('should set downloadDataState to error when downloadData failed', async () => {
    const error = new Error('some error');
    when(PrayertimesAPI.getHijrisForYear)
      .calledWith('SG', '1', year)
      .mockRejectedValueOnce(error);

    const { result } = renderMyHook();
    result.current.downloadData();

    await waitFor(() => {
      expect(result.current.downloadDataState).toEqual({
        state: 'error',
        error,
      });
      expect(PrayertimesAPI.getHijrisForYear).toHaveBeenCalledTimes(1);
      expect(HijrisRepository.upsertHijris).toHaveBeenCalledTimes(0);
    });
  });

  it('should reload data when localityCode changes', async () => {
    let myLocalityCode = localityCode;
    const localityCodeJHR01 = localityCodeOf('MY-JHR01');

    const hijris = [Hijri.fromDto(dto)];
    when(HijrisRepository.getHijrisForYear)
      .calledWith(localityCode, year)
      .mockResolvedValueOnce(hijris);
    when(HijrisRepository.getHijrisForYear)
      .calledWith(localityCodeJHR01, year)
      .mockResolvedValueOnce([
        Hijri.fromDto({ ...dto, localityCode: 'MY-JHR01' }),
      ]);

    const { result, rerender, waitForNextUpdate } = renderHook(() =>
      useHijrisDataEffect(myLocalityCode, year),
    );
    await waitForNextUpdate();
    myLocalityCode = localityCodeJHR01;
    rerender();
    await waitForNextUpdate();

    await waitFor(() => {
      expect(result.current.hasData).toBeTruthy();
      expect(result.current.data).toHaveLength(1);
      expect(HijrisRepository.getHijrisForYear).toHaveBeenCalledTimes(2);
      expect(HijrisRepository.getHijrisForYear).toHaveBeenCalledWith(
        localityCodeJHR01,
        year,
      );
    });
  });
});
