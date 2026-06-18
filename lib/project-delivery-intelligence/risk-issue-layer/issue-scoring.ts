import type { DeliveryIssueSeverity } from "../shared/constants";
import { calculateDeliveryRiskScore } from "./risk-scoring";

export function calculateDeliveryIssueSeverity(riskScore: number): DeliveryIssueSeverity {
  if (riskScore >= 70) return "critical";
  if (riskScore >= 40) return "major";
  return "minor";
}

export function calculateDeliveryIssueSeverityFromReasons(reasonCodes: string[]): DeliveryIssueSeverity {
  return calculateDeliveryIssueSeverity(calculateDeliveryRiskScore(reasonCodes));
}
