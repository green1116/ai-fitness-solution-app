import type { IndustryCRM } from "@/lib/industry-crm";
import type { IndustryMarketplaceStatus, MarketplaceScore } from "./shared/types";

function resolveMarketplaceStatus(
  crm: IndustryCRM,
  totalMarketplaceScore: number,
  rank: number,
): IndustryMarketplaceStatus {
  if (crm.crmStatus === "churned" || totalMarketplaceScore < 72) {
    return "archived";
  }

  if (crm.crmStatus === "prospect") {
    return "listed";
  }

  if (crm.crmStatus === "dormant") {
    return "visible";
  }

  if (crm.crmStatus === "retained") {
    return "retained";
  }

  if (crm.crmStatus === "strategic" && rank <= 2) {
    return "fulfilled";
  }

  if (crm.crmStatus === "strategic") {
    return "transacting";
  }

  if (crm.crmStatus === "active" && rank === 2) {
    return "engaged";
  }

  if (crm.crmStatus === "active" && rank === 4) {
    return "matched";
  }

  if (crm.crmStatus === "active" && totalMarketplaceScore >= 84) {
    return "transacting";
  }

  if (crm.crmStatus === "active" && totalMarketplaceScore >= 80) {
    return "engaged";
  }

  if (crm.crmStatus === "active" && totalMarketplaceScore >= 76) {
    return "matched";
  }

  if (crm.crmStatus === "active") {
    return "visible";
  }

  return "listed";
}

export function buildMarketplaceScore(
  marketplaceId: string,
  crm: IndustryCRM,
  rank: number,
): MarketplaceScore {
  const confidenceScore = crm.score.confidence;
  const visibilityScore = Math.round(
    crm.score.relationshipStrength * 0.4 +
      crm.score.expansionScore * 0.3 +
      confidenceScore * 0.3,
  );
  const matchingScore = Math.round(
    crm.score.lifecycleStrength * 0.35 +
      crm.score.relationshipStrength * 0.35 +
      confidenceScore * 0.3,
  );
  const transactionScore = Math.round(
    crm.score.expansionScore * 0.4 +
      crm.score.lifecycleStrength * 0.3 +
      matchingScore * 0.3,
  );
  const retentionScore = crm.score.retentionScore;
  const totalMarketplaceScore = Math.round(
    visibilityScore * 0.2 +
      matchingScore * 0.25 +
      transactionScore * 0.25 +
      retentionScore * 0.15 +
      confidenceScore * 0.15,
  );

  return {
    scoreId: `marketplace-score-${marketplaceId}`,
    marketplaceId,
    visibilityScore,
    matchingScore,
    transactionScore,
    retentionScore,
    confidenceScore,
    totalMarketplaceScore,
    mode: "industry-marketplace",
  };
}

export function resolveMarketplaceStatusFromCRM(
  crm: IndustryCRM,
  score: MarketplaceScore,
  rank: number,
): IndustryMarketplaceStatus {
  return resolveMarketplaceStatus(crm, score.totalMarketplaceScore, rank);
}
