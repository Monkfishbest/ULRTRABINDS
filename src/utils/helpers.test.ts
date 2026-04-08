import { describe, expect, it } from 'vitest'
import {
  capitalize,
  createRecordFromKeys,
  formatMilliseconds,
  getRoundedAverage,
  isRecord,
  pickRandomItem,
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

  it('picks a deterministic random item when a random source is supplied', () => {
    expect(pickRandomItem([], () => 0.5)).toBeNull()
    expect(pickRandomItem(['first', 'second'], () => 0.75)).toBe('second')
  })
})
