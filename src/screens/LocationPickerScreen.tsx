import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DeviceEventEmitter, ListRenderItem, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { List, Searchbar } from 'react-native-paper';
import { RootStackParamList } from '../navigation-types';
import * as Zone from '../domain/Zone';
import { useZonesDataEffect } from '../effects/ZonesDataEffect';

export const LocationPickerEventEmitter = DeviceEventEmitter;

type LocationPickerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'LocationPicker'
>;

const LocationPickerScreen: React.FC<LocationPickerScreenProps> = ({
  navigation,
  route,
}) => {
  const selectedZone: Zone.T | undefined = route.params.selectedZone;
  navigation.setOptions({ title: 'Select Location' });
  const [searchQuery, setSearchQuery] = useState('');

  const { data } = useZonesDataEffect();
  const filteredData = data
    .filter(
      item =>
        !searchQuery ||
        `${item.city.value}|${item.state.value}|${Zone.countryString(
          item.country,
        )}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) =>
      `${a.state}, ${a.city}`.localeCompare(`${b.state}, ${b.city}`),
    );

  const keyExtractor = (item: Zone.T) =>
    `${item.city.value}-${item.localityCode.value}`;

  const renderItem: ListRenderItem<Zone.T> = itemInfo => {
    const { item } = itemInfo;

    const onPress = () => {
      LocationPickerEventEmitter.emit('onZoneSelected', item);
      navigation.pop();
    };

    return (
      <List.Item
        title={item.city.value}
        description={`${item.state.value}, ${item.country.value}`}
        right={
          selectedZone && keyExtractor(item) === keyExtractor(selectedZone)
            ? () => <List.Icon icon="check" />
            : undefined
        }
        onPress={onPress}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Searchbar
        placeholder="e.g. Singapore"
        value={searchQuery}
        onChange={e => setSearchQuery(e.nativeEvent.text)}
      />
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={{ flexGrow: 1 }}
      />
    </View>
  );
};

export default LocationPickerScreen;
