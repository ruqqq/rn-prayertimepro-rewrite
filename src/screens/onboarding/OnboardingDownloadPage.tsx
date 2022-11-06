import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as Zone from '../../domain/Zone';
import { Button, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  localityCodeFrom,
  localityCodeOf,
} from '../../domain/DailyPrayertimes';
import useDataDownloaderEffect from '../../effects/DataDownloaderEffect';
import { usePreferenceEffect } from '../../effects/PreferenceEffect';
import { useZonesDataEffect } from '../../effects/ZonesDataEffect';
import { useCustomEffect } from '../../effects/CustomEffect';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation-types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LocationPickerEventEmitter } from '../LocationPickerScreen';

type Props = {
  markStepAsCompleted: () => void;
  completedSteps: Record<number, boolean>;
};

const OnboardingDownloadPage: React.FC<Props> = ({
  markStepAsCompleted,
  completedSteps,
}) => {
  const {
    data: zoneData,
    hasData: hasZoneData,
    downloadData: downloadZoneData,
    downloadDataState: downloadZoneDataState,
  } = useZonesDataEffect();
  const [selectedZone, setSelectedZone] = useState<Zone.T | undefined>(
    undefined,
  );
  const { hasData, downloadData, downloadDataState } = useDataDownloaderEffect(
    selectedZone ? localityCodeFrom(selectedZone) : localityCodeOf('SG-1'),
  );
  const [localityCityPref, setLocalityCityPref] =
    usePreferenceEffect('locality_city');
  const [localityCodePref, setLocalityCodePref] =
    usePreferenceEffect('locality_code');
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'Onboarding'>
    >();

  useEffect(() => {
    if (hasZoneData === false) {
      downloadZoneData();
    }
  }, [downloadZoneData, hasZoneData]);

  useEffect(() => {
    if (!zoneData || !!selectedZone) {
      return;
    }

    const matchingZone = zoneData.filter(
      zone =>
        zone.localityCode.value === localityCodePref &&
        zone.city.value === localityCityPref,
    )[0];
    setSelectedZone(matchingZone);
  }, [localityCityPref, localityCodePref, zoneData, selectedZone]);

  useCustomEffect(() => {
    if (
      selectedZone &&
      downloadDataState.state === 'downloaded' &&
      localityCityPref !== selectedZone.city.value
    ) {
      setLocalityCityPref(selectedZone.city.value);
      setLocalityCodePref(selectedZone.localityCode.value);
    }

    if (!completedSteps[0] && downloadDataState.state === 'downloaded') {
      markStepAsCompleted();
    }
  }, [
    markStepAsCompleted,
    downloadDataState.state,
    completedSteps[0],
    selectedZone,
    localityCityPref,
    setLocalityCodePref,
    setLocalityCityPref,
  ]);

  useEffect(() => {
    const subscription = LocationPickerEventEmitter.addListener(
      'onZoneSelected',
      (item: Zone.T) => {
        setSelectedZone(item);
      },
    );

    return () => subscription.remove();
  }, [setSelectedZone]);

  return (
    <View>
      <Text style={{ textAlign: 'center' }}>
        Thank you for downloading PrayerTime Pro.
      </Text>
      <Text style={{ textAlign: 'center' }}>
        To get started, select your location/area and touch the Download button.
      </Text>
      <View style={{ margin: 12 }}>
        <Button
          mode="outlined"
          icon="chevron-down"
          loading={!hasZoneData}
          disabled={!hasZoneData}
          contentStyle={{ flexDirection: 'row-reverse' }}
          style={{ marginTop: 24, marginBottom: 24 }}
          onPress={() =>
            navigation.navigate('LocationPicker', { selectedZone })
          }>
          {selectedZone
            ? zoneLabel(selectedZone)
            : hasZoneData
            ? 'Select location'
            : 'Loading...'}
        </Button>
        <Button
          mode="contained-tonal"
          disabled={
            !hasZoneData ||
            !selectedZone ||
            hasData ||
            ['downloading', 'downloaded'].some(
              state => state === downloadDataState.state,
            )
          }
          onPress={downloadData}>
          {hasData
            ? 'Downloaded!'
            : downloadDataState.state === 'downloading'
            ? 'Downloading...'
            : 'Download'}
        </Button>

        {downloadZoneDataState.state === 'error' ||
        downloadDataState.state === 'error' ? (
          <Text style={{ textAlign: 'center', marginTop: 10, color: 'red' }}>
            <MaterialCommunityIcons name="alert-circle" size={18} /> Unable to
            download data. Please try again later.
          </Text>
        ) : undefined}

        <Text style={{ textAlign: 'center', marginTop: 10, color: 'grey' }}>
          (This will require your device to have access to mobile data/WiFi)
        </Text>
      </View>
    </View>
  );
};

export default OnboardingDownloadPage;

function zoneLabel(zone: Zone.T) {
  return `${zone.city.value}, ${zone.state.value}`;
}
