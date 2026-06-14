import type { RegistryValidation } from "./shared/types";
import { buildIndustryTransactions } from "./transaction-registry";
import type {
  IndustryTransactionStatus,
  IndustryTransactionType,
  TransactionContext,
} from "./shared/types";
import {
  CANONICAL_TRANSACTION_SUBJECT_ID,
  INDUSTRY_TRANSACTION_TAG,
  INDUSTRY_TRANSACTION_VERSION,
} from "./shared/types";

function buildTypeBreakdown(
  transactions: ReturnType<typeof buildIndustryTransactions>,
): Record<IndustryTransactionType, number> {
  const breakdown: Record<IndustryTransactionType, number> = {
    supplier: 0,
    brand: 0,
    tender: 0,
    partnership: 0,
  };

  for (const transaction of transactions) {
    breakdown[transaction.transactionType] += 1;
  }

  return breakdown;
}

function buildStatusBreakdown(
  transactions: ReturnType<typeof buildIndustryTransactions>,
): Record<IndustryTransactionStatus, number> {
  const breakdown: Record<IndustryTransactionStatus, number> = {
    initiated: 0,
    qualified: 0,
    quoted: 0,
    negotiating: 0,
    contracting: 0,
    executing: 0,
    completed: 0,
    closed: 0,
  };

  for (const transaction of transactions) {
    breakdown[transaction.transactionStatus] += 1;
  }

  return breakdown;
}

export function buildTransactionContext(): TransactionContext {
  const transactions = buildIndustryTransactions();

  return {
    contextId: `transaction-context-${INDUSTRY_TRANSACTION_VERSION}`,
    transactions,
    transactionCount: transactions.length,
    typeBreakdown: buildTypeBreakdown(transactions),
    statusBreakdown: buildStatusBreakdown(transactions),
    transactionReady: transactions.length > 0,
    mode: "industry-transaction",
  };
}

export function validateTransactionContextState(context: TransactionContext): boolean {
  const canonical = context.transactions.filter(
    (transaction) => transaction.subjectId === CANONICAL_TRANSACTION_SUBJECT_ID,
  );

  return (
    context.transactionReady &&
    context.transactionCount >= 8 &&
    context.transactions.length === context.transactionCount &&
    Object.values(context.typeBreakdown).every((count) => count > 0) &&
    Object.values(context.statusBreakdown).every((count) => count > 0) &&
    canonical.length >= 1 &&
    context.mode === "industry-transaction"
  );
}

export function validateTransactionContextRegistry(): RegistryValidation {
  const context = buildTransactionContext();
  const valid =
    validateTransactionContextState(context) &&
    INDUSTRY_TRANSACTION_VERSION === "v35-industry-transaction-1" &&
    INDUSTRY_TRANSACTION_TAG === "v35-industry-transaction-foundation";

  return {
    valid,
    count: context.transactionCount,
    summary: `transaction-context count=${context.transactionCount} types=4/4 statuses=8/8 valid=${valid}`,
  };
}
