import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { when } from 'jest-when';
import React from 'react';
import useDataDownloaderEffect from '../../effects/DataDownloaderEffect';
import { useZonesDataEffect } from '../../effects/ZonesDataEffect';
import { RootStackParamList } from '../../navigation-types';
import PreferencesRepository from '../../repositories/PreferencesRepository';
import OnboardingDownloadPage from './OnboardingDownloadPage';
import * as Zone from '../../domain/Zone';
import { LocationPickerEventEmitter } from '../LocationPickerScreen';

jest.mock('../../effects/ZonesDataEffect');
const mockedUseZonesDataEffect = jest.mocked(useZonesDataEffect);
jest.mock('../../repositories/PreferencesRepository');
jest.mock('../../effects/DataDownloaderEffect');
const mockedUseDataDownloaderEffect = jest.mocked(useDataDownloaderEffect);
jest.mock('@react-navigation/native');
const mockedUseNavigation = jest.mocked(useNavigation);

describe('OnboardingDownloadPage', () => {
  const mockMarkStepAsCompleted = jest.fn();
  const mockedNavigation: NativeStackNavigationProp<
    RootStackParamList,
    'Onboarding'
  > = {
    navigate: jest.fn(),
    setOptions: jest.fn(),
    pop: jest.fn(),
    getParams: jest.fn(),
  } as any;

  const zones = [
    Zone.fromDto({
      code: '2',
      state: 'Johor',
      city: 'Johor Bahru',
      lat: 1.0,
      lng: 0.1,
      timezone: 'Asia/Singapore',
    }),
  ];

  when(PreferencesRepository.getDefaultValues)
    .calledWith()
    .mockReturnValue({ locality_city: '', locality_code: '' } as any);

  describe('when user lands on the page', () => {
    it('should disable Download button when no zone is selected', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: [],
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: false,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Select location')).toBeVisible();
        expect(screen.getByText('Download')).toBeDisabled();
      });
    });

    it('should display Loading... while Zone data is loading', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: [],
        hasData: false,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: false,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );

      expect(screen.getByText('Loading...')).toBeVisible();
    });

    it('should show error when Zone download fails', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: zones,
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'error',
          error: new Error('some error'),
        },
      });
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: false,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            /Unable to download data\. Please try again later\./,
          ),
        ).toBeVisible();
      });
    });

    it('should show currently selected location if exists', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: zones,
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      when(PreferencesRepository.get)
        .calledWith('locality_code')
        .mockResolvedValue('MY-2');
      when(PreferencesRepository.get)
        .calledWith('locality_city')
        .mockResolvedValue('Johor Bahru');

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Johor Bahru, Johor')).not.toBeNull();
      });
    });

    it('should show LocationPicker when dropdown is clicked', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: [],
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: false,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );

      fireEvent.press(screen.getByText('Select location'));

      expect(mockedNavigation.navigate).toHaveBeenCalledWith('LocationPicker', {
        selectedZone: undefined,
      });
    });

    it('should show LocationPicker with selectedZone when dropdown is clicked', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: zones,
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: false,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      when(PreferencesRepository.get)
        .calledWith('locality_code')
        .mockResolvedValue('MY-2');
      when(PreferencesRepository.get)
        .calledWith('locality_city')
        .mockResolvedValue('Johor Bahru');

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );
      await waitFor(() => {
        expect(screen.getByText('Johor Bahru, Johor')).not.toBeNull();
      });
      fireEvent.press(screen.getByText('Johor Bahru, Johor'));

      expect(mockedNavigation.navigate).toHaveBeenCalledWith('LocationPicker', {
        selectedZone: zones[0],
      });
    });
  });

  describe('when user selected a location', () => {
    it('should show user selected location and download button enabled', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: zones,
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: false,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );
      LocationPickerEventEmitter.emit('onZoneSelected', zones[0]);

      await waitFor(() => {
        expect(screen.getByText('Johor Bahru, Johor')).not.toBeNull();
        expect(screen.getByText('Download')).toBeEnabled();
      });
    });

    it('should show disabled Download button when data is already downloaded for the selectedZone', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: zones,
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );
      LocationPickerEventEmitter.emit('onZoneSelected', zones[0]);

      await waitFor(() => {
        expect(screen.getByText('Downloaded!')).toBeDisabled();
      });
    });
  });

  describe('when user clicked Download', () => {
    it('should show Downloading', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: [],
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: false,
        downloadData: () => {},
        downloadDataState: {
          state: 'downloading',
        },
      });

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Downloading...')).toBeDisabled();
      });
    });

    it('should download data', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: zones,
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      const downloadData = jest.fn();
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: false,
        downloadData,
        downloadDataState: {
          state: 'idle',
        },
      });

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );
      LocationPickerEventEmitter.emit('onZoneSelected', zones[0]);
      await waitFor(() => {
        expect(screen.getByText('Download')).toBeEnabled();
      });
      fireEvent.press(screen.getByText('Download'));

      expect(downloadData).toHaveBeenCalled();
    });

    it('should persist selectedZone and call markStepAsCompleted when completed', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: zones,
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'downloaded',
        },
      });

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );
      LocationPickerEventEmitter.emit('onZoneSelected', zones[0]);

      await waitFor(() => {
        expect(PreferencesRepository.set).toHaveBeenCalledWith(
          'locality_city',
          'Johor Bahru',
        );
        expect(PreferencesRepository.set).toHaveBeenCalledWith(
          'locality_code',
          'MY-2',
        );
        expect(mockMarkStepAsCompleted).toHaveBeenCalled();
      });
    });

    it('should show error when download fails', async () => {
      mockedUseNavigation.mockReturnValue(mockedNavigation);
      mockedUseZonesDataEffect.mockReturnValue({
        data: zones,
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      mockedUseDataDownloaderEffect.mockReturnValue({
        hasData: false,
        downloadData: () => {},
        downloadDataState: {
          state: 'error',
          error: new Error('some error'),
        },
      });

      render(
        <OnboardingDownloadPage
          completedSteps={{}}
          markStepAsCompleted={mockMarkStepAsCompleted}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            /Unable to download data\. Please try again later\./,
          ),
        ).toBeVisible();
      });
    });
  });
});
