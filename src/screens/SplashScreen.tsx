import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Text from 'react-native-ui-lib/text';
import { openDatabase } from '../Db';
import DbMigrator from '../DbMigrator';
import { RootStackParamList } from '../navigation-types';
import ZonesRepository from '../repositories/ZonesRepository';

export type SplashScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Onboarding'
>;

const SplashScreen = (props: SplashScreenProps) => {
  const { navigation } = props;

  useEffect(() => {
    init().then(() => navigation.replace('Onboarding'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
      }}>
      <Text>PrayerTime Pro</Text>
    </View>
  );
};

async function init(): Promise<void> {
  const db = openDatabase('database.db');
  await DbMigrator.migrate(db, [...ZonesRepository.migrations()]);
}

export default SplashScreen;
