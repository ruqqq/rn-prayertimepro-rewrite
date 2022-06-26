import { DependencyList, EffectCallback, useEffect } from 'react';

export function useCustomEffect<T>(
  callback: EffectCallback,
  deps: DependencyList,
) {
  const customDeps = deps.map(value =>
    Object(value) === value ? JSON.stringify(value) : value,
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, customDeps);
}
