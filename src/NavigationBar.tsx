import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import React from 'react';
import { Appbar } from 'react-native-paper';

export const NavigationBar: React.FC<NativeStackHeaderProps> = ({
  navigation,
  back,
  options,
}) => {
  return (
    <Appbar.Header statusBarHeight={0}>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content
        title={options?.title ? options.title : 'PrayerTime Pro'}
      />
    </Appbar.Header>
  );
};
