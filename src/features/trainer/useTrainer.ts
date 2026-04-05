import { useEffect, useEffectEvent, useReducer, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { actionCatalogById } from '../../data/weaponCatalog'
import { getAverageReactionTimeMs, getEnabledActionIds, validateTrainerConfig } from './config'
import {
  getInputTokenFromKeyboardEvent,
  getInputTokenFromMouseEvent,
  isNavigationMouseToken,
} from './input'
import type {
  ActionId,
  InputToken,
  TrainerConfig,
  TrainerSessionState,
} from './types'

interface UseTrainerOptions {
  config: TrainerConfig
  captureActive: boolean
  now?: () => number
  random?: () => number
}

interface UseTrainerResult {
  averageReactionTimeMs: number | null
  currentActionId: ActionId | null
  enabledActionIds: ActionId[]
  state: TrainerSessionState
  validationErrors: string[]
  pauseSession: () => void
  replayCue: () => void
  resetSession: () => void
  resumeSession: () => void
  startSession: () => void
}

type TrainerReducerAction =
  | { type: 'pause' }
  | { type: 'reset' }
  | { type: 'replayCue' }
  | {
      type: 'roundCompleted'
      nextActionId: ActionId
      reactionTimeMs: number
      startedAt: number
    }
  | { type: 'roundStarted'; actionId: ActionId; startedAt: number }
  | { type: 'miss'; message: string }
  | { type: 'weaponMatched' }

export function createInitialTrainerSessionState(): TrainerSessionState {
  return {
    status: 'idle',
    stage: null,
    currentActionId: null,
    previousActionId: null,
    hitCount: 0,
    missCount: 0,
    reactionTimesMs: [],
    roundStartedAt: null,
    lastReactionTimeMs: null,
    feedback: null,
    cuePulseCount: 0,
  }
}

function trainerReducer(
  state: TrainerSessionState,
  action: TrainerReducerAction,
): TrainerSessionState {
  switch (action.type) {
    case 'pause':
      return {
        ...state,
        status: 'paused',
        stage: null,
        currentActionId: null,
        previousActionId: state.currentActionId ?? state.previousActionId,
        roundStartedAt: null,
        feedback: {
          kind: 'paused',
          message: 'Paused. Resume to start a fresh round.',
        },
      }

    case 'reset':
      return createInitialTrainerSessionState()

    case 'replayCue':
      return {
        ...state,
        cuePulseCount: state.cuePulseCount + 1,
      }

    case 'roundStarted':
      return {
        ...state,
        status: 'running',
        stage: 'waitingForWeapon',
        currentActionId: action.actionId,
        previousActionId: state.currentActionId ?? state.previousActionId,
        roundStartedAt: action.startedAt,
        feedback: null,
        cuePulseCount: state.cuePulseCount + 1,
      }

    case 'roundCompleted':
      return {
        ...state,
        status: 'running',
        stage: 'waitingForWeapon',
        currentActionId: action.nextActionId,
        previousActionId: state.currentActionId ?? state.previousActionId,
        hitCount: state.hitCount + 1,
        reactionTimesMs: [...state.reactionTimesMs, action.reactionTimeMs],
        roundStartedAt: action.startedAt,
        lastReactionTimeMs: action.reactionTimeMs,
        feedback: {
          kind: 'correct',
          message: `Correct in ${action.reactionTimeMs} ms.`,
        },
        cuePulseCount: state.cuePulseCount + 1,
      }

    case 'miss':
      return {
        ...state,
        missCount: state.missCount + 1,
        feedback: {
          kind: 'incorrect',
          message: action.message,
        },
      }

    case 'weaponMatched':
      return {
        ...state,
        stage: 'waitingForVariant',
        feedback: {
          kind: 'armed',
          message: 'Weapon locked. Hit the variant key.',
        },
        cuePulseCount: state.cuePulseCount + 1,
      }

    default:
      return state
  }
}

function ensureAudioElement(
  actionId: ActionId,
  audioByActionRef: MutableRefObject<Partial<Record<ActionId, HTMLAudioElement>>>,
  failedAudioActionsRef: MutableRefObject<Set<ActionId>>,
): HTMLAudioElement | null {
  const failedAudioActions = failedAudioActionsRef.current

  if (!failedAudioActions) {
    return null
  }

  if (failedAudioActions.has(actionId)) {
    return null
  }

  const existingAudio = audioByActionRef.current?.[actionId]
  if (existingAudio) {
    return existingAudio
  }

  const audioPath = actionCatalogById[actionId].audioPath
  if (!audioPath) {
    failedAudioActions.add(actionId)
    return null
  }

  try {
    const audio = new Audio(audioPath)
    audio.preload = 'auto'
    audioByActionRef.current = {
      ...audioByActionRef.current,
      [actionId]: audio,
    }
    return audio
  } catch {
    failedAudioActions.add(actionId)
    return null
  }
}

export function pickNextActionId(
  enabledActionIds: ActionId[],
  previousActionId: ActionId | null,
  random: () => number = Math.random,
): ActionId | null {
  if (enabledActionIds.length === 0) {
    return null
  }

  const actionPool =
    previousActionId && enabledActionIds.length > 1
      ? enabledActionIds.filter((actionId) => actionId !== previousActionId)
      : enabledActionIds

  const selectedIndex = Math.floor(random() * actionPool.length)
  return actionPool[selectedIndex] ?? actionPool[0] ?? null
}

export function useTrainer({
  config,
  captureActive,
  now = () => performance.now(),
  random = Math.random,
}: UseTrainerOptions): UseTrainerResult {
  const [state, dispatch] = useReducer(
    trainerReducer,
    undefined,
    createInitialTrainerSessionState,
  )
  const audioByActionRef = useRef<Partial<Record<ActionId, HTMLAudioElement>>>({})
  const failedAudioActionsRef = useRef(new Set<ActionId>())

  const enabledActionIds = getEnabledActionIds(config)
  const validationErrors = validateTrainerConfig(config, captureActive)
  const averageReactionTimeMs = getAverageReactionTimeMs(state.reactionTimesMs)

  function playActionAudio(actionId: ActionId) {
    if (!config.audioEnabled) {
      return
    }

    const audio = ensureAudioElement(
      actionId,
      audioByActionRef,
      failedAudioActionsRef,
    )

    if (!audio) {
      return
    }

    audio.currentTime = 0
    void audio.play().catch(() => undefined)
  }

  function primeMedia() {
    for (const actionId of enabledActionIds) {
      const image = new Image()
      image.src = actionCatalogById[actionId].imagePath
    }

    if (!config.audioEnabled) {
      return
    }

    for (const actionId of enabledActionIds) {
      const audio = ensureAudioElement(
        actionId,
        audioByActionRef,
        failedAudioActionsRef,
      )
      audio?.load()
    }
  }

  function startFreshRound() {
    if (enabledActionIds.length === 0) {
      return
    }

    const actionId = pickNextActionId(
      enabledActionIds,
      state.currentActionId ?? state.previousActionId,
      random,
    )

    if (!actionId) {
      return
    }

    dispatch({
      type: 'roundStarted',
      actionId,
      startedAt: now(),
    })
  }

  const handleInputToken = useEffectEvent((token: InputToken) => {
    if (!state.currentActionId || state.status !== 'running' || !state.stage) {
      return
    }

    const currentAction = actionCatalogById[state.currentActionId]
    const expectedWeaponToken = config.weaponBindings[currentAction.weaponId]
    const expectedVariantToken = config.variantBindings[currentAction.variantId]

    if (state.stage === 'waitingForWeapon') {
      if (token === expectedWeaponToken) {
        dispatch({ type: 'weaponMatched' })
        playActionAudio(currentAction.id)
        return
      }

      dispatch({
        type: 'miss',
        message: 'Incorrect weapon bind.',
      })
      return
    }

    if (token === expectedVariantToken) {
      const reactionTimeMs = Math.max(
        0,
        Math.round(now() - (state.roundStartedAt ?? now())),
      )
      const nextActionId =
        pickNextActionId(enabledActionIds, currentAction.id, random) ?? currentAction.id

      dispatch({
        type: 'roundCompleted',
        nextActionId,
        reactionTimeMs,
        startedAt: now(),
      })
      return
    }

    dispatch({
      type: 'miss',
      message: 'Incorrect variant.',
    })
  })

  useEffect(() => {
    const trainingInputActive =
      state.status === 'running' &&
      Boolean(state.currentActionId) &&
      state.stage !== null &&
      !captureActive

    if (!trainingInputActive) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const token = getInputTokenFromKeyboardEvent(event)
      if (!token) {
        return
      }

      handleInputToken(token)
    }

    const handleMouseDown = (event: MouseEvent) => {
      const token = getInputTokenFromMouseEvent(event)
      if (!token) {
        return
      }

      if (isNavigationMouseToken(token)) {
        event.preventDefault()
        event.stopPropagation()
      }

      handleInputToken(token)
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('mousedown', handleMouseDown, {
      capture: true,
      passive: false,
    })

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('mousedown', handleMouseDown, true)
    }
  }, [captureActive, state.currentActionId, state.stage, state.status])

  function startSession() {
    if (validationErrors.length > 0) {
      return
    }

    primeMedia()
    startFreshRound()
  }

  function pauseSession() {
    dispatch({ type: 'pause' })
  }

  function resumeSession() {
    if (validationErrors.length > 0) {
      return
    }

    primeMedia()
    startFreshRound()
  }

  function resetSession() {
    dispatch({ type: 'reset' })
  }

  function replayCue() {
    if (!state.currentActionId || state.status !== 'running' || !state.stage) {
      return
    }

    dispatch({ type: 'replayCue' })

    if (state.stage === 'waitingForVariant') {
      playActionAudio(state.currentActionId)
    }
  }

  return {
    averageReactionTimeMs,
    currentActionId: state.currentActionId,
    enabledActionIds,
    state,
    validationErrors,
    pauseSession,
    replayCue,
    resetSession,
    resumeSession,
    startSession,
  }
}
