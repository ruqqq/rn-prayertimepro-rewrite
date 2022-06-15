export type ValueType<
  N extends string,
  T extends string | number | undefined,
> = readonly [N, T];

export function valueOf<
  N extends string,
  T extends string | number | undefined,
>(value: ValueType<N, T>): T {
  return value[1];
}
