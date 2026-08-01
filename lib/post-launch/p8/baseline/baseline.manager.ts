/**
 * PL-8 — Post Launch Baseline Manager.
 * Freeze-only composition over existing PL packages — no new capability.
 */

import {
  POST_LAUNCH_BASE_FREEZE_REF,
  POST_LAUNCH_BASELINE_ID,
  POST_LAUNCH_COMPLETE_ID,
  POST_LAUNCH_FREEZE_DEFINITION,
  POST_LAUNCH_FREEZE_GATE,
  POST_LAUNCH_FREEZE_ID,
  POST_LAUNCH_LAYER_IDS,
  POST_LAUNCH_NON_GOALS,
  POST_LAUNCH_PACKAGE_CHAIN,
  POST_LAUNCH_PRIOR_PACKAGE_CHAIN,
  POST_LAUNCH_TAG_REF,
  type PostLaunchFreezeDefinition,
} from "./freeze.constants";
import {
  POST_LAUNCH_FREEZE_LOCKS,
  isPostLaunchFreezeLockIntact,
  type PostLaunchFreezeLock,
} from "./freeze.lock";
import {
  isPostLaunchFreezeManifestIntact,
  resolvePostLaunchFreezeManifest,
  type PostLaunchFreezeManifest,
} from "./freeze.manifest";

export type PostLaunchBaselineSnapshot = Readonly<{
  freezeId: typeof POST_LAUNCH_FREEZE_ID;
  gateId: typeof POST_LAUNCH_FREEZE_GATE;
  baselineId: typeof POST_LAUNCH_BASELINE_ID;
  completeId: typeof POST_LAUNCH_COMPLETE_ID;
  tagRef: typeof POST_LAUNCH_TAG_REF;
  baseFreezeRef: typeof POST_LAUNCH_BASE_FREEZE_REF;
  chain: string;
  priorChain: string;
  packageCount: number;
  priorCount: number;
  lockCount: number;
  layerIds: typeof POST_LAUNCH_LAYER_IDS;
  definition: PostLaunchFreezeDefinition;
  manifest: PostLaunchFreezeManifest;
  locks: readonly PostLaunchFreezeLock[];
  metadataValid: boolean;
  manifestValid: boolean;
  lockValid: boolean;
  freezeOnly: true;
  readOnly: true;
}>;

export type PostLaunchBaselineManager = {
  readonly freezeId: typeof POST_LAUNCH_FREEZE_ID;
  readonly baselineId: typeof POST_LAUNCH_BASELINE_ID;
  getDefinition: () => PostLaunchFreezeDefinition;
  getManifest: () => PostLaunchFreezeManifest;
  getLocks: () => readonly PostLaunchFreezeLock[];
  snapshot: () => PostLaunchBaselineSnapshot;
  isIntact: () => boolean;
};

/**
 * Create a freeze-only baseline manager.
 * Deterministic composition — no IO / timers / providers / new workflows.
 */
export function createPostLaunchBaselineManager(): PostLaunchBaselineManager {
  function buildSnapshot(): PostLaunchBaselineSnapshot {
    const manifest = resolvePostLaunchFreezeManifest();
    const locks = POST_LAUNCH_FREEZE_LOCKS;
    const lockValid = isPostLaunchFreezeLockIntact(locks);
    const manifestValid = isPostLaunchFreezeManifestIntact(manifest);
    const metadataValid =
      POST_LAUNCH_FREEZE_DEFINITION.freezeId === POST_LAUNCH_FREEZE_ID &&
      POST_LAUNCH_FREEZE_DEFINITION.baselineId === POST_LAUNCH_BASELINE_ID &&
      POST_LAUNCH_FREEZE_DEFINITION.completeId === POST_LAUNCH_COMPLETE_ID &&
      POST_LAUNCH_FREEZE_DEFINITION.tagRef === POST_LAUNCH_TAG_REF &&
      POST_LAUNCH_FREEZE_DEFINITION.baseFreezeRef ===
        POST_LAUNCH_BASE_FREEZE_REF &&
      POST_LAUNCH_FREEZE_DEFINITION.freezeOnly === true &&
      POST_LAUNCH_NON_GOALS.includes("new-capability") &&
      POST_LAUNCH_PACKAGE_CHAIN.length === 7 &&
      POST_LAUNCH_PRIOR_PACKAGE_CHAIN.length === 6;

    return {
      freezeId: POST_LAUNCH_FREEZE_ID,
      gateId: POST_LAUNCH_FREEZE_GATE,
      baselineId: POST_LAUNCH_BASELINE_ID,
      completeId: POST_LAUNCH_COMPLETE_ID,
      tagRef: POST_LAUNCH_TAG_REF,
      baseFreezeRef: POST_LAUNCH_BASE_FREEZE_REF,
      chain: manifest.chain,
      priorChain: manifest.priorChain,
      packageCount: manifest.packages.length,
      priorCount: POST_LAUNCH_PRIOR_PACKAGE_CHAIN.length,
      lockCount: locks.length,
      layerIds: POST_LAUNCH_LAYER_IDS,
      definition: POST_LAUNCH_FREEZE_DEFINITION,
      manifest,
      locks,
      metadataValid,
      manifestValid,
      lockValid,
      freezeOnly: true,
      readOnly: true,
    };
  }

  return {
    freezeId: POST_LAUNCH_FREEZE_ID,
    baselineId: POST_LAUNCH_BASELINE_ID,

    getDefinition(): PostLaunchFreezeDefinition {
      return POST_LAUNCH_FREEZE_DEFINITION;
    },

    getManifest(): PostLaunchFreezeManifest {
      return resolvePostLaunchFreezeManifest();
    },

    getLocks(): readonly PostLaunchFreezeLock[] {
      return POST_LAUNCH_FREEZE_LOCKS;
    },

    snapshot(): PostLaunchBaselineSnapshot {
      return buildSnapshot();
    },

    isIntact(): boolean {
      const snap = buildSnapshot();
      return (
        snap.metadataValid &&
        snap.manifestValid &&
        snap.lockValid &&
        snap.freezeOnly &&
        snap.readOnly
      );
    },
  };
}

/** Resolve baseline snapshot without retaining manager state. */
export function resolvePostLaunchBaselineSnapshot(): PostLaunchBaselineSnapshot {
  return createPostLaunchBaselineManager().snapshot();
}
