export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function createRecordFromKeys<TKey extends PropertyKey, TValue>(
  keys: readonly TKey[],
  createValue: (key: TKey) => TValue,
): Record<TKey, TValue> {
  return Object.fromEntries(keys.map((key) => [key, createValue(key)])) as Record<
    TKey,
    TValue
  >
}

export function getRoundedAverage(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null
  }

  const total = values.reduce((sum, value) => sum + value, 0)
  return Math.round(total / values.length)
}

export function formatMilliseconds(value: number | null, fallback = '--'): string {
  return value === null ? fallback : `${value} ms`
}

export function capitalize(value: string): string {
  if (!value) {
    return value
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function pickRandomItem<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T | null {
  if (items.length === 0) {
    return null
  }

  const selectedIndex = Math.floor(random() * items.length)
  return items[selectedIndex] ?? items[0] ?? null
}
