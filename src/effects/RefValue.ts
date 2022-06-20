import { useRef } from 'react';
import { valueOf, ValueType } from '../domain/utils';

export function useRefValue<
  V extends ValueType<N, T> | undefined,
  N extends string,
  T extends string | number | undefined,
>(value: V, onMutate?: () => void) {
  const ref = useRef(value);
  if (value && ref.current && valueOf(value) !== valueOf(ref.current)) {
    ref.current = value;
    onMutate?.();
  }

  return ref.current;
}
