import { buildIndustryMarketplace } from "@/lib/industry-marketplace";
import type { IndustryMarketplace } from "@/lib/industry-marketplace";
import { buildTransactionScore, resolveTransactionStatusFromMarketplace } from "./transaction-scoring";
import type { IndustryTransaction, IndustryTransactionType, RegistryValidation } from "./shared/types";
import { CANONICAL_TRANSACTION_SUBJECT_ID } from "./shared/types";

function marketplaceToTransaction(
  marketplace: IndustryMarketplace,
  rank: number,
): IndustryTransaction {
  const transactionId = `ind-transaction-${marketplace.marketplaceId}`;
  const score = buildTransactionScore(transactionId, marketplace, rank);

  return {
    transactionId,
    marketplaceId: marketplace.marketplaceId,
    crmId: marketplace.crmId,
    lifecycleId: marketplace.lifecycleId,
    pipelineId: marketplace.pipelineId,
    workflowId: marketplace.workflowId,
    executionId: marketplace.executionId,
    activationId: marketplace.activationId,
    opportunityId: marketplace.opportunityId,
    transactionType: marketplace.marketplaceType,
    subjectId: marketplace.subjectId,
    subjectType: marketplace.subjectType,
    title: `${marketplace.title.replace(" — Marketplace", "")} — Transaction`,
    summary: `${marketplace.summary} Transitioned to industry transaction stage.`,
    insightIds: [...marketplace.insightIds],
    transactionStatus: resolveTransactionStatusFromMarketplace(marketplace, score, rank),
    score,
    generatedAt: marketplace.generatedAt,
    metadata: {
      ...marketplace.metadata,
      sourceMarketplaceScore: marketplace.score.totalMarketplaceScore.toString(),
      sourceLayer: "v35-industry-marketplace",
    },
    mode: "industry-transaction",
  };
}

export function buildIndustryTransactions(): IndustryTransaction[] {
  const marketplaceRecords = buildIndustryMarketplace();

  return marketplaceRecords.map((marketplace, index) =>
    marketplaceToTransaction(marketplace, index + 1),
  );
}

export function getTransactionById(transactionId: string): IndustryTransaction | undefined {
  return buildIndustryTransactions().find((transaction) => transaction.transactionId === transactionId);
}

export function getTransactionsByType(
  transactionType: IndustryTransactionType,
): IndustryTransaction[] {
  return buildIndustryTransactions().filter(
    (transaction) => transaction.transactionType === transactionType,
  );
}

export function getTransactionsBySubject(subjectId: string): IndustryTransaction[] {
  return buildIndustryTransactions().filter((transaction) => transaction.subjectId === subjectId);
}

export function validateTransactionRegistry(): RegistryValidation {
  const transactions = buildIndustryTransactions();
  const requiredTypes: IndustryTransactionType[] = ["supplier", "brand", "tender", "partnership"];
  const requiredStatuses = [
    "initiated",
    "qualified",
    "quoted",
    "negotiating",
    "contracting",
    "executing",
    "completed",
    "closed",
  ] as const;

  const typeCoverage = requiredTypes.every((type) =>
    transactions.some((transaction) => transaction.transactionType === type),
  );

  const statusCoverage = requiredStatuses.every((status) =>
    transactions.some((transaction) => transaction.transactionStatus === status),
  );

  const scoreValid = transactions.every(
    (transaction) =>
      transaction.score.qualificationScore > 0 &&
      transaction.score.quotationScore > 0 &&
      transaction.score.executionScore > 0 &&
      transaction.score.completionScore > 0 &&
      transaction.score.confidenceScore > 0 &&
      transaction.score.totalTransactionScore > 0 &&
      transaction.insightIds.length > 0 &&
      transaction.mode === "industry-transaction",
  );

  const canonical = getTransactionsBySubject(CANONICAL_TRANSACTION_SUBJECT_ID);

  const valid =
    transactions.length >= 8 &&
    typeCoverage &&
    statusCoverage &&
    scoreValid &&
    canonical.length >= 1;

  return {
    valid,
    count: transactions.length,
    summary: `transaction-registry count=${transactions.length} types=${requiredTypes.filter((t) => transactions.some((x) => x.transactionType === t)).length}/4 statuses=${requiredStatuses.filter((s) => transactions.some((x) => x.transactionStatus === s)).length}/8 valid=${valid}`,
  };
}
