import type { FederationRiskLevel } from "./observability-types";

export const DEFAULT_OBSERVABILITY_VERSION = "federation-observability-v1";

export function scoreToRiskLevel(score: number): FederationRiskLevel {
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  if (score >= 40) return "high";
  return "critical";
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
