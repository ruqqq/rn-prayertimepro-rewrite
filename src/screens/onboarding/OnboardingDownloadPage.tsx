import React, { useEffect, useState } from 'react';
import * as Zone from '../../domain/Zone';
import Picker from 'react-native-ui-lib/picker';
import Text from 'react-native-ui-lib/text';
import View from 'react-native-ui-lib/view';
import Button from 'react-native-ui-lib/button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  localityCodeFrom,
  localityCodeOf,
} from '../../domain/DailyPrayertimes';
import useDataDownloaderEffect from '../../effects/DataDownloaderEffect';
import { usePreferenceEffect } from '../../effects/PreferenceEffect';
import { useZonesDataEffect } from '../../effects/ZonesDataEffect';
import { useCustomEffect } from '../../effects/CustomEffect';

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
  } = useZonesDataEffect();
  const [selectedZone, setSelectedZone] = useState<Zone.T | null>(null);
  const { hasData, downloadData, downloadDataState } = useDataDownloaderEffect(
    selectedZone ? localityCodeFrom(selectedZone) : localityCodeOf('SG-1'),
  );
  const [localityCityPref, setLocalityCityPref] =
    usePreferenceEffect('locality_city');
  const [localityCodePref, setLocalityCodePref] =
    usePreferenceEffect('locality_code');

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
    if (!completedSteps[0] && downloadDataState.state === 'downloaded') {
      markStepAsCompleted();
    }
  }, [markStepAsCompleted, downloadDataState.state, completedSteps[0]]);

  return (
    <View>
      <Text center={true} grey10>
        Thank you for downloading PrayerTime Pro.
      </Text>
      <Text center={true} grey10>
        To get started, select your location/area and touch the Download button.
      </Text>
      <View margin-12 marginT-24>
        {hasZoneData ? (
          <Picker
            migrateTextField
            autoCorrect={false}
            topBarProps={{ title: 'Select Location' }}
            placeholder="Select location"
            showSearch={true}
            trailingAccessory={
              <MaterialCommunityIcons name="chevron-down" size={24} />
            }
            editable={hasZoneData}
            value={selectedZone ? zoneItemKey(selectedZone) : undefined}
            onChange={(item: { label: string; value: string }) => {
              const matchingZone = zoneData.filter(
                zone => zoneItemKey(zone) === item.value,
              )[0];

              setSelectedZone(matchingZone);
              setLocalityCityPref(matchingZone.city.value);
              setLocalityCodePref(matchingZone.localityCode.value);
            }}>
            {zoneData
              .sort((a, b) =>
                `${a.city}, ${a.state}`.localeCompare(`${b.city}, ${b.state}`),
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

        {downloadDataState.state === 'error' ? (
          <Text center={true} marginT-10 red10>
            <MaterialCommunityIcons name="alert-circle" size={18} /> Unable to
            download data. Please try again later.
          </Text>
        ) : undefined}

        <Text center={true} marginT-10 grey30>
          (This will require your device to have access to mobile data/WiFi)
        </Text>
      </View>
    </View>
  );
};

export default OnboardingDownloadPage;

function zoneItemKey(zone: Zone.T) {
  return `${zone.country.value}|${zone.state.value}|${zone.city.value}|${zone.code.value}`;
}

function zoneLabel(zone: Zone.T) {
  return `${zone.city.value}, ${zone.state.value}`;
}
