import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'
import { MockAudio, MockImage } from './mediaMocks'

beforeAll(() => {
  Object.defineProperty(globalThis, 'Audio', {
    configurable: true,
    writable: true,
    value: MockAudio,
  })

  Object.defineProperty(globalThis, 'Image', {
    configurable: true,
    writable: true,
    value: MockImage,
  })
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  MockAudio.reset()
  MockImage.reset()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
