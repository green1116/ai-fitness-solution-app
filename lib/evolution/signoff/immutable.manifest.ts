/**
 * Evolution P8 — Immutable Evolution Governance Freeze Manifest (read-only)
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../launch/signoff/governance.freeze.lock";
import { OPERATIONS_GOVERNANCE_COMPLETE_ID } from "../../operations/signoff/governance.freeze.lock";
import {
  ENTERPRISE_EVOLUTION_COMPLETE_ID,
  EVOLUTION_GOVERNANCE_COMPLETE_ID,
  EVOLUTION_P8_FREEZE_LOCK,
  EVOLUTION_P8_GOVERNANCE_BASE,
  EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION,
  EVOLUTION_P8_SIGNOFF_VERSION,
  isEvolutionP8FreezeLockIntact,
  evolutionP8FreezeLockMatchesExpected,
  validateEvolutionP8DependencyChain,
  type EvolutionP8FreezeLock,
} from "./governance.freeze.lock";
import {
  checkEvolutionP8ReleaseGate,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  buildEvolutionRollbackSnapshotIndex,
  type EvolutionP8RollbackSnapshot,
} from "./rollback.snapshot.index";

export type EvolutionP8FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  chainOk: boolean;
  gatePass: boolean;
  operationsOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  state: "frozen" | "unfrozen" | "blocked";
  readOnly: true;
};

export type EvolutionImmutableManifest = {
  version: typeof EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION;
  signoff: typeof EVOLUTION_P8_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof EVOLUTION_P8_GOVERNANCE_BASE;
  completeId: typeof EVOLUTION_GOVERNANCE_COMPLETE_ID;
  completeAlias: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  operationsBaseline: typeof OPERATIONS_GOVERNANCE_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  lock: EvolutionP8FreezeLock;
  versionLockOk: boolean;
  chainOk: boolean;
  gate: ReleaseGateResult;
  rollbackSnapshot: EvolutionP8RollbackSnapshot;
  freezeState: EvolutionP8FreezeState;
  operationsOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  summary: string;
  readOnly: true;
};

export function buildEvolutionImmutableManifest(input?: {
  deploymentId?: string;
}): EvolutionImmutableManifest {
  const deploymentId = input?.deploymentId ?? "evolution-p8-governance-default";
  const platform = buildPlatformV1Manifest();
  const gate = checkEvolutionP8ReleaseGate();
  const rollbackSnapshot = buildEvolutionRollbackSnapshotIndex();
  const chain = validateEvolutionP8DependencyChain();
  const versionLockOk =
    isEvolutionP8FreezeLockIntact() &&
    evolutionP8FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";
  const chainOk = chain.ok;
  const operationsOk =
    OPERATIONS_GOVERNANCE_COMPLETE_ID ===
      "enterprise-post-launch-operations-complete-v1" &&
    EVOLUTION_P8_FREEZE_LOCK.operationsBaseline ===
      OPERATIONS_GOVERNANCE_COMPLETE_ID;
  const launchOk =
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
    EVOLUTION_P8_FREEZE_LOCK.launchBaseline === ENTERPRISE_LAUNCH_COMPLETE_ID;
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1" &&
    EVOLUTION_P8_FREEZE_LOCK.e12Baseline === E12_PRODUCTIZATION_COMPLETE_ID;
  const platformOk =
    platform.aligned === true &&
    EVOLUTION_P8_FREEZE_LOCK.platformBaseline ===
      "enterprise-platform-v1-complete";

  const frozen =
    versionLockOk &&
    chainOk &&
    gatePass &&
    operationsOk &&
    launchOk &&
    e12Ok &&
    platformOk &&
    rollbackSnapshot.indexComplete;

  const freezeState: EvolutionP8FreezeState = {
    frozen,
    versionLockOk,
    chainOk,
    gatePass,
    operationsOk,
    launchOk,
    e12Ok,
    platformOk,
    state: frozen ? "frozen" : gatePass ? "unfrozen" : "blocked",
    readOnly: true,
  };

  return {
    version: EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION,
    signoff: EVOLUTION_P8_SIGNOFF_VERSION,
    freezeId: `${EVOLUTION_GOVERNANCE_COMPLETE_ID}:${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: EVOLUTION_P8_GOVERNANCE_BASE,
    completeId: EVOLUTION_GOVERNANCE_COMPLETE_ID,
    completeAlias: ENTERPRISE_EVOLUTION_COMPLETE_ID,
    operationsBaseline: OPERATIONS_GOVERNANCE_COMPLETE_ID,
    launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
    e12Baseline: "enterprise-e12-productization-complete-v1",
    platformBaseline: "enterprise-platform-v1-complete",
    lock: EVOLUTION_P8_FREEZE_LOCK,
    versionLockOk,
    chainOk,
    gate,
    rollbackSnapshot,
    freezeState,
    operationsOk,
    launchOk,
    e12Ok,
    platformOk,
    summary: [
      `evolution-immutable frozen=${frozen}`,
      `gate=${gate.result}`,
      `chain=${chainOk}`,
      `operations=${operationsOk}`,
      `launch=${launchOk}`,
      `e12=${e12Ok}`,
      `platform=${platformOk}`,
    ].join(" "),
    readOnly: true,
  };
}

export function assertEvolutionImmutableManifestFrozen(
  manifest: EvolutionImmutableManifest = buildEvolutionImmutableManifest(),
): asserts manifest is EvolutionImmutableManifest & {
  freezeState: EvolutionP8FreezeState & { frozen: true; state: "frozen" };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(
      `evolution immutable manifest not frozen: ${manifest.summary}`,
    );
  }
}
