import type { DeliveryRiskLevel } from "../shared/constants";

const AVAILABILITY_REASON = "availability-issue";
const LEAD_TIME_REASON = "leadTime-delay";
const SUPPLIER_REASON = "supplier-risk";
const EXECUTION_REASON = "blocked-execution";

export const RISK_SCORE_WEIGHTS = {
  availability: 20,
  leadTime: 25,
  supplier: 15,
  execution: 30,
} as const;

export const RISK_SCORE_REASON_CODES = {
  availability: AVAILABILITY_REASON,
  leadTime: LEAD_TIME_REASON,
  supplier: SUPPLIER_REASON,
  execution: EXECUTION_REASON,
} as const;

export function calculateDeliveryRiskScore(reasonCodes: string[]): number {
  let score = 0;

  if (reasonCodes.some((code) => code.includes("availability"))) {
    score += RISK_SCORE_WEIGHTS.availability;
  }
  if (reasonCodes.some((code) => code.includes("leadTime") || code.includes("lead-time"))) {
    score += RISK_SCORE_WEIGHTS.leadTime;
  }
  if (reasonCodes.some((code) => code.includes("supplier"))) {
    score += RISK_SCORE_WEIGHTS.supplier;
  }
  if (reasonCodes.some((code) => code.includes("blocked") || code.includes("execution"))) {
    score += RISK_SCORE_WEIGHTS.execution;
  }

  return Math.min(100, score);
}

export function resolveDeliveryRiskLevel(reasonCodes: string[]): DeliveryRiskLevel {
  const score = calculateDeliveryRiskScore(reasonCodes);
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}
