import { useEffect, useState } from 'react'
import './App.css'
import { actionCatalogById, trainerActions, weaponCatalog } from './data/weaponCatalog'
import { getInputTokenFromKeyboardEvent, getInputTokenFromMouseEvent, isNavigationMouseToken, formatInputToken } from './features/trainer/input'
import {
  createDefaultTrainerConfig,
  loadTrainerConfig,
  saveTrainerConfig,
} from './features/trainer/config'
import { useTrainer } from './features/trainer/useTrainer'
import type {
  ActionId,
  InputToken,
  TrainerConfig,
  VariantId,
  WeaponId,
} from './features/trainer/types'
import { variantIds, weaponIds } from './features/trainer/types'

type BindingCaptureTarget =
  | { scope: 'weapon'; id: WeaponId }
  | { scope: 'variant'; id: VariantId }
  | null

function formatMilliseconds(value: number | null): string {
  return value === null ? '--' : `${value} ms`
}

function getStageTitle(
  status: 'idle' | 'paused' | 'running',
  stage: 'waitingForWeapon' | 'waitingForVariant' | null,
): string {
  if (status === 'paused') {
    return 'Session paused'
  }

  if (status === 'idle' || !stage) {
    return 'Ready to drill'
  }

  if (stage === 'waitingForWeapon') {
    return 'Step 1: Select the weapon'
  }

  if (stage === 'waitingForVariant') {
    return 'Step 2: Confirm the variant'
  }

  return 'Step 2: Confirm the variant'
}

function getStageHint(
  status: 'idle' | 'paused' | 'running',
  stage: 'waitingForWeapon' | 'waitingForVariant' | null,
): string {
  if (status === 'paused') {
    return 'Resume to start a fresh prompt without polluting your timings.'
  }

  if (status === 'idle' || !stage) {
    return 'Start the trainer, match the weapon first, then finish on the correct variant.'
  }

  if (stage === 'waitingForWeapon') {
    return 'The cue is live. Hit the weapon bind before you move to the variant.'
  }

  if (stage === 'waitingForVariant') {
    return 'Weapon accepted. Finish the combo with the variant bind.'
  }

  return 'Weapon accepted. Finish the combo with the variant bind.'
}

function App() {
  const [config, setConfig] = useState<TrainerConfig>(() => loadTrainerConfig())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [captureTarget, setCaptureTarget] = useState<BindingCaptureTarget>(null)
  const [failedCueImages, setFailedCueImages] = useState<Set<ActionId>>(() => new Set())

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
  const cueImageUnavailable = currentAction ? failedCueImages.has(currentAction.id) : false
  const settingsLocked = state.status === 'running'
  const canStart = state.status === 'idle' && validationErrors.length === 0
  const canReset =
    state.hitCount > 0 ||
    state.missCount > 0 ||
    state.status === 'running' ||
    state.status === 'paused'
  const activeView = settingsOpen ? 'settings' : 'trainer'

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

  const feedbackTone =
    state.feedback?.kind === 'correct'
      ? 'is-correct'
      : state.feedback?.kind === 'incorrect'
        ? 'is-incorrect'
        : state.feedback?.kind === 'armed'
          ? 'is-armed'
          : state.feedback?.kind === 'paused'
            ? 'is-paused'
            : 'is-neutral'

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div className="title-block">
          <p className="eyebrow">ULTRAKILL Weapon Bind Trainer</p>
          <h1>Because Sisyphus isn't going to P rank itself.</h1>
        </div>

        <div className="top-bar-actions">
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
                <p className="cue-step">{getStageTitle(state.status, state.stage)}</p>
                <p className="cue-hint">{getStageHint(state.status, state.stage)}</p>
              </div>

              <div className="cue-frame__body">
                {currentAction && !cueImageUnavailable ? (
                  <img
                    className="cue-image"
                    src={currentAction.imagePath}
                    alt={config.showTextLabels ? currentAction.label : ''}
                    onError={() => {
                      setFailedCueImages((currentFailures) => {
                        if (currentFailures.has(currentAction.id)) {
                          return currentFailures
                        }

                        const nextFailures = new Set(currentFailures)
                        nextFailures.add(currentAction.id)
                        return nextFailures
                      })
                    }}
                  />
                ) : (
                  <div className="cue-fallback">
                    <span className="cue-fallback__variant">
                      {currentAction ? `V${currentAction.variantId}` : 'IDLE'}
                    </span>
                    <strong>{currentAction ? currentAction.label : 'Press Start to begin'}</strong>
                    <p>
                      {currentAction
                        ? 'Image missing. Add the matching asset to public/trainer-images.'
                        : 'Your first prompt will appear here.'}
                    </p>
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
          <section className="settings-panel">
            <div className="settings-card">
              <div className="settings-card__header">
                <div>
                  <p className="settings-kicker">Configuration</p>
                  <h2>Trainer settings</h2>
                </div>

                {captureTarget ? (
                  <button className="ghost-button" onClick={() => setCaptureTarget(null)}>
                    Cancel Capture
                  </button>
                ) : null}
              </div>

              <p className="settings-note">
                {settingsLocked
                  ? 'Settings are locked while a run is active. Reset to change binds.'
                  : 'Capture a key or mouse button directly from the interface. Browser back/forward mouse buttons are supported.'}
              </p>

              <div className="settings-section">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={config.audioEnabled}
                    disabled={settingsLocked}
                    onChange={(event) =>
                      setConfig((currentConfig) => ({
                        ...currentConfig,
                        audioEnabled: event.currentTarget.checked,
                      }))
                    }
                  />
                  <span>Enable weapon audio after the correct weapon key</span>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={config.showTextLabels}
                    disabled={settingsLocked}
                    onChange={(event) =>
                      setConfig((currentConfig) => ({
                        ...currentConfig,
                        showTextLabels: event.currentTarget.checked,
                      }))
                    }
                  />
                  <span>Show action labels under the cue image</span>
                </label>
              </div>

              <div className="settings-section">
                <div className="section-heading">
                  <h3>Weapon binds</h3>
                  <p>Assign the primary weapon select input for each weapon family.</p>
                </div>

                <div className="binding-list">
                  {weaponIds.map((weaponId) => {
                    const weaponEntry = weaponCatalog[weaponId]
                    const isCapturing =
                      captureTarget?.scope === 'weapon' && captureTarget.id === weaponId

                    return (
                      <div className="binding-row" key={weaponId}>
                        <div>
                          <strong>{weaponEntry.label}</strong>
                          <span>Primary weapon select input.</span>
                        </div>
                        <button
                          className={`bind-button ${isCapturing ? 'is-capturing' : ''}`}
                          disabled={settingsLocked || (captureTarget !== null && !isCapturing)}
                          onClick={() =>
                            setCaptureTarget({ scope: 'weapon', id: weaponId })
                          }
                        >
                          {isCapturing
                            ? 'Press any key or mouse button'
                            : formatInputToken(config.weaponBindings[weaponId])}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="settings-section">
                <div className="section-heading">
                  <h3>Variant binds</h3>
                  <p>Variant keys are global across every weapon family.</p>
                </div>

                <div className="binding-list">
                  {variantIds.map((variantId) => {
                    const isCapturing =
                      captureTarget?.scope === 'variant' && captureTarget.id === variantId

                    return (
                      <div className="binding-row" key={variantId}>
                        <div>
                          <strong>{`Variant ${variantId}`}</strong>
                          <span>Used after the weapon key is accepted.</span>
                        </div>
                        <button
                          className={`bind-button ${isCapturing ? 'is-capturing' : ''}`}
                          disabled={settingsLocked || (captureTarget !== null && !isCapturing)}
                          onClick={() =>
                            setCaptureTarget({ scope: 'variant', id: variantId })
                          }
                        >
                          {isCapturing
                            ? 'Press any key or mouse button'
                            : formatInputToken(config.variantBindings[variantId])}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="settings-section">
                <div className="section-heading">
                  <h3>Enabled weapons</h3>
                </div>

                <div className="action-groups">
                  {weaponIds.map((weaponId) => (
                    <div className="action-group" key={weaponId}>
                      <div className="action-group__heading">
                        <strong>{weaponCatalog[weaponId].label}</strong>
                        <span>Variants 1-3 enabled independently.</span>
                      </div>
                      <div className="action-chip-grid">
                        {trainerActions
                          .filter((action) => action.weaponId === weaponId)
                          .map((action) => (
                            <label
                              className={`action-chip ${
                                config.enabledActions[action.id] ? 'is-enabled' : 'is-disabled'
                              }`}
                              key={action.id}
                            >
                              <input
                                type="checkbox"
                                checked={config.enabledActions[action.id]}
                                disabled={settingsLocked}
                                onChange={() => toggleAction(action.id)}
                              />
                              <span className="action-chip__content">
                                <strong>{`Variant ${action.variantId}`}</strong>
                                <span className="action-chip__state">
                                  {config.enabledActions[action.id] ? 'Enabled' : 'Disabled'}
                                </span>
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="ghost-button"
                disabled={settingsLocked}
                onClick={() => {
                  setCaptureTarget(null)
                  setConfig(createDefaultTrainerConfig())
                  setFailedCueImages(new Set())
                }}
              >
                Restore defaults
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default App
