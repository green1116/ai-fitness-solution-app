import type { IndustryMarketplace } from "@/lib/industry-marketplace";
import type { IndustryTransactionStatus, TransactionScore } from "./shared/types";

function resolveTransactionStatus(
  marketplace: IndustryMarketplace,
  totalTransactionScore: number,
  rank: number,
): IndustryTransactionStatus {
  if (marketplace.marketplaceStatus === "archived" || totalTransactionScore < 72) {
    return "closed";
  }

  if (marketplace.marketplaceStatus === "listed") {
    return "initiated";
  }

  if (marketplace.marketplaceStatus === "visible" && totalTransactionScore < 77) {
    return "initiated";
  }

  if (marketplace.marketplaceStatus === "visible") {
    return "qualified";
  }

  if (marketplace.marketplaceStatus === "matched") {
    return "qualified";
  }

  if (marketplace.marketplaceStatus === "engaged" && rank === 2) {
    return "negotiating";
  }

  if (marketplace.marketplaceStatus === "engaged") {
    return "quoted";
  }

  if (marketplace.marketplaceStatus === "transacting" && rank === 3) {
    return "executing";
  }

  if (marketplace.marketplaceStatus === "transacting") {
    return "contracting";
  }

  if (marketplace.marketplaceStatus === "fulfilled") {
    return "completed";
  }

  if (marketplace.marketplaceStatus === "retained") {
    return "executing";
  }

  return "initiated";
}

export function buildTransactionScore(
  transactionId: string,
  marketplace: IndustryMarketplace,
  rank: number,
): TransactionScore {
  const qualificationScore = Math.round(
    marketplace.score.matchingScore * 0.5 + marketplace.score.visibilityScore * 0.5,
  );
  const quotationScore = Math.round(
    marketplace.score.transactionScore * 0.6 + marketplace.score.matchingScore * 0.4,
  );
  const executionScore = Math.round(
    marketplace.score.transactionScore * 0.5 + marketplace.score.totalMarketplaceScore * 0.5,
  );
  const completionScore = Math.round(
    marketplace.score.retentionScore * 0.6 + marketplace.score.totalMarketplaceScore * 0.4,
  );
  const confidenceScore = marketplace.score.confidenceScore;
  const totalTransactionScore = Math.round(
    qualificationScore * 0.2 +
      quotationScore * 0.2 +
      executionScore * 0.25 +
      completionScore * 0.2 +
      confidenceScore * 0.15,
  );

  return {
    scoreId: `transaction-score-${transactionId}`,
    transactionId,
    qualificationScore,
    quotationScore,
    executionScore,
    completionScore,
    confidenceScore,
    totalTransactionScore,
    mode: "industry-transaction",
  };
}

export function resolveTransactionStatusFromMarketplace(
  marketplace: IndustryMarketplace,
  score: TransactionScore,
  rank: number,
): IndustryTransactionStatus {
  return resolveTransactionStatus(marketplace, score.totalTransactionScore, rank);
}
