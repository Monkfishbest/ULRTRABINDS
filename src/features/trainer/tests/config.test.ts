import { allActionIds } from '../../../data/weaponCatalog'
import {
  createDefaultTrainerConfig,
  loadTrainerConfig,
  saveTrainerConfig,
  validateTrainerConfig,
} from '../config'
import { describe, expect, it } from 'vitest'
import { useTrainer } from '../useTrainer'
import { renderHook } from '@testing-library/react'

describe('trainer config', () => {
  it('persists settings without carrying over session stats', () => {
    const config = createDefaultTrainerConfig()
    config.weaponBindings.shotgun = 'q'
    config.showTextLabels = true
    config.audioMuted = true
    config.enabledActions['shotgun-2'] = false

    saveTrainerConfig(config)

    const loaded = loadTrainerConfig()
    expect(loaded).toEqual(config)

    const { result } = renderHook(() =>
      useTrainer({
        config: loaded,
        captureActive: false,
      }),
    )

    expect(result.current.state.hitCount).toBe(0)
    expect(result.current.state.missCount).toBe(0)
    expect(result.current.state.reactionTimesMs).toEqual([])
  })

  it('falls back to default audioMuted when the saved config omits it', () => {
    const defaultConfig = createDefaultTrainerConfig()

    window.localStorage.setItem(
      'ultrakill-bind-trainer/v1/config',
      JSON.stringify({
        weaponBindings: defaultConfig.weaponBindings,
        variantBindings: defaultConfig.variantBindings,
        enabledActions: defaultConfig.enabledActions,
        showTextLabels: defaultConfig.showTextLabels,
      }),
    )

    const loaded = loadTrainerConfig()

    expect(loaded.audioMuted).toBe(defaultConfig.audioMuted)
  })

  it('blocks duplicate bindings, zero enabled actions, and active bind capture', () => {
    const config = createDefaultTrainerConfig()
    config.weaponBindings.shotgun = '1'

    for (const actionId of allActionIds) {
      config.enabledActions[actionId] = false
    }

    const errors = validateTrainerConfig(config, true)

    expect(errors).toContain(
      'Each input must be unique. Variant 1 conflicts with Shotgun.',
    )
    expect(errors).toContain('Enable at least one action before starting the trainer.')
    expect(errors).toContain('Finish or cancel the current bind capture before starting.')
  })
})
