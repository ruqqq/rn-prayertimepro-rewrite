import { renderHook } from '@testing-library/react-native';
import { waitFor } from '@testing-library/react-native';
import { resetAllWhenMocks, verifyAllWhenMocksCalled, when } from 'jest-when';
import PrayertimesAPI from '../api/PrayertimesAPI';
import ZonesRepository from '../repositories/ZonesRepository';
import { useZonesDataEffect } from './ZonesDataEffect';
import * as Zone from '../domain/Zone';

jest.mock('../repositories/ZonesRepository');
jest.mock('../api/PrayertimesAPI');
describe('ZonesDataEffect', () => {
  afterEach(() => {
    verifyAllWhenMocksCalled();
    resetAllWhenMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  function renderMyHook() {
    const zones: Zone.T[] = [
      Zone.fromDto({
        code: '1',
        state: 'Singapore',
        city: 'Singapore',
        lat: 1.0,
        lng: 0.1,
        timezone: 'Asia/Singapore',
      }),
    ];
    when(ZonesRepository.getZones).calledWith().mockResolvedValueOnce(zones);

    return renderHook(() => useZonesDataEffect());
  }

  it('should load data from db on first render', async () => {
    const { result } = renderMyHook();

    await waitFor(() => {
      expect(result.current.hasData).toBeTruthy();
      expect(result.current.data).toHaveLength(1);
      expect(result.current.downloadDataState).toEqual({ state: 'idle' });
      expect(ZonesRepository.getZones).toHaveBeenCalledTimes(1);
    });
  });

  it('should set downloadDataState to downloading when downloadData is called', async () => {
    const dto = {
      code: '1',
      state: 'Singapore',
      city: 'Singapore',
      lat: 1.0,
      lng: 0.1,
      timezone: 'Asia/Singapore',
    };

    when(PrayertimesAPI.getZones)
      .calledWith()
      .mockReturnValueOnce(
        new Promise(r =>
          setTimeout(
            () =>
              r({
                Singapore: [dto],
              }),
            1000,
          ),
        ),
      );

    const { result } = renderMyHook();
    result.current.downloadData();

    await waitFor(() => {
      expect(result.current.downloadDataState).toEqual({
        state: 'downloading',
      });
      expect(PrayertimesAPI.getZones).toHaveBeenCalledTimes(1);
    });
  });

  it('should insert data to db and set downloadDataState to downloaded when downloadData is successful', async () => {
    const dto = {
      code: '1',
      state: 'Singapore',
      city: 'Singapore',
      lat: 1.0,
      lng: 0.1,
      timezone: 'Asia/Singapore',
    };

    when(PrayertimesAPI.getZones)
      .calledWith()
      .mockResolvedValueOnce({
        Singapore: [dto],
      });

    const { result } = renderMyHook();
    result.current.downloadData();

    await waitFor(() => {
      expect(result.current.downloadDataState).toEqual({
        state: 'downloaded',
      });
      expect(PrayertimesAPI.getZones).toHaveBeenCalledTimes(1);
      expect(ZonesRepository.replaceZones).toHaveBeenCalledTimes(1);
      expect(
        Zone.toDto(
          jest.mocked(ZonesRepository.replaceZones).mock.calls[0][0][0],
        ),
      ).toEqual(dto);
    });
  });

  it('should set downloadDataState to error when downloadData failed', async () => {
    const error = new Error('some error');
    when(PrayertimesAPI.getZones).calledWith().mockRejectedValueOnce(error);

    const { result } = renderMyHook();
    result.current.downloadData();

    await waitFor(() => {
      expect(result.current.downloadDataState).toEqual({
        state: 'error',
        error,
      });
      expect(PrayertimesAPI.getZones).toHaveBeenCalledTimes(1);
      expect(ZonesRepository.replaceZones).toHaveBeenCalledTimes(0);
    });
  });
});
