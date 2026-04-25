'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { actionCatalogById } from '../../data/weaponCatalog'
import {
  getInputTokenFromKeyboardEvent,
  getInputTokenFromMouseEvent,
  isNavigationMouseToken,
} from './input'
import {
  createDefaultTrainerConfig,
  loadTrainerConfig,
  saveTrainerConfig,
} from './config'
import { SettingsPanel } from './SettingsPanel'
import { useTrainer } from './useTrainer'
import type {
  ActionId,
  BindingCaptureTarget,
  FeedbackKind,
  InputToken,
  RoundStage,
  TrainerConfig,
  TrainerStatus,
} from './types'
import { formatMilliseconds } from '../../utils/helpers'
import styles from './css/TrainerApp.module.css'

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

const feedbackToneByKind: Record<FeedbackKind, keyof typeof styles> = {
  armed: 'isArmed',
  correct: 'isCorrect',
  incorrect: 'isIncorrect',
}

function getStageCopy(
  status: TrainerStatus,
  stage: RoundStage | null,
): { title: string; hint: string } {
  return status === 'idle' || stage === null ? stageCopyByKey.idle : stageCopyByKey[stage]
}

export function TrainerApp() {
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
  const stageCopy = getStageCopy(state.status, state.stage)
  const feedbackToneClassName = state.feedback
    ? styles[feedbackToneByKind[state.feedback.kind]]
    : styles.isNeutral

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

  return (
    <div className={styles.shell}>
      <main className={styles.appShell}>
        <header className={styles.topBar}>
          <div className={styles.titleBlock}>
            <h1>ULTRABINDS</h1>
            <h2>Because Sisyphus isn&apos;t going to P rank itself.</h2>
          </div>

          <div className={styles.topBarActions}>
            <button
              className={styles.ghostButton}
              aria-pressed={config.audioMuted}
              onClick={toggleMute}
            >
              {config.audioMuted ? 'Unmute' : 'Mute'}
            </button>
            <button className={styles.ghostButton} onClick={toggleSettingsView}>
              {settingsOpen ? 'Trainer' : 'Settings'}
            </button>
          </div>
        </header>

        {validationErrors.length > 0 ? (
          <section className={styles.validationStrip} aria-live="polite">
            <h2>Start is blocked</h2>
            <ul>
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className={styles.viewShell}>
          {!settingsOpen ? (
            <section className={styles.trainerPanel}>
              <div
                className={`${styles.cueFrame} ${feedbackToneClassName}`}
                key={`${currentActionId ?? 'idle'}-${state.cuePulseCount}`}
              >
                <div className={styles.cueFrameHeader}>
                  <p className={styles.cueStep}>{stageCopy.title}</p>
                  <p className={styles.cueHint}>{stageCopy.hint}</p>
                </div>

                <div className={styles.cueFrameBody}>
                  {currentAction ? (
                    <div className={styles.cueImageShell}>
                      <Image
                        className={styles.cueImage}
                        src={currentAction.imagePath}
                        alt={config.showTextLabels ? currentAction.label : ''}
                        fill
                        sizes="(max-width: 640px) 100vw, 34rem"
                      />
                    </div>
                  ) : (
                    <div className={styles.cueFallback}>
                      <span className={styles.cueFallbackVariant}>IDLE</span>
                      <strong>Press Start to begin</strong>
                      <p>Your first prompt will appear here.</p>
                    </div>
                  )}

                  {currentAction && config.showTextLabels ? (
                    <div className={styles.cueCaption}>
                      <span>{currentAction.label}</span>
                    </div>
                  ) : null}

                  <div className={styles.cueActions}>
                    <button
                      className={styles.primaryButton}
                      disabled={!canStart}
                      onClick={startSession}
                    >
                      Start
                    </button>
                    <button
                      className={styles.dangerButton}
                      disabled={!canReset}
                      onClick={resetSession}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className={`${styles.feedbackPanel} ${feedbackToneClassName}`}>
                  <p className={styles.feedbackLabel}>Feedback</p>
                  <strong>
                    {state.feedback?.message ??
                      'Wrong keys count immediately and the prompt will hold until you finish it.'}
                  </strong>
                </div>
              </div>

              <div className={styles.statsGrid}>
                <article className={styles.statCard}>
                  <span>Hits</span>
                  <strong>{state.hitCount}</strong>
                </article>
                <article className={styles.statCard}>
                  <span>Misses</span>
                  <strong>{state.missCount}</strong>
                </article>
                <article className={styles.statCard}>
                  <span>Average</span>
                  <strong>{formatMilliseconds(averageReactionTimeMs)}</strong>
                </article>
                <article className={styles.statCard}>
                  <span>Last</span>
                  <strong>{formatMilliseconds(state.lastReactionTimeMs)}</strong>
                </article>
                <article className={styles.statCard}>
                  <span>Current</span>
                  <strong>{currentAction ? currentAction.label : '--'}</strong>
                </article>
                <article className={styles.statCard}>
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
    </div>
  )
}
