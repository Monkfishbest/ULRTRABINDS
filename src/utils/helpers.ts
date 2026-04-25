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

export function formatCelsiusTemperature(value: number): string {
  return `${Math.round(value)}°C`
}

export function splitIsoDateTime(value: string): { date: string; time: string } {
  const [date = '', fullTime = ''] = value.split('T')

  return {
    date,
    time: fullTime.slice(0, 5),
  }
}

export function joinUniqueStrings(
  values: readonly (string | null | undefined)[],
  separator = ', ',
): string {
  const uniqueValues: string[] = []

  for (const value of values) {
    if (!value || uniqueValues.includes(value)) {
      continue
    }

    uniqueValues.push(value)
  }

  return uniqueValues.join(separator)
}

export function formatTimeFrom24HourClock(time: string): string {
  const [hoursValue, minutesValue] = time.split(':')
  const hours = Number.parseInt(hoursValue ?? '', 10)
  const minutes = Number.parseInt(minutesValue ?? '', 10)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time
  }

  const normalizedHours = ((hours % 24) + 24) % 24
  const meridiem = normalizedHours >= 12 ? 'PM' : 'AM'
  const hour12 = normalizedHours % 12 || 12

  return `${hour12}:${String(minutes).padStart(2, '0')} ${meridiem}`
}

export function convertTimeBetweenTimeZones(
  localDate: string,
  localTime: string,
  fromTimeZone: string,
  toTimeZone: string,
): string {
  const [year, month, day] = localDate.split('-').map((value) => Number.parseInt(value, 10))
  const [hours, minutes] = localTime.split(':').map((value) => Number.parseInt(value, 10))

  if ([year, month, day, hours, minutes].some((value) => Number.isNaN(value))) {
    return ''
  }

  const utcGuess = Date.UTC(year, month - 1, day, hours, minutes)
  let utcDate = new Date(
    utcGuess - getTimeZoneOffsetMinutes(fromTimeZone, new Date(utcGuess)) * 60_000,
  )
  const correctedOffset = getTimeZoneOffsetMinutes(fromTimeZone, utcDate)
  utcDate = new Date(utcGuess - correctedOffset * 60_000)

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: toTimeZone,
  }).format(utcDate)
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

function getTimeZoneOffsetMinutes(timeZone: string, referenceDate: Date): number {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'longOffset',
  })

  const offsetLabel =
    formatter.formatToParts(referenceDate).find((part) => part.type === 'timeZoneName')?.value ??
    'GMT'

  if (offsetLabel === 'GMT' || offsetLabel === 'UTC') {
    return 0
  }

  const match = offsetLabel.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/)

  if (!match) {
    return 0
  }

  const sign = match[1] === '-' ? -1 : 1
  const hours = Number.parseInt(match[2] ?? '0', 10)
  const minutes = Number.parseInt(match[3] ?? '0', 10)

  return sign * (hours * 60 + minutes)
}
