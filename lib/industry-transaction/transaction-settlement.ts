import type { IndustryTransaction, IndustryTransactionType } from "./shared/types";
import { buildIndustryTransactions } from "./transaction-registry";
import type {
  RegistryValidation,
  TransactionSettlement,
  TransactionSettlementContext,
  TransactionSettlementStatus,
} from "./shared/types";
import { INDUSTRY_TRANSACTION_VERSION } from "./shared/types";

function resolveSettlementStatus(transaction: IndustryTransaction): TransactionSettlementStatus {
  if (transaction.transactionStatus === "closed") {
    return "closed";
  }

  if (transaction.transactionStatus === "completed") {
    return "settled";
  }

  return "pending";
}

function buildSettlementForTransaction(transaction: IndustryTransaction): TransactionSettlement {
  return {
    settlementId: `transaction-settlement-${transaction.transactionId}`,
    transactionId: transaction.transactionId,
    transactionType: transaction.transactionType,
    subjectId: transaction.subjectId,
    settlementStatus: resolveSettlementStatus(transaction),
    settlementScore: transaction.score.completionScore,
    settlementReady: transaction.score.completionScore > 0,
    mode: "industry-transaction",
  };
}

function buildSettlementsForType(transactionType: IndustryTransactionType): TransactionSettlement[] {
  return buildIndustryTransactions()
    .filter((transaction) => transaction.transactionType === transactionType)
    .map(buildSettlementForTransaction);
}

export function buildSupplierSettlement(): TransactionSettlement[] {
  return buildSettlementsForType("supplier");
}

export function buildBrandSettlement(): TransactionSettlement[] {
  return buildSettlementsForType("brand");
}

export function buildTenderSettlement(): TransactionSettlement[] {
  return buildSettlementsForType("tender");
}

export function buildPartnershipSettlement(): TransactionSettlement[] {
  return buildSettlementsForType("partnership");
}

export function buildTransactionSettlement(): TransactionSettlementContext {
  const settlements = buildIndustryTransactions().map(buildSettlementForTransaction);
  const typeBreakdown: Record<IndustryTransactionType, number> = {
    supplier: 0,
    brand: 0,
    tender: 0,
    partnership: 0,
  };

  for (const settlement of settlements) {
    typeBreakdown[settlement.transactionType] += 1;
  }

  return {
    contextId: `transaction-settlement-${INDUSTRY_TRANSACTION_VERSION}`,
    settlements,
    settlementCount: settlements.length,
    typeBreakdown,
    settlementReady: settlements.length > 0,
    mode: "industry-transaction",
  };
}

export function validateTransactionSettlementRegistry(): RegistryValidation {
  const settlement = buildTransactionSettlement();
  const suppliers = buildSupplierSettlement();
  const brands = buildBrandSettlement();
  const tenders = buildTenderSettlement();
  const partnerships = buildPartnershipSettlement();
  const requiredTypes: IndustryTransactionType[] = ["supplier", "brand", "tender", "partnership"];

  const typeCoverage = requiredTypes.every((type) =>
    settlement.settlements.some((entry) => entry.transactionType === type),
  );

  const settlementValid = settlement.settlements.every(
    (entry) => entry.settlementScore > 0 && entry.settlementReady,
  );

  const valid =
    settlement.settlementReady &&
    settlement.settlementCount >= 8 &&
    typeCoverage &&
    settlementValid &&
    suppliers.length >= 1 &&
    brands.length >= 1 &&
    tenders.length >= 1 &&
    partnerships.length >= 1;

  return {
    valid,
    count: settlement.settlementCount,
    summary: `transaction-settlement count=${settlement.settlementCount} types=4/4 suppliers=${suppliers.length} tenders=${tenders.length} valid=${valid}`,
  };
}
