import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation-types';
import Onboarding from 'react-native-onboarding-swiper';
import Button from 'react-native-ui-lib/button';
import SystemPreferencesRepository from '../repositories/SystemPreferencesRepository';
import { View } from 'react-native';
import Text from 'react-native-ui-lib/text';
import Picker from 'react-native-ui-lib/picker';
import { useZonesDataEffect } from '../effects/ZonesDataEffect';
import * as Zone from '../domain/Zone';
import { valueOf } from '../domain/utils';
import useDataDownloaderEffect from '../effects/DataDownloaderEffect';
import { localityCodeFrom, localityCodeOf } from '../domain/DailyPrayertimes';

type OnboardingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Onboarding'
>;
const OnboardingScreen = (props: OnboardingScreenProps) => {
  const { navigation } = props;
  const {
    data: zoneData,
    hasData: hasZoneData,
    downloadData: downloadZoneData,
  } = useZonesDataEffect();
  const [selectedZone, setSelectedZone] = useState<Zone.T | null>(null);
  const { hasData, downloadData, downloadDataState } = useDataDownloaderEffect(
    selectedZone ? localityCodeFrom(selectedZone) : localityCodeOf('SG-1'),
  );

  if (downloadDataState.state === 'error') {
    console.error(downloadDataState.error);
  }

  useEffect(() => {
    if (hasZoneData === false) {
      downloadZoneData();
    }
  }, [downloadZoneData, hasZoneData]);

  async function onDone(): Promise<void> {
    await SystemPreferencesRepository.set('onboarding_completed', true);
    navigation.replace('Main');
  }

  return (
    <Onboarding
      pages={[
        {
          backgroundColor: '#fff',
          image: <></>,
          title: 'Salam!',
          subtitle: (
            <View>
              <Text center={true}>
                Thank you for downloading PrayerTime Pro.
              </Text>
              <Text center={true}>
                To get started, select your location/area and touch the Download
                button.
              </Text>
              <View style={{ margin: 12, marginTop: 24 }}>
                <Picker
                  migrateTextField
                  topBarProps={{ title: 'Location/Area' }}
                  placeholder={
                    hasZoneData ? 'Select location/area' : 'Loading...'
                  }
                  showSearch={true}
                  editable={hasZoneData}
                  value={selectedZone ? zoneItemKey(selectedZone) : undefined}
                  onChange={(item: { label: string; value: string }) => {
                    const itemValueSplit = item.value.split('|');
                    const matchingZone = zoneData.filter(
                      zone =>
                        valueOf(zone.country) === itemValueSplit[0] &&
                        valueOf(zone.state) === itemValueSplit[1] &&
                        valueOf(zone.city) === itemValueSplit[2] &&
                        valueOf(zone.code) === itemValueSplit[3],
                    )[0];

                    setSelectedZone(matchingZone);
                  }}>
                  {zoneData.map(item => (
                    <Picker.Item
                      key={zoneItemKey(item)}
                      value={zoneItemKey(item)}
                      label={`${item.city}, ${item.state}`}
                    />
                  ))}
                </Picker>
                <Button
                  label={
                    hasData
                      ? 'Downloaded!'
                      : downloadDataState.state === 'downloading'
                      ? 'Downloading...'
                      : downloadDataState.state === 'error'
                      ? 'Error'
                      : 'Download'
                  }
                  disabled={
                    !hasZoneData ||
                    !selectedZone ||
                    hasData ||
                    ['downloading', 'downloaded'].some(
                      state => state === downloadDataState.state,
                    )
                  }
                  onPress={downloadData}
                />
                <Text center={true}>
                  (This will require your device to have access to mobile
                  data/WiFi)
                </Text>
              </View>
            </View>
          ),
        },
        {
          backgroundColor: '#fff',
          image: <></>,
          title: 'Onboarding 2',
          subtitle: <Button label="Done" onPress={onDone} />,
        },
      ]}
      showSkip={false}
      showDone={false}
      showNext={hasData}
    />
  );
};

function zoneItemKey(zone: Zone.T) {
  return `${zone.country}|${zone.state}|${zone.city}|${zone.code}`;
}

export default OnboardingScreen;
