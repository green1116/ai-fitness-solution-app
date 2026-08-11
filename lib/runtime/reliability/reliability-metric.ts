/**
 * RSO-6 — Reliability metric contract
 * Projection vocabulary for ServiceReliability.
 */

export const RELIABILITY_GRADES = [
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "POOR",
] as const;
export type ReliabilityGrade = (typeof RELIABILITY_GRADES)[number];

export const SERVICE_RELIABILITY_STATUSES = [
  "HEALTHY",
  "WATCH",
  "DEGRADED",
] as const;
export type ServiceReliabilityStatus =
  (typeof SERVICE_RELIABILITY_STATUSES)[number];

export type ReliabilityMetric = Readonly<{
  metricId: string;
  tenantId: string;
  sourceOperationId: string;
  sourceCheckId: string;
  grade: ReliabilityGrade;
  score: number;
  summary: string;
  detail: string;
  ordinal: number;
}>;

/** Map tenant operation status to reliability grade. */
export function reliabilityGradeFromTenantStatus(
  status: "STABLE" | "WATCH" | "STAGED" | "SUSPENDED",
): ReliabilityGrade {
  if (status === "STABLE") return "EXCELLENT";
  if (status === "WATCH") return "GOOD";
  if (status === "STAGED") return "FAIR";
  return "POOR";
}

/** Deterministic score for a reliability grade (no live APM). */
export function reliabilityScoreFromGrade(grade: ReliabilityGrade): number {
  if (grade === "EXCELLENT") return 100;
  if (grade === "GOOD") return 85;
  if (grade === "FAIR") return 70;
  return 40;
}

/** Aggregate metric grades into service reliability surface status. */
export function aggregateServiceReliabilityStatus(
  grades: readonly ReliabilityGrade[],
): ServiceReliabilityStatus {
  if (grades.length === 0) return "DEGRADED";
  if (grades.some((g) => g === "POOR")) return "DEGRADED";
  if (grades.some((g) => g === "FAIR" || g === "GOOD")) return "WATCH";
  return "HEALTHY";
}
