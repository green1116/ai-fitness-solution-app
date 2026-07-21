/**
 * Platform v1 — Immutable Governance Freeze Manifest (read-only)
 */

import { assertPlatformV1Aligned, buildPlatformV1Manifest } from "../platform.manifest";
import {
  PLATFORM_V1_BASE,
  PLATFORM_V1_FREEZE_VERSION,
  PLATFORM_V1_ID,
  PLATFORM_V1_VERSION,
} from "../platform.v1.constants";
import {
  PLATFORM_V1_GOVERNANCE_BASE,
  PLATFORM_V1_GOVERNANCE_FREEZE_VERSION,
  PLATFORM_V1_P8_FREEZE_LOCK,
  PLATFORM_V1_P8_SIGNOFF_VERSION,
  isPlatformV1P8FreezeLockIntact,
  platformV1P8FreezeLockMatchesExpected,
  validatePlatformV1P8CompleteChain,
  type PlatformV1P8FreezeLock,
} from "./governance.freeze.lock";
import {
  checkPlatformV1GovernanceReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  buildRollbackSnapshotIndex,
  type PlatformV1P8RollbackSnapshot,
} from "./rollback.snapshot.index";

export type PlatformV1FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  chainOk: boolean;
  gatePass: boolean;
  alignmentOk: boolean;
  state: "frozen" | "unfrozen" | "blocked";
  readOnly: true;
};

export type PlatformV1ImmutableManifest = {
  version: typeof PLATFORM_V1_GOVERNANCE_FREEZE_VERSION;
  signoff: typeof PLATFORM_V1_P8_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof PLATFORM_V1_GOVERNANCE_BASE;
  platformId: typeof PLATFORM_V1_ID;
  alignmentVersion: typeof PLATFORM_V1_VERSION;
  alignmentFreeze: typeof PLATFORM_V1_FREEZE_VERSION;
  alignmentBase: typeof PLATFORM_V1_BASE;
  lock: PlatformV1P8FreezeLock;
  versionLockOk: boolean;
  chainOk: boolean;
  gate: ReleaseGateResult;
  rollbackSnapshot: PlatformV1P8RollbackSnapshot;
  freezeState: PlatformV1FreezeState;
  alignmentOk: boolean;
  summary: string;
  readOnly: true;
};

export function buildPlatformV1ImmutableManifest(input?: {
  deploymentId?: string;
}): PlatformV1ImmutableManifest {
  const deploymentId = input?.deploymentId ?? "platform-v1-governance-default";
  const alignmentManifest = buildPlatformV1Manifest();
  const gate = checkPlatformV1GovernanceReleaseGate();
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const chain = validatePlatformV1P8CompleteChain();
  const versionLockOk =
    isPlatformV1P8FreezeLockIntact() &&
    platformV1P8FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";
  const chainOk = chain.ok;
  const alignmentOk = alignmentManifest.aligned;

  try {
    assertPlatformV1Aligned(alignmentManifest);
  } catch {
    // captured in alignmentOk
  }

  const frozen =
    versionLockOk &&
    chainOk &&
    gatePass &&
    alignmentOk &&
    rollbackSnapshot.indexComplete;

  const freezeState: PlatformV1FreezeState = {
    frozen,
    versionLockOk,
    chainOk,
    gatePass,
    alignmentOk,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
    readOnly: true,
  };

  return {
    version: PLATFORM_V1_GOVERNANCE_FREEZE_VERSION,
    signoff: PLATFORM_V1_P8_SIGNOFF_VERSION,
    freezeId: `platform-v1-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: PLATFORM_V1_GOVERNANCE_BASE,
    platformId: PLATFORM_V1_ID,
    alignmentVersion: PLATFORM_V1_VERSION,
    alignmentFreeze: PLATFORM_V1_FREEZE_VERSION,
    alignmentBase: PLATFORM_V1_BASE,
    lock: {
      ...PLATFORM_V1_P8_FREEZE_LOCK,
      enterprise: {
        e09: { ...PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e09 },
        e10: { ...PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e10 },
        e11: { ...PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e11 },
      },
      components: [...PLATFORM_V1_P8_FREEZE_LOCK.components],
    },
    versionLockOk,
    chainOk,
    gate,
    rollbackSnapshot,
    freezeState,
    alignmentOk,
    summary: [
      `platform-v1-governance frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `chain=${chainOk}`,
      `alignment=${alignmentOk}`,
      `rollback=${rollbackSnapshot.entryCount}`,
      `state=${freezeState.state}`,
    ].join(" "),
    readOnly: true,
  };
}

export function assertPlatformV1ImmutableManifestFrozen(
  manifest: PlatformV1ImmutableManifest = buildPlatformV1ImmutableManifest(),
): asserts manifest is PlatformV1ImmutableManifest & {
  freezeState: PlatformV1FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(
      `Platform v1 governance freeze not complete: ${manifest.summary}`,
    );
  }
}
