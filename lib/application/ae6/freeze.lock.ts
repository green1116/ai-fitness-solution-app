/**
 * AE-6 — Application freeze lock catalogue.
 * Lock records only — no runtime mutation / deploy / business locks.
 */
import {
  AE6_APPLICATION_BASELINE_ID,
  AE6_TAG_REF,
} from "./freeze.baseline";
import { AE6_FREEZE_ID } from "./freeze.definition";

export const AE6_LOCK_IDS = [
  "LOCK-AE1",
  "LOCK-AE2",
  "LOCK-AE3",
  "LOCK-AE4",
  "LOCK-AE5",
  "LOCK-STACK",
] as const;

export type Ae6LockId = (typeof AE6_LOCK_IDS)[number];

export type Ae6FreezeLock = Readonly<{
  lockId: Ae6LockId;
  targetRef: string;
  evidenceScript: string;
  notes: string;
}>;

/**
 * Closed freeze locks — one per AE package + stack lock.
 */
export const AE6_FREEZE_LOCKS = [
  {
    lockId: "LOCK-AE1",
    targetRef: "application-assembly-ae1-v1",
    evidenceScript: "scripts/verify-application-ae1.ts",
    notes: "Lock AE-1 assembly",
  },
  {
    lockId: "LOCK-AE2",
    targetRef: "application-runtime-ae2-v1",
    evidenceScript: "scripts/verify-application-ae2.ts",
    notes: "Lock AE-2 runtime",
  },
  {
    lockId: "LOCK-AE3",
    targetRef: "application-workflow-ae3-v1",
    evidenceScript: "scripts/verify-application-ae3.ts",
    notes: "Lock AE-3 workflow",
  },
  {
    lockId: "LOCK-AE4",
    targetRef: "application-integration-ae4-v1",
    evidenceScript: "scripts/verify-application-ae4.ts",
    notes: "Lock AE-4 integration",
  },
  {
    lockId: "LOCK-AE5",
    targetRef: "application-verification-ae5-v1",
    evidenceScript: "scripts/verify-application-ae5.ts",
    notes: "Lock AE-5 verification",
  },
  {
    lockId: "LOCK-STACK",
    targetRef: AE6_FREEZE_ID,
    evidenceScript: "scripts/verify-application-ae6.ts",
    notes: `Lock full stack → ${AE6_TAG_REF} / ${AE6_APPLICATION_BASELINE_ID}`,
  },
] as const satisfies readonly Ae6FreezeLock[];

export function getAe6FreezeLock(
  lockId: Ae6LockId,
): Ae6FreezeLock | undefined {
  return AE6_FREEZE_LOCKS.find((l) => l.lockId === lockId);
}
