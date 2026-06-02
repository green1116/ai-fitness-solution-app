export const DEFAULT_OPTIMIZATION_CYCLE = "governance-optimization-cycle-v1";

export const GOVERNANCE_MODULES = [
  "federation",
  "consensus",
  "policy-propagation",
  "lifecycle-continuity",
  "observability",
  "intelligence",
  "autonomous",
] as const;

export function effectivenessFromScore(score: number): "high" | "medium" | "low" | "ineffective" {
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  if (score >= 35) return "low";
  return "ineffective";
}

export function clampOptimizationScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
