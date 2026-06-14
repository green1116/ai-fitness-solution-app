/**
 * V35 Industry Transaction Foundation — Phase 3 verification
 */
import {
  buildCompletedTransactions,
  buildExecutingTransactions,
  buildIndustryTransactions,
  buildPartnershipSettlement,
  buildQualifiedTransactions,
  buildQuotedTransactions,
  buildSupplierSettlement,
  buildTenderSettlement,
  buildTransactionContext,
  buildTransactionLifecycle,
  buildTransactionSettlement,
  CANONICAL_TRANSACTION_QUERY,
  CANONICAL_TRANSACTION_SUBJECT_ID,
  executeTransactionQuery,
  findBrandTransactions,
  findPartnershipTransactions,
  findSupplierTransactions,
  findTenderTransactions,
  findTopTransactions,
  getTransactionsBySubject,
  INDUSTRY_TRANSACTION_TAG,
  INDUSTRY_TRANSACTION_VERSION,
  TOP_TRANSACTION_SCORE_THRESHOLD,
  validateIndustryTransaction,
  validateTransactionContextRegistry,
  validateTransactionContextState,
  validateTransactionLifecycleRegistry,
  validateTransactionQueryRegistry,
  validateTransactionRegistry,
  validateTransactionSettlementRegistry,
} from "../lib/industry-transaction";
import { validateIndustryMarketplace } from "../lib/industry-marketplace";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testTransactionRegistry() {
  const result = validateTransactionRegistry();
  assert(result.valid, "transaction registry valid");
  assert(result.count >= 8, "transaction count");

  const transactions = buildIndustryTransactions();
  assert(
    transactions.every(
      (transaction) =>
        transaction.marketplaceId.length > 0 &&
        transaction.score.totalTransactionScore > 0 &&
        transaction.score.qualificationScore > 0,
    ),
    "transactions derived from marketplace",
  );

  console.log("✓ transaction registry");
  console.log(" ", result.summary);
}

function testTransactionContext() {
  const result = validateTransactionContextRegistry();
  assert(result.valid, "transaction context registry valid");

  const context = buildTransactionContext();
  assert(validateTransactionContextState(context), "transaction context valid");
  assert(context.transactionReady, "transaction ready");

  console.log("✓ transaction context");
  console.log(" ", result.summary);
}

function testTransactionQuery() {
  const result = validateTransactionQueryRegistry();
  assert(result.valid, "transaction query registry valid");

  const canonical = executeTransactionQuery(CANONICAL_TRANSACTION_QUERY);
  const suppliers = findSupplierTransactions(3);
  const brands = findBrandTransactions(3);
  const tenders = findTenderTransactions(3);
  const partnerships = findPartnershipTransactions(3);
  const top = findTopTransactions(5);
  const subject = getTransactionsBySubject(CANONICAL_TRANSACTION_SUBJECT_ID);

  assert(canonical.transactionReady, "canonical query ready");
  assert(suppliers.hitCount >= 1, "findSupplierTransactions");
  assert(brands.hitCount >= 1, "findBrandTransactions");
  assert(tenders.hitCount >= 2, "findTenderTransactions");
  assert(partnerships.hitCount >= 1, "findPartnershipTransactions");
  assert(top.hitCount >= 3, "findTopTransactions");
  assert(subject.length >= 1, "subject transactions");

  const topTransaction = top.transactions[0]!;
  assert(topTransaction.score.totalTransactionScore >= TOP_TRANSACTION_SCORE_THRESHOLD, "top threshold");
  assert(
    topTransaction.score.qualificationScore > 0 &&
      topTransaction.score.quotationScore > 0 &&
      topTransaction.score.executionScore > 0 &&
      topTransaction.score.completionScore > 0 &&
      topTransaction.score.confidenceScore > 0,
    "transaction score dimensions",
  );

  console.log("✓ transaction query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} topScore=${topTransaction.score.totalTransactionScore}`,
  );
}

function testTransactionLifecycle() {
  const result = validateTransactionLifecycleRegistry();
  assert(result.valid, "transaction lifecycle registry valid");

  const lifecycle = buildTransactionLifecycle();
  assert(lifecycle.lifecycleReady, "transaction lifecycle ready");
  assert(buildQualifiedTransactions().length >= 1, "buildQualifiedTransactions");
  assert(buildQuotedTransactions().length >= 1, "buildQuotedTransactions");
  assert(buildExecutingTransactions().length >= 1, "buildExecutingTransactions");
  assert(buildCompletedTransactions().length >= 1, "buildCompletedTransactions");

  console.log("✓ transaction lifecycle");
  console.log(" ", result.summary);
}

function testTransactionSettlement() {
  const result = validateTransactionSettlementRegistry();
  assert(result.valid, "transaction settlement registry valid");

  const settlement = buildTransactionSettlement();
  assert(settlement.settlementReady, "transaction settlement ready");
  assert(buildSupplierSettlement().length >= 1, "buildSupplierSettlement");
  assert(buildTenderSettlement().length >= 1, "buildTenderSettlement");

  console.log("✓ transaction settlement");
  console.log(" ", result.summary);
}

function testIndustryTransaction() {
  const validation = validateIndustryTransaction();
  assert(validation.valid, "industry transaction validation");
  assert(INDUSTRY_TRANSACTION_VERSION === "v35-industry-transaction-1", "transaction version");
  assert(INDUSTRY_TRANSACTION_TAG === "v35-industry-transaction-foundation", "transaction tag");

  const marketplaceValidation = validateIndustryMarketplace();
  assert(marketplaceValidation.valid, "underlying marketplace layer unchanged");

  console.log("✓ industry transaction validation");
  console.log(
    " ",
    `registry=${validation.transactionRegistry.valid} context=${validation.transactionContext.valid} query=${validation.transactionQuery.valid} lifecycle=${validation.transactionLifecycle.valid} settlement=${validation.transactionSettlement.valid}`,
  );
}

testTransactionRegistry();
testTransactionContext();
testTransactionQuery();
testTransactionLifecycle();
testTransactionSettlement();
testIndustryTransaction();
console.log("Industry Transaction Foundation PASS");
