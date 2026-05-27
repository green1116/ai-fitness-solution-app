/**
 * V3.7 FINAL —integrity lock
 */

import { buildFreezeLockState } from "../freeze/freeze-lock";

export const INTEGRITY_LOCK_VERSION = "3.7-final-integrity-lock-1" as const;

export type IntegrityLock = {
  version: typeof INTEGRITY_LOCK_VERSION;
  lockId: string;
  locked: boolean;
  freezeLocked: boolean;
  reason: string;
  summary: string;
};

export function buildIntegrityLock(input?: { deploymentId?: string }): IntegrityLock {
  const deploymentId = input?.deploymentId ?? "integrity-lock";
  const lockId = `ILK-V37FINAL-${deploymentId.slice(0, 8)}`;
  const freezeLock = buildFreezeLockState({ deploymentId });

  return {
    version: INTEGRITY_LOCK_VERSION,
    lockId,
    locked: freezeLock.locked,
    freezeLocked: freezeLock.locked,
    reason: freezeLock.lockReason,
    summary: `integrity-lock id=${lockId} locked=${freezeLock.locked}`,
  };
}
