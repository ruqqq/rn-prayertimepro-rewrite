import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation-types';
import Onboarding from 'react-native-onboarding-swiper';
import Button from 'react-native-ui-lib/button';
import SystemPreferencesRepository from '../repositories/SystemPreferencesRepository';

type OnboardingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Onboarding'
>;
const OnboardingScreen = (props: OnboardingScreenProps) => {
  const { navigation } = props;

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
          title: 'Onboarding',
          subtitle: 'Onboarding text',
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
    />
  );
};

export default OnboardingScreen;
