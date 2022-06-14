import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation-types';
import Onboarding from 'react-native-onboarding-swiper';
import Button from 'react-native-ui-lib/button';

type OnboardingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Onboarding'
>;
const OnboardingScreen = (props: OnboardingScreenProps) => {
  const { navigation } = props;
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
          subtitle: (
            <Button label="Done" onPress={() => navigation.replace('Main')} />
          ),
        },
      ]}
      showSkip={false}
      showDone={false}
    />
  );
};

export default OnboardingScreen;
