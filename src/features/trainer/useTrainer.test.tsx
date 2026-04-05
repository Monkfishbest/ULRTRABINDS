import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { allActionIds } from '../../data/weaponCatalog'
import { createDefaultTrainerConfig } from './config'
import { pickNextActionId, useTrainer } from './useTrainer'
import type { ActionId, TrainerConfig } from './types'
import { MockAudio, MockImage } from '../../test/mediaMocks'

function createSingleActionConfig(actionId: ActionId): TrainerConfig {
  const config = createDefaultTrainerConfig()

  for (const currentActionId of allActionIds) {
    config.enabledActions[currentActionId] = currentActionId === actionId
  }

  return config
}

describe('pickNextActionId', () => {
  it('avoids immediately repeating the previous action when possible', () => {
    expect(
      pickNextActionId(['pistol-1', 'shotgun-1'], 'pistol-1', () => 0),
    ).toBe('shotgun-1')
  })

  it('allows repeats when only one action is enabled', () => {
    expect(pickNextActionId(['pistol-1'], 'pistol-1', () => 0.6)).toBe('pistol-1')
  })
})

describe('useTrainer', () => {
  it('supports pause, resume, and reset without carrying a stale round', () => {
    const config = createSingleActionConfig('shotgun-1')
    let currentNow = 1000

    const { result } = renderHook(() =>
      useTrainer({
        config,
        captureActive: false,
        now: () => currentNow,
        random: () => 0,
      }),
    )

    act(() => {
      result.current.startSession()
    })

    expect(result.current.state.status).toBe('running')
    expect(result.current.state.currentActionId).toBe('shotgun-1')

    act(() => {
      result.current.pauseSession()
    })

    expect(result.current.state.status).toBe('paused')
    expect(result.current.state.currentActionId).toBeNull()

    currentNow = 1200
    act(() => {
      result.current.resumeSession()
    })

    expect(result.current.state.status).toBe('running')
    expect(result.current.state.currentActionId).toBe('shotgun-1')
    expect(result.current.state.hitCount).toBe(0)
    expect(result.current.state.missCount).toBe(0)

    act(() => {
      result.current.resetSession()
    })

    expect(result.current.state.status).toBe('idle')
    expect(result.current.state.hitCount).toBe(0)
    expect(result.current.state.missCount).toBe(0)
    expect(result.current.state.reactionTimesMs).toEqual([])
  })

  it('counts misses, records full-combo reaction time, and advances immediately', () => {
    const config = createSingleActionConfig('shotgun-1')
    let currentNow = 1000

    const { result } = renderHook(() =>
      useTrainer({
        config,
        captureActive: false,
        now: () => currentNow,
        random: () => 0,
      }),
    )

    act(() => {
      result.current.startSession()
    })

    expect(MockImage.sources).toContain('/trainer-images/shotgun-1.png')
    expect(MockAudio.instances).toHaveLength(1)
    expect(MockAudio.instances[0]?.play).not.toHaveBeenCalled()

    currentNow = 1030
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: '1', bubbles: true }),
      )
    })

    expect(result.current.state.missCount).toBe(1)
    expect(result.current.state.stage).toBe('waitingForWeapon')

    currentNow = 1060
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'e', bubbles: true }),
      )
    })

    expect(result.current.state.stage).toBe('waitingForVariant')
    expect(MockAudio.instances[0]?.play).toHaveBeenCalledTimes(1)

    currentNow = 1100
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: '2', bubbles: true }),
      )
    })

    expect(result.current.state.missCount).toBe(2)
    expect(result.current.state.stage).toBe('waitingForVariant')

    currentNow = 1180
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: '1', bubbles: true }),
      )
    })

    expect(result.current.state.hitCount).toBe(1)
    expect(result.current.state.lastReactionTimeMs).toBe(180)
    expect(result.current.state.stage).toBe('waitingForWeapon')
    expect(result.current.state.currentActionId).toBe('shotgun-1')
  })

  it('accepts mouse-back as a weapon binding during live input', () => {
    const config = createSingleActionConfig('pistol-1')

    const { result } = renderHook(() =>
      useTrainer({
        config,
        captureActive: false,
        now: () => 2500,
        random: () => 0,
      }),
    )

    act(() => {
      result.current.startSession()
    })

    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousedown', {
          button: 3,
          bubbles: true,
          cancelable: true,
        }),
      )
    })

    expect(result.current.state.stage).toBe('waitingForVariant')
  })
})
