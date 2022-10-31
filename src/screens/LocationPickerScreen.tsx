import React, { useEffect } from 'react';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { ListRenderItem, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Searchbar, Text } from 'react-native-paper';
import { RootStackParamList } from '../navigation-types';
import * as Zone from '../domain/Zone';
import { useZonesDataEffect } from '../effects/ZonesDataEffect';
import { useNavigation } from '@react-navigation/native';

type LocationPickerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'LocationPicker'
>;

const LocationPickerScreen = (props: LocationPickerScreenProps) => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'LocationPicker'>
    >();
  useEffect(() => {
    navigation.setOptions({ title: 'Select Location' });
  }, [navigation]);

  const { data } = useZonesDataEffect();

  return (
    <View style={{ flex: 1 }}>
      <Searchbar placeholder="e.g. Singapore" value="" />
      <FlatList data={data} renderItem={renderItem} style={{ flexGrow: 1 }} />
    </View>
  );
};

const renderItem: ListRenderItem<Zone.T> = itemInfo => {
  const { item } = itemInfo;

  return (
    <View>
      <Text>
        {item.city.value}, {item.state.value}, {item.country.value}
      </Text>
    </View>
  );
};

export default LocationPickerScreen;
