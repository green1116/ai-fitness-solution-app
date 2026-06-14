import {
  buildIndustryTransactions,
  getTransactionsBySubject,
  getTransactionsByType,
} from "./transaction-registry";
import type {
  IndustryTransaction,
  RegistryValidation,
  TransactionQuery,
  TransactionQueryResult,
} from "./shared/types";
import {
  CANONICAL_TRANSACTION_QUERY,
  CANONICAL_TRANSACTION_SUBJECT_ID,
  TOP_TRANSACTION_SCORE_THRESHOLD,
} from "./shared/types";

function applyTransactionQuery(
  input: TransactionQuery,
  source: IndustryTransaction[],
): IndustryTransaction[] {
  let transactions = [...source];

  if (input.subjectId) {
    transactions = transactions.filter((transaction) => transaction.subjectId === input.subjectId);
  }

  if (input.transactionType) {
    transactions = transactions.filter(
      (transaction) => transaction.transactionType === input.transactionType,
    );
  }

  if (input.transactionStatus) {
    transactions = transactions.filter(
      (transaction) => transaction.transactionStatus === input.transactionStatus,
    );
  }

  if (input.minTransactionScore !== undefined) {
    transactions = transactions.filter(
      (transaction) => transaction.score.totalTransactionScore >= input.minTransactionScore!,
    );
  }

  if (input.limit !== undefined) {
    transactions = transactions.slice(0, input.limit);
  }

  return transactions;
}

function toQueryResult(
  query: TransactionQuery,
  transactions: IndustryTransaction[],
): TransactionQueryResult {
  const queryParts = [
    query.subjectId ?? "all-subjects",
    query.transactionType ?? "all-types",
    query.transactionStatus ?? "all-status",
    query.minTransactionScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `transaction-query-${queryParts.join("-")}`,
    query,
    transactions,
    hitCount: transactions.length,
    transactionReady: transactions.length > 0,
  };
}

export function findSupplierTransactions(limit = 5): TransactionQueryResult {
  return toQueryResult(
    { transactionType: "supplier", limit },
    applyTransactionQuery({ transactionType: "supplier", limit }, getTransactionsByType("supplier")),
  );
}

export function findBrandTransactions(limit = 5): TransactionQueryResult {
  return toQueryResult(
    { transactionType: "brand", limit },
    applyTransactionQuery({ transactionType: "brand", limit }, getTransactionsByType("brand")),
  );
}

export function findTenderTransactions(limit = 5): TransactionQueryResult {
  return toQueryResult(
    { transactionType: "tender", limit },
    applyTransactionQuery({ transactionType: "tender", limit }, getTransactionsByType("tender")),
  );
}

export function findPartnershipTransactions(limit = 5): TransactionQueryResult {
  return toQueryResult(
    { transactionType: "partnership", limit },
    applyTransactionQuery(
      { transactionType: "partnership", limit },
      getTransactionsByType("partnership"),
    ),
  );
}

export function findTopTransactions(limit = 5): TransactionQueryResult {
  return toQueryResult(
    { minTransactionScore: TOP_TRANSACTION_SCORE_THRESHOLD, limit },
    applyTransactionQuery(
      { minTransactionScore: TOP_TRANSACTION_SCORE_THRESHOLD, limit },
      buildIndustryTransactions(),
    ),
  );
}

export function executeTransactionQuery(query: TransactionQuery = {}): TransactionQueryResult {
  return toQueryResult(query, applyTransactionQuery(query, buildIndustryTransactions()));
}

export function validateTransactionQueryRegistry(): RegistryValidation {
  const canonical = executeTransactionQuery(CANONICAL_TRANSACTION_QUERY);
  const suppliers = findSupplierTransactions(3);
  const brands = findBrandTransactions(3);
  const tenders = findTenderTransactions(3);
  const partnerships = findPartnershipTransactions(3);
  const top = findTopTransactions(5);
  const subject = getTransactionsBySubject(CANONICAL_TRANSACTION_SUBJECT_ID);

  const valid =
    canonical.transactionReady &&
    canonical.hitCount >= 1 &&
    suppliers.hitCount >= 1 &&
    brands.hitCount >= 1 &&
    tenders.hitCount >= 2 &&
    partnerships.hitCount >= 1 &&
    top.hitCount >= 3 &&
    subject.length >= 1 &&
    canonical.transactions.every(
      (transaction) =>
        transaction.score.qualificationScore > 0 &&
        transaction.score.quotationScore > 0 &&
        transaction.score.executionScore > 0 &&
        transaction.score.completionScore > 0 &&
        transaction.score.confidenceScore > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `transaction-query canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}
