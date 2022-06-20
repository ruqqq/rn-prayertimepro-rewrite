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
                {hasZoneData ? (
                  <Picker
                    migrateTextField
                    topBarProps={{ title: 'Location/Area' }}
                    placeholder="Select location/area"
                    showSearch={true}
                    editable={hasZoneData}
                    value={selectedZone ? zoneItemKey(selectedZone) : undefined}
                    onChange={(item: { label: string; value: string }) => {
                      const matchingZone = zoneData.filter(
                        zone => zoneItemKey(zone) === item.value,
                      )[0];

                      setSelectedZone(matchingZone);
                    }}>
                    {zoneData
                      .sort((a, b) =>
                        `${a.city}, ${a.state}`.localeCompare(
                          `${b.city}, ${b.state}`,
                        ),
                      )
                      .map(item => (
                        <Picker.Item
                          key={zoneItemKey(item)}
                          value={zoneItemKey(item)}
                          label={zoneLabel(item)}
                        />
                      ))}
                  </Picker>
                ) : (
                  <Picker
                    key="Loading Picker"
                    migrateTextField
                    placeholder="Loading..."
                    editable={false}
                  />
                )}
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
          title: 'Permissions',
          subtitle: <Button label="Grant Permission" disabled={!hasData} />,
        },
        {
          backgroundColor: '#fff',
          image: <></>,
          title: "You're all set!",
          subtitle: (
            <Button label="Proceed" disabled={!hasData} onPress={onDone} />
          ),
        },
      ]}
      showSkip={false}
      showDone={false}
    />
  );
};

function zoneItemKey(zone: Zone.T) {
  return `${zone.country}|${zone.state}|${zone.city}|${zone.code}`;
}

function zoneLabel(zone: Zone.T) {
  return `${zone.city}, ${zone.state}`;
}

export default OnboardingScreen;
