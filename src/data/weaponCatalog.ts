import type {
  ActionId,
  InputToken,
  TrainerAction,
  VariantId,
  WeaponCatalogEntry,
  WeaponId,
} from '../features/trainer/types'
import { variantIds, weaponIds } from '../features/trainer/types'

const weaponLabels: Record<WeaponId, string> = {
  pistol: 'Pistol',
  shotgun: 'Shotgun',
  nailgun: 'Nailgun',
  railcannon: 'Railcannon',
  rocketLauncher: 'Rocket Launcher',
}

export const defaultWeaponBindings: Record<WeaponId, InputToken> = {
  pistol: 'mouse-back',
  shotgun: 'e',
  nailgun: 'capslock',
  railcannon: '4',
  rocketLauncher: '5',
}

export const defaultVariantBindings: Record<VariantId, InputToken> = {
  '1': '1',
  '2': '2',
  '3': '3',
}

const weaponAssetBaseNames: Record<WeaponId, string> = {
  pistol: 'pistol',
  shotgun: 'shotgun',
  nailgun: 'nailgun',
  railcannon: 'railcannon',
  rocketLauncher: 'rocketLauncher',
}

function createActionId(
  weaponId: WeaponId,
  variantId: VariantId,
): ActionId {
  return `${weaponId}-${variantId}`
}

function createWeaponAssetPaths(baseName: string): Pick<
  WeaponCatalogEntry,
  'variantImagePaths' | 'variantAudioPaths'
> {
  return {
    variantImagePaths: {
      '1': `/trainer-images/${baseName}-1.png`,
      '2': `/trainer-images/${baseName}-2.png`,
      '3': `/trainer-images/${baseName}-3.png`,
    },
    variantAudioPaths: {
      '1': `/trainer-audio/${baseName}-1.ogg`,
      '2': `/trainer-audio/${baseName}-2.ogg`,
      '3': `/trainer-audio/${baseName}-3.ogg`,
    },
  }
}

export const weaponCatalog = {
  pistol: {
    label: weaponLabels.pistol,
    ...createWeaponAssetPaths(weaponAssetBaseNames.pistol),
  },
  shotgun: {
    label: weaponLabels.shotgun,
    ...createWeaponAssetPaths(weaponAssetBaseNames.shotgun),
  },
  nailgun: {
    label: weaponLabels.nailgun,
    ...createWeaponAssetPaths(weaponAssetBaseNames.nailgun),
  },
  railcannon: {
    label: weaponLabels.railcannon,
    ...createWeaponAssetPaths(weaponAssetBaseNames.railcannon),
  },
  rocketLauncher: {
    label: weaponLabels.rocketLauncher,
    ...createWeaponAssetPaths(weaponAssetBaseNames.rocketLauncher),
  },
} satisfies Record<WeaponId, WeaponCatalogEntry>

export const trainerActions = weaponIds.flatMap((weaponId) =>
  variantIds.map((variantId) => {
    const weaponEntry = weaponCatalog[weaponId]

    return {
      id: createActionId(weaponId, variantId),
      weaponId,
      variantId,
      label: `${weaponEntry.label} Variant ${variantId}`,
      imagePath: weaponEntry.variantImagePaths[variantId],
      audioPath: weaponEntry.variantAudioPaths[variantId],
    } satisfies TrainerAction
  }),
)

export const allActionIds = trainerActions.map((action) => action.id)

function isCompleteActionCatalog(
  actionCatalog: Partial<Record<ActionId, TrainerAction>>,
): actionCatalog is Record<ActionId, TrainerAction> {
  return allActionIds.every((actionId) => actionCatalog[actionId] !== undefined)
}

function createActionCatalogById(
  actions: readonly TrainerAction[],
): Record<ActionId, TrainerAction> {
  const actionCatalog: Partial<Record<ActionId, TrainerAction>> = {}

  for (const action of actions) {
    actionCatalog[action.id] = action
  }

  if (!isCompleteActionCatalog(actionCatalog)) {
    throw new Error('Action catalog is missing one or more trainer actions.')
  }

  return actionCatalog
}

export const actionCatalogById = createActionCatalogById(trainerActions)
