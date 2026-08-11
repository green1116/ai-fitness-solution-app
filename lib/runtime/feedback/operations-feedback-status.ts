/**
 * RSO-7 — Operations feedback status contract
 * Projection vocabulary for OperationsFeedback.
 */

export const OPERATIONS_FEEDBACK_STATUSES = [
  "CLOSED",
  "WATCH",
  "OPEN",
] as const;
export type OperationsFeedbackStatus =
  (typeof OPERATIONS_FEEDBACK_STATUSES)[number];

export const OPERATIONS_FEEDBACK_CHANNELS = [
  "SERVICE_RELIABILITY",
  "CUSTOMER_ADOPTION",
  "COMMERCIAL_GROWTH",
  "RELEASE_FEEDBACK",
] as const;
export type OperationsFeedbackChannel =
  (typeof OPERATIONS_FEEDBACK_CHANNELS)[number];

export type OperationsFeedbackItem = Readonly<{
  feedbackItemId: string;
  sourceMetricId: string;
  sourceCheckId: string;
  tenantId: string;
  status: OperationsFeedbackStatus;
  grade: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  score: number;
  summary: string;
  detail: string;
  ordinal: number;
}>;

export type OperationsFeedbackLink = Readonly<{
  channel: OperationsFeedbackChannel;
  sourcePack: string;
  sourceCapability: string;
  sourceVersion: string;
  sourceFingerprint: string;
}>;

/** Map reliability grade to operations feedback status. */
export function operationsFeedbackStatusFromGrade(
  grade: "EXCELLENT" | "GOOD" | "FAIR" | "POOR",
): OperationsFeedbackStatus {
  if (grade === "EXCELLENT") return "CLOSED";
  if (grade === "GOOD" || grade === "FAIR") return "WATCH";
  return "OPEN";
}

/** Aggregate item statuses into surface feedback status. */
export function aggregateOperationsFeedbackStatus(
  statuses: readonly OperationsFeedbackStatus[],
): OperationsFeedbackStatus {
  if (statuses.length === 0) return "OPEN";
  if (statuses.some((s) => s === "OPEN")) return "OPEN";
  if (statuses.some((s) => s === "WATCH")) return "WATCH";
  return "CLOSED";
}
