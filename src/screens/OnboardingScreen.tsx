import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation-types';
import Onboarding from 'react-native-onboarding-swiper';
import Button from 'react-native-ui-lib/button';
import { useSystemPreferenceEffect } from '../effects/PreferenceEffect';
import OnboardingDownloadPage from './onboarding/OnboardingDownloadPage';

type OnboardingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Onboarding'
>;
const OnboardingScreen = (props: OnboardingScreenProps) => {
  const { navigation } = props;
  const [completedSteps, setCompletedSteps] = useState({
    0: false,
    1: false,
    2: false,
  });
  const [, setOnboardingCompleted] = useSystemPreferenceEffect(
    'onboarding_completed',
  );

  async function onDone(): Promise<void> {
    setOnboardingCompleted(true);
    navigation.replace('Main');
  }

  return (
    <>
      <Onboarding
        pages={[
          {
            backgroundColor: '#fff',
            image: <></>,
            title: 'Salam!',
            subtitle: (
              <OnboardingDownloadPage
                markStepAsCompleted={() =>
                  setCompletedSteps({ ...completedSteps, 0: true })
                }
              />
            ),
          },
          {
            backgroundColor: '#fff',
            image: <></>,
            title: 'Permissions',
            subtitle: (
              <Button label="Grant Permission" disabled={completedSteps[0]} />
            ),
          },
          {
            backgroundColor: '#fff',
            image: <></>,
            title: "You're all set!",
            subtitle: (
              <Button
                label="Proceed"
                disabled={completedSteps[0] && completedSteps[1]}
                onPress={onDone}
              />
            ),
          },
        ]}
        showSkip={false}
        showDone={false}
      />
    </>
  );
};

export default OnboardingScreen;
