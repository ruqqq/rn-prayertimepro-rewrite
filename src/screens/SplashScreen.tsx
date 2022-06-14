import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Text from 'react-native-ui-lib/text';
import { RootStackParamList } from '../navigation-types';

type SplashScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Onboarding'
>;

const SplashScreen = (props: SplashScreenProps) => {
  const { navigation } = props;

  useEffect(() => {
    setTimeout(() => navigation.replace('Onboarding'), 500);
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

export default SplashScreen;
