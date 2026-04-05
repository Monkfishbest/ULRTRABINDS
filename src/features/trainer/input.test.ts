import { describe, expect, it } from 'vitest'
import {
  formatInputToken,
  getInputTokenFromKeyboardEvent,
  getInputTokenFromMouseEvent,
  normalizeInputToken,
} from './input'

describe('input normalization', () => {
  it('normalizes keyboard tokens case-insensitively', () => {
    expect(normalizeInputToken('E')).toBe('e')
    expect(normalizeInputToken('CapsLock')).toBe('capslock')
    expect(normalizeInputToken(' ')).toBe('space')
  })

  it('ignores repeated keyboard events', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'e',
      repeat: true,
    })

    expect(getInputTokenFromKeyboardEvent(event)).toBeNull()
  })

  it('maps mouse buttons including browser back and forward', () => {
    expect(
      getInputTokenFromMouseEvent(new MouseEvent('mousedown', { button: 3 })),
    ).toBe('mouse-back')
    expect(
      getInputTokenFromMouseEvent(new MouseEvent('mousedown', { button: 4 })),
    ).toBe('mouse-forward')
  })

  it('formats display labels for keyboard and mouse inputs', () => {
    expect(formatInputToken('capslock')).toBe('CapsLock')
    expect(formatInputToken('mouse-back')).toBe('Mouse Back')
    expect(formatInputToken('e')).toBe('E')
  })
})
