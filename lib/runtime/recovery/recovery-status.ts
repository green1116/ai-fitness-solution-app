/**
 * RSO-4 — Recovery status / action contract
 * Projection vocabulary for RecoveryWorkflow.
 */

export const RECOVERY_STATUSES = [
  "IDLE",
  "PLANNED",
  "ARMED",
  "HELD",
] as const;
export type RecoveryStatus = (typeof RECOVERY_STATUSES)[number];

export const RECOVERY_INTENTS = [
  "MONITOR",
  "REVIEW",
  "PREPARE",
  "HOLD",
] as const;
export type RecoveryIntent = (typeof RECOVERY_INTENTS)[number];

export const RECOVERY_WORKFLOW_STATUSES = [
  "QUIESCENT",
  "STAGED",
  "HELD",
] as const;
export type RecoveryWorkflowStatus =
  (typeof RECOVERY_WORKFLOW_STATUSES)[number];

export type RecoveryAction = Readonly<{
  actionId: string;
  sourceIncidentId: string;
  sourceCheckId: string;
  status: RecoveryStatus;
  intent: RecoveryIntent;
  summary: string;
  detail: string;
  ordinal: number;
}>;

/** Map incident severity + state to recovery status (no automation). */
export function recoveryStatusFromIncident(input: {
  severity: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  state: "OBSERVED" | "OPEN" | "CLEARED";
}): RecoveryStatus {
  if (input.state === "CLEARED" || input.severity === "NONE") return "IDLE";
  if (input.state === "OBSERVED" || input.severity === "LOW") return "IDLE";
  if (input.severity === "MEDIUM") return "PLANNED";
  // HIGH/CRITICAL would be actionable, but automation is out of scope → HELD
  return "HELD";
}

/** Map recovery status to recovery intent. */
export function recoveryIntentFromStatus(
  status: RecoveryStatus,
): RecoveryIntent {
  if (status === "IDLE") return "MONITOR";
  if (status === "PLANNED") return "REVIEW";
  if (status === "ARMED") return "PREPARE";
  return "HOLD";
}

/** Aggregate action statuses into workflow surface status. */
export function aggregateRecoveryWorkflowStatus(
  statuses: readonly RecoveryStatus[],
): RecoveryWorkflowStatus {
  if (statuses.length === 0) return "QUIESCENT";
  if (statuses.some((s) => s === "HELD")) return "HELD";
  if (statuses.some((s) => s === "PLANNED" || s === "ARMED")) return "STAGED";
  return "QUIESCENT";
}
