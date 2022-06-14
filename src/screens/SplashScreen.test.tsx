import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SplashScreen, { SplashScreenProps } from './SplashScreen';
import * as Db from '../Db';
import DbMigrator from '../DbMigrator';
import { resetAllWhenMocks, verifyAllWhenMocksCalled, when } from 'jest-when';

jest.mock('../Db');
jest.mock('../DbMigrator');

describe('SplashScreen', () => {
  afterEach(() => {
    verifyAllWhenMocksCalled();
    resetAllWhenMocks();
  });

  it('should migrate db and then navigate to onboarding', async () => {
    const props: SplashScreenProps = {
      navigation: {
        replace: jest.fn(),
      } as any,
      route: {} as any,
    };
    when(Db.openDatabase)
      .calledWith('database.db')
      .mockReturnValue({} as any);
    when(DbMigrator.migrate)
      .calledWith(expect.anything(), expect.anything())
      .mockResolvedValue();
    render(<SplashScreen {...props} />);

    await waitFor(() => {
      expect(DbMigrator.migrate).toHaveBeenCalledTimes(1);
      expect(props.navigation.replace).toHaveBeenCalledWith('Onboarding');
    });
  });
});
