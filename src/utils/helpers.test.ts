import { describe, expect, it } from 'vitest'
import {
  capitalize,
  convertTimeBetweenTimeZones,
  createRecordFromKeys,
  formatCelsiusTemperature,
  formatMilliseconds,
  formatTimeFrom24HourClock,
  getRoundedAverage,
  isRecord,
  joinUniqueStrings,
  pickRandomItem,
  splitIsoDateTime,
} from './helpers'

describe('helpers', () => {
  it('detects plain records and rejects nullish values', () => {
    expect(isRecord({ key: 'value' })).toBe(true)
    expect(isRecord(null)).toBe(false)
    expect(isRecord('value')).toBe(false)
  })

  it('builds records from a stable key list', () => {
    expect(createRecordFromKeys(['a', 'b'] as const, () => true)).toEqual({
      a: true,
      b: true,
    })
  })

  it('returns a rounded average when values exist', () => {
    expect(getRoundedAverage([])).toBeNull()
    expect(getRoundedAverage([150, 180, 181])).toBe(170)
  })

  it('formats milliseconds with a fallback placeholder', () => {
    expect(formatMilliseconds(null)).toBe('--')
    expect(formatMilliseconds(180)).toBe('180 ms')
  })

  it('capitalizes strings without changing empty input', () => {
    expect(capitalize('mouse')).toBe('Mouse')
    expect(capitalize('')).toBe('')
  })

  it('formats Celsius temperatures with rounded whole values', () => {
    expect(formatCelsiusTemperature(21.6)).toBe('22°C')
  })

  it('splits ISO date-times into date and short time parts', () => {
    expect(splitIsoDateTime('2026-04-09T14:20')).toEqual({
      date: '2026-04-09',
      time: '14:20',
    })
  })

  it('joins unique defined strings in order', () => {
    expect(joinUniqueStrings(['Edinburgh', 'Scotland', 'United Kingdom'])).toBe(
      'Edinburgh, Scotland, United Kingdom',
    )
    expect(joinUniqueStrings(['Malta', undefined, 'Malta'])).toBe('Malta')
  })

  it('formats 24-hour times into a readable 12-hour clock', () => {
    expect(formatTimeFrom24HourClock('14:30')).toBe('2:30 PM')
    expect(formatTimeFrom24HourClock('bad-value')).toBe('bad-value')
  })

  it('converts a local time between time zones', () => {
    expect(
      convertTimeBetweenTimeZones('2026-04-09', '14:30', 'Europe/Malta', 'Europe/London'),
    ).toBe('13:30')
  })

  it('picks a deterministic random item when a random source is supplied', () => {
    expect(pickRandomItem([], () => 0.5)).toBeNull()
    expect(pickRandomItem(['first', 'second'], () => 0.75)).toBe('second')
  })
})
