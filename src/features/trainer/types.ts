export const weaponIds = [
  'pistol',
  'shotgun',
  'nailgun',
  'railcannon',
  'rocketLauncher',
] as const

export const variantIds = ['1', '2', '3'] as const

export type WeaponId = (typeof weaponIds)[number]
export type VariantId = (typeof variantIds)[number]
export type ActionId = `${WeaponId}-${VariantId}`
export type BindingCaptureTarget =
  | { scope: 'weapon'; id: WeaponId }
  | { scope: 'variant'; id: VariantId }
  | null

export type MouseInputToken =
  | 'mouse-left'
  | 'mouse-middle'
  | 'mouse-right'
  | 'mouse-back'
  | 'mouse-forward'
  | `mouse-button-${number}`

export type KeyboardInputToken = string
export type InputToken = KeyboardInputToken | MouseInputToken

export type TrainerStatus = 'idle' | 'running'
export type RoundStage = 'waitingForWeapon' | 'waitingForVariant'
export type FeedbackKind = 'armed' | 'correct' | 'incorrect'

export interface TrainerFeedback {
  kind: FeedbackKind
  message: string
}

export interface WeaponCatalogEntry {
  label: string
  variantImagePaths: Record<VariantId, string>
  variantAudioPaths: Record<VariantId, string>
}

export interface TrainerAction {
  id: ActionId
  weaponId: WeaponId
  variantId: VariantId
  label: string
  imagePath: string
  audioPath: string
}

export interface TrainerConfig {
  weaponBindings: Record<WeaponId, InputToken>
  variantBindings: Record<VariantId, InputToken>
  enabledActions: Record<ActionId, boolean>
  audioMuted: boolean
  showTextLabels: boolean
}

export interface TrainerSessionState {
  status: TrainerStatus
  stage: RoundStage | null
  currentActionId: ActionId | null
  previousActionId: ActionId | null
  hitCount: number
  missCount: number
  reactionTimesMs: number[]
  roundStartedAt: number | null
  lastReactionTimeMs: number | null
  feedback: TrainerFeedback | null
  cuePulseCount: number
}
