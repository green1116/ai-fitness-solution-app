/**
 * AE-6 — Declarative rollback catalogue.
 * Rollback labels only — not deploy / infra / business undo executors.
 */
import type { Ae6LockId } from "./freeze.lock";

export const AE6_ROLLBACK_IDS = [
  "RB-TO-AE5",
  "RB-TO-AE4",
  "RB-TO-AE3",
  "RB-TO-AE2",
  "RB-TO-AE1",
] as const;

export type Ae6RollbackId = (typeof AE6_ROLLBACK_IDS)[number];

export type Ae6RollbackEntry = Readonly<{
  rollbackId: Ae6RollbackId;
  restoresLock: Ae6LockId;
  targetRef: string;
  notes: string;
}>;

/**
 * Closed rollback catalogue — citation of prior AE freeze points.
 */
export const AE6_ROLLBACK_CATALOGUE = [
  {
    rollbackId: "RB-TO-AE5",
    restoresLock: "LOCK-AE5",
    targetRef: "ae-5-application-verification-v1",
    notes: "Roll citation back to AE-5 verification base",
  },
  {
    rollbackId: "RB-TO-AE4",
    restoresLock: "LOCK-AE4",
    targetRef: "ae-4-application-integration-v1",
    notes: "Roll citation back to AE-4 integration base",
  },
  {
    rollbackId: "RB-TO-AE3",
    restoresLock: "LOCK-AE3",
    targetRef: "ae-3-application-workflow-v1",
    notes: "Roll citation back to AE-3 workflow base",
  },
  {
    rollbackId: "RB-TO-AE2",
    restoresLock: "LOCK-AE2",
    targetRef: "ae-2-application-runtime-v1",
    notes: "Roll citation back to AE-2 runtime base",
  },
  {
    rollbackId: "RB-TO-AE1",
    restoresLock: "LOCK-AE1",
    targetRef: "ae-1-application-assembly-v1",
    notes: "Roll citation back to AE-1 assembly base",
  },
] as const satisfies readonly Ae6RollbackEntry[];

export function getAe6RollbackEntry(
  rollbackId: Ae6RollbackId,
): Ae6RollbackEntry | undefined {
  return AE6_ROLLBACK_CATALOGUE.find((r) => r.rollbackId === rollbackId);
}
