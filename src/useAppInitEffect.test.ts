import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import { resetAllWhenMocks, verifyAllWhenMocksCalled, when } from 'jest-when';
import DbMigrator from './DbMigrator';
import SystemPreferencesRepository from './repositories/SystemPreferencesRepository';
import SplashScreen from 'react-native-splash-screen';
import useAppInitEffect from './useAppInitEffect';

jest.mock('./Db');
jest.mock('./DbMigrator');
jest.mock('./repositories/SystemPreferencesRepository');

describe('useAppInitEffect', () => {
  beforeEach(() => {
    jest.spyOn(DbMigrator, 'migrate');
    jest.spyOn(SplashScreen, 'hide');
  });

  afterEach(() => {
    verifyAllWhenMocksCalled();
    resetAllWhenMocks();
    jest.restoreAllMocks();
  });

  it('should migrate db on load and set isReady = true and hide splash screen', async () => {
    const { result } = renderHook(() => useAppInitEffect());

    await waitFor(() => {
      expect(result.current.isReady).toBeTruthy();
      expect(DbMigrator.migrate).toHaveBeenCalledTimes(1);
      expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
    });
  });

  it('should set initialRouteName to Onboarding when onboarding is not completed', async () => {
    const { result } = renderHook(() => useAppInitEffect());

    await waitFor(() => {
      expect(result.current.isReady).toBeTruthy();
      expect(result.current.initialRouteName).toEqual('Onboarding');
    });
  });

  it('should set initialRouteName to Main when onboarding is completed', async () => {
    when(SystemPreferencesRepository.get)
      .calledWith('onboarding_completed')
      .mockResolvedValue(true);

    const { result } = renderHook(() => useAppInitEffect());

    await waitFor(() => {
      expect(result.current.isReady).toBeTruthy();
      expect(result.current.initialRouteName).toEqual('Main');
    });
  });
});
