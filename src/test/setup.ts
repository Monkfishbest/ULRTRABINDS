import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, vi } from 'vitest'
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

beforeEach(() => {
  MockAudio.reset()
  MockImage.reset()
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  MockAudio.reset()
  MockImage.reset()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
