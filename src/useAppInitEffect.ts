import { useEffect, useState } from 'react';
import Db from './Db';
import DbMigrator from './DbMigrator';
import { RootStackParamList } from './navigation-types';
import SystemPreferencesRepository from './repositories/SystemPreferencesRepository';

export default function useAppInitEffect() {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [initialRouteName, setInitialRouteName] =
    useState<keyof RootStackParamList>('Onboarding');
  useEffect(() => {
    init(setInitialRouteName, setIsReady);
  }, []);

  return { isReady, initialRouteName };
}

async function init(
  setInitialRouteName: (routeName: keyof RootStackParamList) => void,
  setIsReady: (isReady: boolean) => void,
) {
  Db.open();
  await DbMigrator.migrate();
  const onboardingCompleted = await SystemPreferencesRepository.get(
    'onboarding_completed',
  );

  if (onboardingCompleted) {
    setInitialRouteName('Main');
  }
  setIsReady(true);
}
