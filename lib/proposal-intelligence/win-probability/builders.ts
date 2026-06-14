import type {
  ProposalRisk,
  TenderContextProfile,
  WinConfidence,
  WinProbabilityModel,
} from "../shared/types";

export function buildWinProbabilityModel(input: {
  score: number;
  risks: ProposalRisk[];
  tenderContext: TenderContextProfile;
}): WinProbabilityModel {
  const { score, risks, tenderContext } = input;

  const baseProbability = Math.round(score * 0.96);

  const mediumRiskCount = risks.filter((r) => r.level === "medium").length;
  const highRiskCount = risks.filter((r) => r.level === "high").length;

  let adjustedProbability = baseProbability;
  if (highRiskCount > 0) {
    adjustedProbability -= highRiskCount * 6 + mediumRiskCount * 2;
  } else if (mediumRiskCount > 2) {
    adjustedProbability -= (mediumRiskCount - 2) * 2;
  }

  if (tenderContext.competitionLevel === "high" && score < 80) {
    adjustedProbability -= 2;
  }
  if (tenderContext.budgetPressure === "high" && score < 75) {
    adjustedProbability -= 2;
  }

  adjustedProbability = Math.max(0, Math.min(100, adjustedProbability));

  const elevatedRiskCount = mediumRiskCount + highRiskCount;
  let confidence: WinConfidence = "high";
  if (elevatedRiskCount >= 3 || score < 70) confidence = "low";
  else if (elevatedRiskCount >= 1 || score < 80) confidence = "medium";

  const reasons: string[] = [];

  const inventoryRisk = risks.find((r) => r.category === "inventory");
  if (inventoryRisk?.level === "low") {
    reasons.push("Strong inventory availability");
  }

  const leadTimeRisk = risks.find((r) => r.category === "lead-time");
  if (leadTimeRisk?.level === "low") {
    reasons.push("Fast lead time");
  }

  const pricingRisk = risks.find((r) => r.category === "pricing");
  if (pricingRisk?.level === "low") {
    reasons.push("Competitive project price");
  }

  const serviceRisk = risks.find((r) => r.category === "service-coverage");
  if (serviceRisk?.level === "low") {
    reasons.push("Good supplier coverage");
  }

  if (score >= 80) {
    reasons.push("Solid overall proposal score");
  }

  return {
    baseProbability,
    adjustedProbability,
    confidence,
    reasons: [...new Set(reasons)],
  };
}
