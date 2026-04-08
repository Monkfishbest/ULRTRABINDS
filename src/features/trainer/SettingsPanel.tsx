import { trainerActions, weaponCatalog } from '../../data/weaponCatalog'
import { formatInputToken } from './input'
import styles from './trainer.module.css'
import type {
  ActionId,
  BindingCaptureTarget,
  TrainerConfig,
  VariantId,
  WeaponId,
} from './types'
import { variantIds, weaponIds } from './types'

interface SettingsPanelProps {
  captureTarget: BindingCaptureTarget
  config: TrainerConfig
  settingsLocked: boolean
  onCancelCapture: () => void
  onCaptureVariantBinding: (variantId: VariantId) => void
  onCaptureWeaponBinding: (weaponId: WeaponId) => void
  onRestoreDefaults: () => void
  onShowTextLabelsChange: (showTextLabels: boolean) => void
  onToggleAction: (actionId: ActionId) => void
}

export function SettingsPanel({
  captureTarget,
  config,
  settingsLocked,
  onCancelCapture,
  onCaptureVariantBinding,
  onCaptureWeaponBinding,
  onRestoreDefaults,
  onShowTextLabelsChange,
  onToggleAction,
}: SettingsPanelProps) {
  return (
    <section className={styles.settingsPanel}>
      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <div>
            <p className={styles.settingsKicker}>Configuration</p>
            <h2>Trainer settings</h2>
          </div>

          {captureTarget ? (
            <button className={styles.ghostButton} onClick={onCancelCapture}>
              Cancel Capture
            </button>
          ) : null}
        </div>

        <p className={styles.settingsNote}>
          {settingsLocked
            ? 'Settings are locked while a run is active. Reset to change binds.'
            : 'Capture a key or mouse button directly from the interface. Browser back/forward mouse buttons are supported. Audio cues stay built in, and the header mute button silences them when needed.'}
        </p>

        <div className={styles.settingsSection}>
          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={config.showTextLabels}
              disabled={settingsLocked}
              onChange={(event) => onShowTextLabelsChange(event.currentTarget.checked)}
            />
            <span>Show action labels under the cue image</span>
          </label>
        </div>

        <div className={styles.settingsSection}>
          <div className={styles.sectionHeading}>
            <h3>Weapon binds</h3>
            <p>Assign the primary weapon select input for each weapon family.</p>
          </div>

          <div className={styles.bindingList}>
            {weaponIds.map((weaponId) => {
              const weaponEntry = weaponCatalog[weaponId]
              const isCapturing =
                captureTarget?.scope === 'weapon' && captureTarget.id === weaponId

              return (
                <div className={styles.bindingRow} key={weaponId}>
                  <div>
                    <strong>{weaponEntry.label}</strong>
                    <span>Primary weapon select input.</span>
                  </div>
                  <button
                    className={`${styles.bindButton} ${isCapturing ? styles.isCapturing : ''}`}
                    disabled={settingsLocked || (captureTarget !== null && !isCapturing)}
                    onClick={() => onCaptureWeaponBinding(weaponId)}
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

        <div className={styles.settingsSection}>
          <div className={styles.sectionHeading}>
            <h3>Variant binds</h3>
            <p>Variant keys are global across every weapon family.</p>
          </div>

          <div className={styles.bindingList}>
            {variantIds.map((variantId) => {
              const isCapturing =
                captureTarget?.scope === 'variant' && captureTarget.id === variantId

              return (
                <div className={styles.bindingRow} key={variantId}>
                  <div>
                    <strong>{`Variant ${variantId}`}</strong>
                    <span>Used after the weapon key is accepted.</span>
                  </div>
                  <button
                    className={`${styles.bindButton} ${isCapturing ? styles.isCapturing : ''}`}
                    disabled={settingsLocked || (captureTarget !== null && !isCapturing)}
                    onClick={() => onCaptureVariantBinding(variantId)}
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

        <div className={styles.settingsSection}>
          <div className={styles.sectionHeading}>
            <h3>Enabled weapons</h3>
          </div>

          <div className={styles.actionGroups}>
            {weaponIds.map((weaponId) => (
              <div className={styles.actionGroup} key={weaponId}>
                <div className={styles.actionGroupHeading}>
                  <strong>{weaponCatalog[weaponId].label}</strong>
                  <span>Variants 1-3 enabled independently.</span>
                </div>
                <div className={styles.actionChipGrid}>
                  {trainerActions
                    .filter((action) => action.weaponId === weaponId)
                    .map((action) => (
                      <label
                        className={`${styles.actionChip} ${
                          config.enabledActions[action.id] ? styles.isEnabled : styles.isDisabled
                        }`}
                        key={action.id}
                      >
                        <input
                          type="checkbox"
                          checked={config.enabledActions[action.id]}
                          disabled={settingsLocked}
                          onChange={() => onToggleAction(action.id)}
                        />
                        <span className={styles.actionChipContent}>
                          <strong>{`Variant ${action.variantId}`}</strong>
                          <span className={styles.actionChipState}>
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
          className={styles.ghostButton}
          disabled={settingsLocked}
          onClick={onRestoreDefaults}
        >
          Restore defaults
        </button>
      </div>
    </section>
  )
}
