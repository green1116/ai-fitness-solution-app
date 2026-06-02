/**
 * V3.7 plan summary compat entry.
 * Minimal pass-through for product-surface-summary.ts module resolution.
 */

export const PLAN_SUMMARY_VERSION = "3.7-plan-summary-1" as const;

export type PlanSummary = {
  version: typeof PLAN_SUMMARY_VERSION;
  plans: Array<{ id: string; label: string }>;
  summary: string;
};

export function buildPlanSummary(): PlanSummary {
  return {
    version: PLAN_SUMMARY_VERSION,
    plans: [{ id: "enterprise-plan", label: "Enterprise" }],
    summary: `plans=${PLAN_SUMMARY_VERSION} count=1`,
  };
}
