import { trainerActions, weaponCatalog } from '../../data/weaponCatalog'
import { formatInputToken } from './input'
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
    <section className="settings-panel">
      <div className="settings-card">
        <div className="settings-card__header">
          <div>
            <p className="settings-kicker">Configuration</p>
            <h2>Trainer settings</h2>
          </div>

          {captureTarget ? (
            <button className="ghost-button" onClick={onCancelCapture}>
              Cancel Capture
            </button>
          ) : null}
        </div>

        <p className="settings-note">
          {settingsLocked
            ? 'Settings are locked while a run is active. Reset to change binds.'
            : 'Capture a key or mouse button directly from the interface. Browser back/forward mouse buttons are supported. Audio cues stay built in, and the header mute button silences them when needed.'}
        </p>

        <div className="settings-section">
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={config.showTextLabels}
              disabled={settingsLocked}
              onChange={(event) => onShowTextLabelsChange(event.currentTarget.checked)}
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
                          onChange={() => onToggleAction(action.id)}
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
          onClick={onRestoreDefaults}
        >
          Restore defaults
        </button>
      </div>
    </section>
  )
}
