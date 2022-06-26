import React, { useRef, useState } from 'react';
import Button from 'react-native-ui-lib/button';
import { useCustomEffect } from '../../effects/CustomEffect';
import {
  PERMISSIONS,
  usePermissionsEffect,
} from '../../effects/PermissionsEffect';

type Props = {
  markStepAsCompleted: () => void;
  completedSteps: Record<number, boolean>;
};

const OnboardingPermissionsPage: React.FC<Props> = ({
  completedSteps,
  markStepAsCompleted: markStepAsCompletedInput,
}) => {
  const { current: markStepAsCompleted } = useRef(markStepAsCompletedInput);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const { permissionsStatus, requestPermissions } = usePermissionsEffect([
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
  ]);

  useCustomEffect(() => {
    const allPermissionsGranted = Object.values(permissionsStatus).every(
      s => s,
    );
    if (allPermissionsGranted) {
      setPermissionsGranted(true);
      markStepAsCompleted();
    }
  }, [markStepAsCompleted, permissionsStatus]);

  return (
    <>
      <Button
        label="Grant Permission"
        disabled={completedSteps[1] || permissionsGranted}
        onPress={requestPermissions}
      />
    </>
  );
};

export default OnboardingPermissionsPage;
