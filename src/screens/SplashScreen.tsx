import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Text from 'react-native-ui-lib/text';
import DbMigrator from '../DbMigrator';
import { RootStackParamList } from '../navigation-types';
import SystemPreferencesRepository from '../repositories/SystemPreferencesRepository';

export type SplashScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Onboarding'
>;

const SplashScreen = (props: SplashScreenProps) => {
  const { navigation } = props;

  useEffect(() => {
    init().then(nextScreen => navigation.replace(nextScreen));
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

async function init(): Promise<'Onboarding' | 'Main'> {
  await DbMigrator.migrate();
  const onboardingCompleted = await SystemPreferencesRepository.get(
    'onboarding_completed',
  );
  return onboardingCompleted ? 'Main' : 'Onboarding';
}

export default SplashScreen;
