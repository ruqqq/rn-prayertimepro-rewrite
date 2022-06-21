import { useCallback, useEffect, useState } from 'react';
import GenericPreferencesRepository from '../repositories/GenericPreferencesRepository';
import PreferencesRepository, {
  PreferencesTypes,
} from '../repositories/PreferencesRepository';
import SystemPreferencesRepository, {
  SystemPreferencesTypes,
} from '../repositories/SystemPreferencesRepository';

function useGenericPreferenceEffect<
  T extends PreferencesTypes | SystemPreferencesTypes,
>(
  key: keyof T,
  repo: GenericPreferencesRepository<T, keyof T>,
): [T[keyof T], (val: T[keyof T]) => void] {
  const [value, setValue] = useState(repo.getDefaultValues()[key]);
  useEffect(() => {
    async function asyncFunc() {
      const val = await repo.get(key);
      console.log(`[PreferenceEffect] Retrieved ${String(key)}: ${val}`);
      setValue(val);
    }
    asyncFunc();
  }, [key, repo]);

  const set = useCallback(
    (val: T[keyof T]) => {
      console.log(`[PreferenceEffect] Setting ${String(key)} = ${val}`);
      async function asyncFunc() {
        await repo.set(key, val);
        setValue(val);
      }
      asyncFunc();
    },
    [key, repo],
  );

  return [value, set];
}

export function usePreferenceEffect(key: keyof PreferencesTypes) {
  return useGenericPreferenceEffect(key, PreferencesRepository);
}

export function useSystemPreferenceEffect(key: keyof SystemPreferencesTypes) {
  return useGenericPreferenceEffect(key, SystemPreferencesRepository);
}
