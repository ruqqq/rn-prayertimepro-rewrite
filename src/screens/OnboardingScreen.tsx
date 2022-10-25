import React, { useCallback, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation-types';
import Onboarding from 'react-native-onboarding-swiper';
import Button from 'react-native-ui-lib/button';
import { Colors } from 'react-native-ui-lib';
import { useSystemPreferenceEffect } from '../effects/PreferenceEffect';
import OnboardingDownloadPage from './onboarding/OnboardingDownloadPage';
import OnboardingPermissionsPage from './onboarding/OnboardingPermissionsPage';

type OnboardingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Onboarding'
>;
const OnboardingScreen = (props: OnboardingScreenProps) => {
  const { navigation } = props;
  const onboardingRef = useRef<Onboarding>(null);
  const [completedSteps, setCompletedSteps] = useState({
    0: false,
    1: false,
    2: false,
  });
  const [, setOnboardingCompleted] = useSystemPreferenceEffect(
    'onboarding_completed',
  );
  const completeStep = useCallback(
    (stepIndex: number) => {
      setCompletedSteps({ ...completedSteps, [stepIndex]: true });
      onboardingRef?.current?.goNext();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(completedSteps)],
  );
  const completeStep1 = useCallback(() => completeStep(0), [completeStep]);
  const completeStep2 = useCallback(() => completeStep(1), [completeStep]);

  async function onDone(): Promise<void> {
    setOnboardingCompleted(true);
    navigation.replace('Main');
  }

  return (
    <>
      <Onboarding
        ref={onboardingRef}
        pages={[
          {
            backgroundColor: Colors.white,
            image: <></>,
            title: 'Salam!',
            subtitle: (
              <OnboardingDownloadPage
                completedSteps={completedSteps}
                markStepAsCompleted={completeStep1}
              />
            ),
          },
          {
            backgroundColor: Colors.white,
            image: <></>,
            title: 'One more thing',
            subtitle: (
              <OnboardingPermissionsPage
                completedSteps={completedSteps}
                markStepAsCompleted={completeStep2}
              />
            ),
          },
          {
            backgroundColor: Colors.white,
            image: <></>,
            title: "You're all set!",
            subtitle: (
              <Button
                label="Proceed"
                disabled={!completedSteps[0] || !completedSteps[1]}
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
