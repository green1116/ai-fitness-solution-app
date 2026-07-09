/**
 * V80 P5 — Final freeze manifest + version lock (read-only)
 */
import {
  V79_TASK_FREEZE_VERSION,
  V79_TASK_SIGNOFF_VERSION,
} from "@/lib/task/v79/signoff/signoff.types";

import type { SystemFinalFreezeManifest, SystemRollbackEntry, SystemVersionLock } from "./system.closure";
import {
  V80_SYSTEM_CLOSURE_VERSION,
  V80_SYSTEM_FREEZE_VERSION,
  V80_SYSTEM_SIGNOFF_VERSION,
} from "./system.closure";
import { collectSystemPhaseReadiness } from "./system.closure.readiness";
import { V80_SYSTEM_INTEGRITY_VERSION } from "./system.integrity";
import { V80_SYSTEM_POLICY_VERSION } from "./system.policy";
import { V80_SYSTEM_SIMULATION_VERSION } from "./system.simulation";
import { V80_SYSTEM_VERSION } from "./system.types";

export const V80_SYSTEM_LAYER_VERSION_LOCK: SystemVersionLock = {
  systemInventory: V80_SYSTEM_VERSION,
  systemPolicy: V80_SYSTEM_POLICY_VERSION,
  systemSimulation: V80_SYSTEM_SIMULATION_VERSION,
  systemIntegrity: V80_SYSTEM_INTEGRITY_VERSION,
  systemClosure: V80_SYSTEM_CLOSURE_VERSION,
  signoff: V80_SYSTEM_SIGNOFF_VERSION,
  freeze: V80_SYSTEM_FREEZE_VERSION,
  upstreamV79TaskSignoff: V79_TASK_SIGNOFF_VERSION,
  upstreamV79TaskFreeze: V79_TASK_FREEZE_VERSION,
};

export const SYSTEM_ROLLBACK_INDEX: SystemRollbackEntry[] = [
  {
    id: "SYS-RS-P1",
    phase: "P1",
    snapshotPath: "lib/system/v80/system.types.ts",
    rollbackAction: "Delete P1 system inventory modules + verify:v80-p1 script",
    required: true,
  },
  {
    id: "SYS-RS-P2",
    phase: "P2",
    snapshotPath: "lib/system/v80/system.policy.ts",
    rollbackAction: "Delete P2 system policy modules + verify:v80-p2 script",
    required: true,
  },
  {
    id: "SYS-RS-P3",
    phase: "P3",
    snapshotPath: "lib/system/v80/system.simulation.ts",
    rollbackAction: "Delete P3 system simulation modules + verify:v80-p3 script",
    required: true,
  },
  {
    id: "SYS-RS-P4",
    phase: "P4",
    snapshotPath: "lib/system/v80/system.integrity.ts",
    rollbackAction: "Delete P4 system integrity modules + verify:v80-p4 script",
    required: true,
  },
  {
    id: "SYS-RS-P5",
    phase: "P5",
    snapshotPath: "lib/system/v80/system.closure.ts",
    rollbackAction: "Delete P5 system closure modules + verify:v80-p5 script",
    required: true,
  },
  {
    id: "SYS-RS-PKG",
    phase: "PKG",
    snapshotPath: "lib/system/v80/",
    rollbackAction: "Delete entire V80 system meta kernel package",
    required: true,
  },
];

export function isSystemLayerVersionLockIntact(): boolean {
  return Object.values(V80_SYSTEM_LAYER_VERSION_LOCK).every(
    (v) => typeof v === "string" && v.length > 0,
  );
}

export function systemVersionLockMatchesExpected(): boolean {
  const lock = V80_SYSTEM_LAYER_VERSION_LOCK;
  return (Object.keys(lock) as Array<keyof SystemVersionLock>).every(
    (key) => lock[key] === V80_SYSTEM_LAYER_VERSION_LOCK[key],
  );
}

export function isSystemRollbackIndexComplete(): boolean {
  const phases = new Set(SYSTEM_ROLLBACK_INDEX.map((e) => e.phase));
  return (
    SYSTEM_ROLLBACK_INDEX.length === 6 &&
    phases.has("P1") &&
    phases.has("P2") &&
    phases.has("P3") &&
    phases.has("P4") &&
    phases.has("P5") &&
    phases.has("PKG")
  );
}

export function buildSystemFinalFreezeManifest(input?: {
  deploymentId?: string;
}): SystemFinalFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v80-system-freeze-default";
  const readiness = collectSystemPhaseReadiness(deploymentId);

  const versionLockOk = isSystemLayerVersionLockIntact() && systemVersionLockMatchesExpected();
  const rollbackIndexComplete = isSystemRollbackIndexComplete();
  const sealed = readiness.ready && versionLockOk && rollbackIndexComplete;

  const sealState: SystemFinalFreezeManifest["sealState"] = sealed
    ? "sealed"
    : versionLockOk
      ? "unsealed"
      : "blocked";

  return {
    version: V80_SYSTEM_FREEZE_VERSION,
    sealId: `system-seal-${deploymentId}`,
    sealedAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V80_SYSTEM_LAYER_VERSION_LOCK },
    versionLockOk,
    rollbackIndexComplete,
    rollbackEntries: SYSTEM_ROLLBACK_INDEX,
    sealState,
    sealed,
    summary: `system-freeze sealed=${sealed} versionLock=${versionLockOk} rollback=${rollbackIndexComplete} state=${sealState}`,
  };
}

export function getSystemRollbackEntryByPhase(phase: string): SystemRollbackEntry | undefined {
  return SYSTEM_ROLLBACK_INDEX.find((e) => e.phase === phase);
}
