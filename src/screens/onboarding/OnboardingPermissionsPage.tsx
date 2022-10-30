import React, { useState } from 'react';
import { Button, Text } from 'react-native-paper';
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
  markStepAsCompleted,
  completedSteps,
}) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const { permissionsStatus, requestPermissions } = usePermissionsEffect([
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
  ]);

  useCustomEffect(() => {
    const allPermissionsGranted = Object.values(permissionsStatus).every(
      s => s === 'granted',
    );
    setPermissionsGranted(allPermissionsGranted);
    if (allPermissionsGranted && !permissionsGranted && !completedSteps[1]) {
      markStepAsCompleted();
    }
  }, [
    markStepAsCompleted,
    permissionsGranted,
    permissionsStatus,
    completedSteps[1],
  ]);

  return (
    <>
      <Text>
        PreyerTime Pro requires these permissions to be granted to work
        correctly:
      </Text>
      <Text>1. Access to external storage</Text>
      <Text>2. Access to location for qibla function to work</Text>
      <Text>3. Access to send notifications to alert for prayer times</Text>
      <Button
        mode="contained-tonal"
        disabled={permissionsGranted}
        onPress={requestPermissions}
        style={{ marginTop: 24 }}>
        {permissionsGranted ? 'Permissions Granted!' : 'Grant Permission'}
      </Button>
    </>
  );
};

export default OnboardingPermissionsPage;
