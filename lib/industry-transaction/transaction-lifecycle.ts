import { buildIndustryTransactions } from "./transaction-registry";
import type { IndustryTransaction, RegistryValidation, TransactionLifecycle } from "./shared/types";
import { INDUSTRY_TRANSACTION_VERSION } from "./shared/types";

export function buildQualifiedTransactions(): IndustryTransaction[] {
  return buildIndustryTransactions().filter(
    (transaction) => transaction.transactionStatus === "qualified",
  );
}

export function buildQuotedTransactions(): IndustryTransaction[] {
  return buildIndustryTransactions().filter(
    (transaction) =>
      transaction.transactionStatus === "quoted" ||
      transaction.transactionStatus === "negotiating",
  );
}

export function buildExecutingTransactions(): IndustryTransaction[] {
  return buildIndustryTransactions().filter(
    (transaction) =>
      transaction.transactionStatus === "executing" ||
      transaction.transactionStatus === "contracting",
  );
}

export function buildCompletedTransactions(): IndustryTransaction[] {
  return buildIndustryTransactions().filter(
    (transaction) => transaction.transactionStatus === "completed",
  );
}

export function buildTransactionLifecycle(): TransactionLifecycle {
  const transactions = buildIndustryTransactions();

  return {
    lifecycleId: `transaction-lifecycle-${INDUSTRY_TRANSACTION_VERSION}`,
    transactions,
    qualifiedTransactions: buildQualifiedTransactions(),
    quotedTransactions: buildQuotedTransactions(),
    executingTransactions: buildExecutingTransactions(),
    completedTransactions: buildCompletedTransactions(),
    lifecycleReady:
      transactions.length > 0 &&
      buildQualifiedTransactions().length >= 1 &&
      buildQuotedTransactions().length >= 1 &&
      buildExecutingTransactions().length >= 1 &&
      buildCompletedTransactions().length >= 1,
    mode: "industry-transaction",
  };
}

export function validateTransactionLifecycleRegistry(): RegistryValidation {
  const lifecycle = buildTransactionLifecycle();

  const valid =
    lifecycle.lifecycleReady &&
    lifecycle.qualifiedTransactions.length >= 1 &&
    lifecycle.quotedTransactions.length >= 1 &&
    lifecycle.executingTransactions.length >= 1 &&
    lifecycle.completedTransactions.length >= 1;

  return {
    valid,
    count: lifecycle.transactions.length,
    summary: `transaction-lifecycle qualified=${lifecycle.qualifiedTransactions.length} quoted=${lifecycle.quotedTransactions.length} executing=${lifecycle.executingTransactions.length} completed=${lifecycle.completedTransactions.length} valid=${valid}`,
  };
}
