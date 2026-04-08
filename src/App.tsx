import { useEffect, useState } from 'react'
import './App.css'
import { actionCatalogById } from './data/weaponCatalog'
import {
  getInputTokenFromKeyboardEvent,
  getInputTokenFromMouseEvent,
  isNavigationMouseToken,
} from './features/trainer/input'
import {
  createDefaultTrainerConfig,
  loadTrainerConfig,
  saveTrainerConfig,
} from './features/trainer/config'
import { SettingsPanel } from './features/trainer/SettingsPanel'
import { useTrainer } from './features/trainer/useTrainer'
import type {
  ActionId,
  BindingCaptureTarget,
  FeedbackKind,
  InputToken,
  RoundStage,
  TrainerConfig,
  TrainerStatus,
} from './features/trainer/types'
import { formatMilliseconds } from './utils/helpers'

const stageCopyByKey: Record<'idle' | RoundStage, { title: string; hint: string }> = {
  idle: {
    title: 'Ready to drill',
    hint: 'Start the trainer, match the weapon first, then finish on the correct variant.',
  },
  waitingForWeapon: {
    title: 'Step 1: Select the weapon',
    hint: 'The cue is live. Hit the weapon bind before you move to the variant.',
  },
  waitingForVariant: {
    title: 'Step 2: Confirm the variant',
    hint: 'Weapon accepted. Finish the combo with the variant bind.',
  },
}

const feedbackToneByKind: Record<FeedbackKind, string> = {
  armed: 'is-armed',
  correct: 'is-correct',
  incorrect: 'is-incorrect',
}

function getStageCopy(
  status: TrainerStatus,
  stage: RoundStage | null,
): { title: string; hint: string } {
  return status === 'idle' || stage === null ? stageCopyByKey.idle : stageCopyByKey[stage]
}

function App() {
  const [config, setConfig] = useState<TrainerConfig>(() => loadTrainerConfig())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [captureTarget, setCaptureTarget] = useState<BindingCaptureTarget>(null)

  const {
    averageReactionTimeMs,
    currentActionId,
    resetSession,
    startSession,
    state,
    validationErrors,
  } = useTrainer({
    config,
    captureActive: captureTarget !== null,
  })

  useEffect(() => {
    saveTrainerConfig(config)
  }, [config])

  useEffect(() => {
    if (!captureTarget) {
      return
    }

    const commitBinding = (token: InputToken) => {
      setConfig((currentConfig) => {
        if (captureTarget.scope === 'weapon') {
          return {
            ...currentConfig,
            weaponBindings: {
              ...currentConfig.weaponBindings,
              [captureTarget.id]: token,
            },
          }
        }

        return {
          ...currentConfig,
          variantBindings: {
            ...currentConfig.variantBindings,
            [captureTarget.id]: token,
          },
        }
      })

      setCaptureTarget(null)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const token = getInputTokenFromKeyboardEvent(event)

      if (!token) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      commitBinding(token)
    }

    const handleMouseDown = (event: MouseEvent) => {
      const token = getInputTokenFromMouseEvent(event)

      if (!token) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      if (isNavigationMouseToken(token)) {
        event.stopImmediatePropagation?.()
      }

      commitBinding(token)
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
  }, [captureTarget])

  const currentAction = currentActionId ? actionCatalogById[currentActionId] : null
  const settingsLocked = state.status === 'running'
  const canStart = state.status === 'idle' && validationErrors.length === 0
  const canReset =
    state.hitCount > 0 ||
    state.missCount > 0 ||
    state.status === 'running'
  const activeView = settingsOpen ? 'settings' : 'trainer'
  const stageCopy = getStageCopy(state.status, state.stage)

  function toggleAction(actionId: ActionId) {
    setConfig((currentConfig) => ({
      ...currentConfig,
      enabledActions: {
        ...currentConfig.enabledActions,
        [actionId]: !currentConfig.enabledActions[actionId],
      },
    }))
  }

  function toggleSettingsView() {
    setSettingsOpen((open) => {
      const nextOpen = !open

      if (nextOpen) {
        setCaptureTarget(null)
        resetSession()
      }

      return nextOpen
    })
  }

  function toggleMute() {
    setConfig((currentConfig) => ({
      ...currentConfig,
      audioMuted: !currentConfig.audioMuted,
    }))
  }

  const feedbackTone = state.feedback ? feedbackToneByKind[state.feedback.kind] : 'is-neutral'

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div className="title-block">
          <h1>ULTRABINDS</h1>
          <h2>Because Sisyphus isn't going to P rank itself.</h2>
        </div>

        <div className="top-bar-actions">
          <button className="ghost-button" aria-pressed={config.audioMuted} onClick={toggleMute}>
            {config.audioMuted ? 'Unmute' : 'Mute'}
          </button>
          <button className="ghost-button" onClick={toggleSettingsView}>
            {settingsOpen ? 'Trainer' : 'Settings'}
          </button>
        </div>
      </header>

      {validationErrors.length > 0 ? (
        <section className="validation-strip" aria-live="polite">
          <h2>Start is blocked</h2>
          <ul>
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="view-shell">
        {activeView === 'trainer' ? (
          <section className="trainer-panel">
            <div className={`cue-frame ${feedbackTone}`} key={`${currentActionId ?? 'idle'}-${state.cuePulseCount}`}>
              <div className="cue-frame__header">
                <p className="cue-step">{stageCopy.title}</p>
                <p className="cue-hint">{stageCopy.hint}</p>
              </div>

              <div className="cue-frame__body">
                {currentAction ? (
                  <img
                    className="cue-image"
                    src={currentAction.imagePath}
                    alt={config.showTextLabels ? currentAction.label : ''}
                  />
                ) : (
                  <div className="cue-fallback">
                    <span className="cue-fallback__variant">IDLE</span>
                    <strong>Press Start to begin</strong>
                    <p>Your first prompt will appear here.</p>
                  </div>
                )}

                {currentAction && config.showTextLabels ? (
                  <div className="cue-caption">
                    <span>{currentAction.label}</span>
                  </div>
                ) : null}

                <div className="cue-actions">
                  <button className="primary-button" disabled={!canStart} onClick={startSession}>
                    Start
                  </button>
                  <button className="danger-button" disabled={!canReset} onClick={resetSession}>
                    Reset
                  </button>
                </div>
              </div>

              <div className={`feedback-panel ${feedbackTone}`}>
                <p className="feedback-label">Feedback</p>
                <strong>
                  {state.feedback?.message ??
                    'Wrong keys count immediately and the prompt will hold until you finish it.'}
                </strong>
              </div>
            </div>

            <div className="stats-grid">
              <article className="stat-card">
                <span>Hits</span>
                <strong>{state.hitCount}</strong>
              </article>
              <article className="stat-card">
                <span>Misses</span>
                <strong>{state.missCount}</strong>
              </article>
              <article className="stat-card">
                <span>Average</span>
                <strong>{formatMilliseconds(averageReactionTimeMs)}</strong>
              </article>
              <article className="stat-card">
                <span>Last</span>
                <strong>{formatMilliseconds(state.lastReactionTimeMs)}</strong>
              </article>
              <article className="stat-card">
                <span>Current</span>
                <strong>{currentAction ? currentAction.label : '--'}</strong>
              </article>
              <article className="stat-card">
                <span>Previous</span>
                <strong>
                  {state.previousActionId ? actionCatalogById[state.previousActionId].label : '--'}
                </strong>
              </article>
            </div>
          </section>
        ) : (
          <SettingsPanel
            captureTarget={captureTarget}
            config={config}
            settingsLocked={settingsLocked}
            onCancelCapture={() => setCaptureTarget(null)}
            onCaptureVariantBinding={(variantId) =>
              setCaptureTarget({ scope: 'variant', id: variantId })
            }
            onCaptureWeaponBinding={(weaponId) =>
              setCaptureTarget({ scope: 'weapon', id: weaponId })
            }
            onRestoreDefaults={() => {
              setCaptureTarget(null)
              setConfig(createDefaultTrainerConfig())
            }}
            onShowTextLabelsChange={(showTextLabels) =>
              setConfig((currentConfig) => ({
                ...currentConfig,
                showTextLabels,
              }))
            }
            onToggleAction={toggleAction}
          />
        )}
      </div>
    </main>
  )
}

export default App
