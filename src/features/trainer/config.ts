import {
  allActionIds,
  defaultVariantBindings,
  defaultWeaponBindings,
  weaponCatalog,
} from '../../data/weaponCatalog'
import { normalizeInputToken } from './input'
import type {
  ActionId,
  InputToken,
  TrainerConfig,
  VariantId,
  WeaponId,
} from './types'
import { variantIds, weaponIds } from './types'

const storageKey = 'ultrakill-bind-trainer/v1/config'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function createDefaultEnabledActions(): Record<ActionId, boolean> {
  return Object.fromEntries(allActionIds.map((actionId) => [actionId, true])) as Record<
    ActionId,
    boolean
  >
}

export function createDefaultTrainerConfig(): TrainerConfig {
  return {
    weaponBindings: { ...defaultWeaponBindings },
    variantBindings: { ...defaultVariantBindings },
    enabledActions: createDefaultEnabledActions(),
    audioEnabled: true,
    showTextLabels: false,
  }
}

export const defaultTrainerConfig = createDefaultTrainerConfig()

function normalizeBindingRecord<T extends string>(
  ids: readonly T[],
  value: unknown,
  defaults: Record<T, InputToken>,
): Record<T, InputToken> {
  const nextBindings = { ...defaults } as Record<T, InputToken>

  if (!isRecord(value)) {
    return nextBindings
  }

  for (const id of ids) {
    const rawToken = value[id]
    if (typeof rawToken !== 'string') {
      continue
    }

    const normalizedToken = normalizeInputToken(rawToken)
    if (normalizedToken) {
      nextBindings[id] = normalizedToken
    }
  }

  return nextBindings
}

function normalizeEnabledActions(value: unknown): Record<ActionId, boolean> {
  const nextEnabledActions = createDefaultEnabledActions()

  if (!isRecord(value)) {
    return nextEnabledActions
  }

  for (const actionId of allActionIds) {
    if (typeof value[actionId] === 'boolean') {
      nextEnabledActions[actionId] = value[actionId] as boolean
    }
  }

  return nextEnabledActions
}

export function loadTrainerConfig(): TrainerConfig {
  if (typeof window === 'undefined') {
    return createDefaultTrainerConfig()
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey)

    if (!rawValue) {
      return createDefaultTrainerConfig()
    }

    const parsed = JSON.parse(rawValue) as unknown

    if (!isRecord(parsed)) {
      return createDefaultTrainerConfig()
    }

    return {
      weaponBindings: normalizeBindingRecord<WeaponId>(
        weaponIds,
        parsed.weaponBindings,
        defaultWeaponBindings,
      ),
      variantBindings: normalizeBindingRecord<VariantId>(
        variantIds,
        parsed.variantBindings,
        defaultVariantBindings,
      ),
      enabledActions: normalizeEnabledActions(parsed.enabledActions),
      audioEnabled:
        typeof parsed.audioEnabled === 'boolean'
          ? parsed.audioEnabled
          : defaultTrainerConfig.audioEnabled,
      showTextLabels:
        typeof parsed.showTextLabels === 'boolean'
          ? parsed.showTextLabels
          : defaultTrainerConfig.showTextLabels,
    }
  } catch {
    return createDefaultTrainerConfig()
  }
}

export function saveTrainerConfig(config: TrainerConfig): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(config))
  } catch {
    // Ignore storage failures so the trainer keeps working offline/private.
  }
}

export function getEnabledActionIds(config: TrainerConfig): ActionId[] {
  return allActionIds.filter((actionId) => config.enabledActions[actionId])
}

export function getAverageReactionTimeMs(reactionTimesMs: number[]): number | null {
  if (reactionTimesMs.length === 0) {
    return null
  }

  const total = reactionTimesMs.reduce((sum, reactionTimeMs) => sum + reactionTimeMs, 0)
  return Math.round(total / reactionTimesMs.length)
}

export function validateTrainerConfig(
  config: TrainerConfig,
  isCaptureActive: boolean,
): string[] {
  const errors: string[] = []
  const seenBindings = new Map<InputToken, string>()

  const bindingTargets = [
    ...weaponIds.map((weaponId) => ({
      token: config.weaponBindings[weaponId],
      label: weaponCatalog[weaponId].label,
    })),
    ...variantIds.map((variantId) => ({
      token: config.variantBindings[variantId],
      label: `Variant ${variantId}`,
    })),
  ]

  for (const bindingTarget of bindingTargets) {
    const token = normalizeInputToken(bindingTarget.token)

    if (!token) {
      errors.push('Every weapon and variant bind must be assigned before training starts.')
      break
    }

    const duplicateLabel = seenBindings.get(token)
    if (duplicateLabel) {
      errors.push(
        `Each input must be unique. ${bindingTarget.label} conflicts with ${duplicateLabel}.`,
      )
      break
    }

    seenBindings.set(token, bindingTarget.label)
  }

  if (getEnabledActionIds(config).length === 0) {
    errors.push('Enable at least one action before starting the trainer.')
  }

  if (isCaptureActive) {
    errors.push('Finish or cancel the current bind capture before starting.')
  }

  return errors
}
