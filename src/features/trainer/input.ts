import { capitalize } from '../../utils/helpers'
import type { InputToken, MouseInputToken } from './types'

const mouseTokenByButton: Record<number, MouseInputToken> = {
  0: 'mouse-left',
  1: 'mouse-middle',
  2: 'mouse-right',
  3: 'mouse-back',
  4: 'mouse-forward',
}

const displayLabelByToken: Record<string, string> = {
  alt: 'Alt',
  arrowdown: 'Arrow Down',
  arrowleft: 'Arrow Left',
  arrowright: 'Arrow Right',
  arrowup: 'Arrow Up',
  backspace: 'Backspace',
  capslock: 'CapsLock',
  control: 'Ctrl',
  delete: 'Delete',
  end: 'End',
  enter: 'Enter',
  escape: 'Esc',
  home: 'Home',
  meta: 'Meta',
  pagedown: 'Page Down',
  pageup: 'Page Up',
  shift: 'Shift',
  space: 'Space',
  tab: 'Tab',
  'mouse-left': 'Mouse Left',
  'mouse-middle': 'Mouse Middle',
  'mouse-right': 'Mouse Right',
  'mouse-back': 'Mouse Back',
  'mouse-forward': 'Mouse Forward',
}

export function normalizeInputToken(rawToken: string): InputToken | null {
  if (rawToken === ' ') {
    return 'space'
  }

  const normalized = rawToken.trim().toLowerCase()

  if (!normalized || normalized === 'unidentified') {
    return null
  }

  return normalized
}

export function getInputTokenFromKeyboardEvent(
  event: KeyboardEvent,
): InputToken | null {
  if (event.repeat) {
    return null
  }

  return normalizeInputToken(event.key)
}

export function getInputTokenFromMouseEvent(
  event: MouseEvent,
): InputToken | null {
  return mouseTokenByButton[event.button] ?? `mouse-button-${event.button}`
}

export function isNavigationMouseToken(token: InputToken): boolean {
  return token === 'mouse-back' || token === 'mouse-forward'
}

export function formatInputToken(token: InputToken): string {
  if (displayLabelByToken[token]) {
    return displayLabelByToken[token]
  }

  if (token.startsWith('mouse-button-')) {
    return `Mouse ${token.slice('mouse-button-'.length)}`
  }

  if (token.startsWith('mouse-')) {
    return token
      .split('-')
      .map((part) => capitalize(part))
      .join(' ')
  }

  if (token.length === 1) {
    return token.toUpperCase()
  }

  return capitalize(token)
}
