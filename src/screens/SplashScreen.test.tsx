import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SplashScreen, { SplashScreenProps } from './SplashScreen';
import DbMigrator from '../DbMigrator';
import { resetAllWhenMocks, verifyAllWhenMocksCalled } from 'jest-when';
import SystemPreferencesRepository from '../repositories/SystemPreferencesRepository';

describe('SplashScreen', () => {
  beforeEach(() => {
    jest.spyOn(DbMigrator, 'migrate');
  });

  afterEach(() => {
    verifyAllWhenMocksCalled();
    resetAllWhenMocks();
    jest.restoreAllMocks();
  });

  it('should migrate db and then navigate to onboarding when onboarding not completed', async () => {
    const props: SplashScreenProps = {
      navigation: {
        replace: jest.fn(),
      } as any,
      route: {} as any,
    };
    render(<SplashScreen {...props} />);

    await waitFor(() => {
      expect(DbMigrator.migrate).toHaveBeenCalledTimes(1);
      expect(props.navigation.replace).toHaveBeenCalledWith('Onboarding');
    });
  });

  it('should skip onboarding when it is already completed', async () => {
    await DbMigrator.migrate([...SystemPreferencesRepository.migrations()]);
    await SystemPreferencesRepository.set('onboarding_completed', true);
    const props: SplashScreenProps = {
      navigation: {
        replace: jest.fn(),
      } as any,
      route: {} as any,
    };
    render(<SplashScreen {...props} />);

    await waitFor(() => {
      expect(props.navigation.replace).toHaveBeenCalledWith('Main');
    });
  });
});
