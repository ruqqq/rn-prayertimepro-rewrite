import React, { useCallback, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation-types';
import Onboarding from 'react-native-onboarding-swiper';
import { useSystemPreferenceEffect } from '../effects/PreferenceEffect';
import OnboardingDownloadPage from './onboarding/OnboardingDownloadPage';
import OnboardingPermissionsPage from './onboarding/OnboardingPermissionsPage';
import { Button, useTheme } from 'react-native-paper';

type OnboardingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Onboarding'
>;
const OnboardingScreen = (props: OnboardingScreenProps) => {
  const { navigation } = props;
  const theme = useTheme();
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
            backgroundColor: theme.colors.background,
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
            backgroundColor: theme.colors.background,
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
            backgroundColor: theme.colors.background,
            image: <></>,
            title: "You're all set!",
            subtitle: (
              <Button
                mode="contained-tonal"
                disabled={!completedSteps[0] || !completedSteps[1]}
                onPress={onDone}>
                Proceed
              </Button>
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
