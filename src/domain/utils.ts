export type ValueType<
  N extends string,
  T extends string | number | undefined,
> = {
  type: N;
  value: T;
};

export function valueOf<
  N extends string,
  T extends string | number | undefined,
>(value: ValueType<N, T>): T {
  return value.value;
}
