import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import LocationPickerScreen, {
  LocationPickerEventEmitter,
} from './LocationPickerScreen';
import * as Zone from '../domain/Zone';
import { useZonesDataEffect } from '../effects/ZonesDataEffect';
import { useNavigation } from '@react-navigation/native';
import { EmitterSubscription } from 'react-native';

jest.mock('@react-navigation/native');
const mockedUseNavigation = jest.mocked(useNavigation);
jest.mock('../effects/ZonesDataEffect');
const mockedUseZonesDataEffect = jest.mocked(useZonesDataEffect);

describe('LocationPickerScreen', () => {
  const zones: Zone.T[] = [
    Zone.fromDto({
      code: '2',
      state: 'Johor',
      city: 'Johor Bahru',
      lat: 1.0,
      lng: 0.1,
      timezone: 'Asia/Singapore',
    }),
    Zone.fromDto({
      code: '1',
      state: 'Singapore',
      city: 'city',
      lat: 1.0,
      lng: 0.1,
      timezone: 'Asia/Singapore',
    }),
  ];
  const navigation = {
    setOptions: jest.fn(),
    pop: jest.fn(),
  };

  beforeEach(() => {
    mockedUseNavigation.mockReturnValue(navigation);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render list items', async () => {
    mockedUseZonesDataEffect.mockReturnValue({
      data: zones,
      hasData: true,
      downloadData: () => {},
      downloadDataState: {
        state: 'idle',
      },
    });
    render(<LocationPickerScreen />);

    expect(screen.getByText('Johor Bahru')).not.toBeNull();
    expect(screen.getByText('Johor, MY')).not.toBeNull();
    expect(screen.getByText('city')).not.toBeNull();
    expect(screen.getByText('Singapore, SG')).not.toBeNull();
  });

  it('should render filter items when there is input in search box (case-insensitive)', async () => {
    mockedUseZonesDataEffect.mockReturnValue({
      data: zones,
      hasData: true,
      downloadData: () => {},
      downloadDataState: {
        state: 'idle',
      },
    });
    render(<LocationPickerScreen />);
    await waitFor(() => expect(screen.getByText('city')).not.toBeNull());

    screen
      .getByPlaceholderText('e.g. Singapore')
      .props.onChange({ nativeEvent: { text: 'jOhoR' } });

    await waitFor(() => {
      expect(screen.getByText('Johor Bahru')).not.toBeNull();
      expect(screen.getByText('Johor, MY')).not.toBeNull();
      expect(screen.queryByText('city')).toBeNull();
      expect(screen.queryByText('Singapore, SG')).toBeNull();
    });
  });

  describe('onZoneSelected', () => {
    let mockListener = jest.fn();
    let subscription: EmitterSubscription | undefined;
    beforeEach(() => {
      mockListener = jest.fn();
      subscription = LocationPickerEventEmitter.addListener(
        'onZoneSelected',
        mockListener,
      );
    });

    afterEach(() => {
      subscription?.remove();
    });

    it('should receive onZoneSelected event on press of list item and dismiss modal', async () => {
      mockedUseZonesDataEffect.mockReturnValue({
        data: zones,
        hasData: true,
        downloadData: () => {},
        downloadDataState: {
          state: 'idle',
        },
      });
      render(<LocationPickerScreen />);

      fireEvent.press(screen.getByText('city'));

      await waitFor(() => {
        expect(mockListener).toHaveBeenCalled();
        expect(mockListener.mock.calls[0][0]).toEqual(zones[1]);
        expect(navigation.pop).toHaveBeenCalled();
      });
    });
  });
});
