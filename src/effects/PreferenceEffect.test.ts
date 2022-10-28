import { renderHook } from '@testing-library/react-native';
import { waitFor } from '@testing-library/react-native';
import add from 'date-fns/add';
import { resetAllWhenMocks, verifyAllWhenMocksCalled, when } from 'jest-when';
import PreferencesRepository from '../repositories/PreferencesRepository';
import SystemPreferencesRepository from '../repositories/SystemPreferencesRepository';
import {
  usePreferenceEffect,
  useSystemPreferenceEffect,
} from './PreferenceEffect';

jest.mock('../repositories/PreferencesRepository');
jest.mock('../repositories/SystemPreferencesRepository');

describe('PreferenceEffect', () => {
  afterEach(() => {
    verifyAllWhenMocksCalled();
    resetAllWhenMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('PreferenceEffect', () => {
    it('should get the value from repo', async () => {
      const firstInstallDate = new Date().toISOString();
      when(PreferencesRepository.getDefaultValues)
        .calledWith()
        .mockReturnValue({ first_install_date: '' } as any);
      when(PreferencesRepository.get)
        .calledWith('first_install_date')
        .mockResolvedValue(firstInstallDate);

      const { result } = renderHook(() =>
        usePreferenceEffect('first_install_date'),
      );

      await waitFor(() => {
        expect(result.current[0]).toEqual(firstInstallDate);
      });
    });

    it('should set the value to repo', async () => {
      const firstInstallDate = new Date().toISOString();
      const newDate = add(new Date(), { days: 1 }).toISOString();
      when(PreferencesRepository.getDefaultValues)
        .calledWith()
        .mockReturnValue({ first_install_date: '' } as any);
      when(PreferencesRepository.get)
        .calledWith('first_install_date')
        .mockResolvedValueOnce(firstInstallDate);
      when(PreferencesRepository.set)
        .calledWith('first_install_date', newDate)
        .mockResolvedValueOnce();

      const { result } = renderHook(() =>
        usePreferenceEffect('first_install_date'),
      );
      result.current[1](newDate);

      await waitFor(() => {
        expect(result.current[0]).toEqual(newDate);
      });
    });
  });

  describe('SystemPreferenceEffect', () => {
    it('should get the value from repo', async () => {
      const jsVersion = '1.0';
      when(SystemPreferencesRepository.getDefaultValues)
        .calledWith()
        .mockReturnValue({ js_version: '' } as any);
      when(SystemPreferencesRepository.get)
        .calledWith('js_version')
        .mockResolvedValue(jsVersion);

      const { result } = renderHook(() =>
        useSystemPreferenceEffect('js_version'),
      );

      await waitFor(() => {
        expect(result.current[0]).toEqual(jsVersion);
      });
    });

    it('should set the value to repo', async () => {
      const jsVersion = '1.0';
      const newJsVersion = '2.0';
      when(SystemPreferencesRepository.getDefaultValues)
        .calledWith()
        .mockReturnValue({ js_version: '' } as any);
      when(SystemPreferencesRepository.get)
        .calledWith('js_version')
        .mockResolvedValue(jsVersion);
      when(SystemPreferencesRepository.set)
        .calledWith('js_version', newJsVersion)
        .mockResolvedValueOnce();

      const { result } = renderHook(() =>
        useSystemPreferenceEffect('js_version'),
      );
      result.current[1](newJsVersion);

      await waitFor(() => {
        expect(result.current[0]).toEqual(newJsVersion);
      });
    });
  });
});
