export type SortDirection = "asc" | "desc"

/**
 * 数値 key による非破壊 sort
 */
export const sortByNumber = <T>(
  values: readonly T[],
  getValue: (v: T) => number,
  direction: SortDirection,
): T[] => {
  const sign = direction === "asc" ? 1 : -1
  return values.toSorted((a, b) => (getValue(a) - getValue(b)) * sign)
}

export const sum = (values: Iterable<number>): number => {
  let total = 0
  for (const v of values) {
    total += v
  }
  return total
}
