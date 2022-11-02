import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react-native';
import LocationPickerScreen, {
  LocationPickerEventEmitter,
} from './LocationPickerScreen';
import * as Zone from '../domain/Zone';
import { useZonesDataEffect } from '../effects/ZonesDataEffect';
import { EmitterSubscription } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation-types';
import { RouteProp } from '@react-navigation/native';

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
  const navigation: NativeStackNavigationProp<
    RootStackParamList,
    'LocationPicker'
  > = {
    setOptions: jest.fn(),
    pop: jest.fn(),
    getParams: jest.fn(),
  } as any;

  const route: RouteProp<RootStackParamList, 'LocationPicker'> = {
    key: '',
    name: 'LocationPicker',
    params: {},
  };

  beforeEach(() => {});

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
    render(<LocationPickerScreen navigation={navigation} route={route} />);

    expect(screen.getByText('Johor Bahru')).not.toBeNull();
    expect(screen.getByText('Johor, MY')).not.toBeNull();
    expect(screen.getByText('city')).not.toBeNull();
    expect(screen.getByText('Singapore, SG')).not.toBeNull();
  });

  it('should show no indicators', async () => {
    mockedUseZonesDataEffect.mockReturnValue({
      data: zones,
      hasData: true,
      downloadData: () => {},
      downloadDataState: {
        state: 'idle',
      },
    });
    render(<LocationPickerScreen navigation={navigation} route={route} />);

    expect(screen.queryByText(/󰄬/)).toBeNull();
  });

  it('should show indicator for existing selected item', async () => {
    mockedUseZonesDataEffect.mockReturnValue({
      data: zones,
      hasData: true,
      downloadData: () => {},
      downloadDataState: {
        state: 'idle',
      },
    });
    render(
      <LocationPickerScreen
        navigation={navigation}
        route={{ ...route, params: { selectedZone: zones[0] } }}
      />,
    );

    expect(
      within(
        screen.getByText('Johor Bahru').parent?.parent?.parent?.parent!,
      ).getByText(/󰄬/),
    ).not.toBeNull();
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
    render(<LocationPickerScreen navigation={navigation} route={route} />);
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
      render(<LocationPickerScreen navigation={navigation} route={route} />);

      fireEvent.press(screen.getByText('city'));

      await waitFor(() => {
        expect(mockListener).toHaveBeenCalled();
        expect(mockListener.mock.calls[0][0]).toEqual(zones[1]);
        expect(navigation.pop).toHaveBeenCalled();
      });
    });
  });
});
