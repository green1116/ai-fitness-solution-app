/**
 * V33 Industry Execution Foundation — Phase 4 verification
 */
import {
  buildExecutionContext,
  buildIndustryExecutions,
  CANONICAL_EXECUTION_QUERY,
  CANONICAL_EXECUTION_SUBJECT_ID,
  executeExecutionQuery,
  findBrandExecutions,
  findPartnershipExecutions,
  findSupplierExecutions,
  findTenderExecutions,
  findTopExecutions,
  getExecutionsBySubject,
  INDUSTRY_EXECUTION_TAG,
  INDUSTRY_EXECUTION_VERSION,
  TOP_EXECUTION_SCORE_THRESHOLD,
  validateExecutionContextRegistry,
  validateExecutionContextState,
  validateExecutionQueryRegistry,
  validateExecutionRegistry,
  validateIndustryExecution,
} from "../lib/industry-execution";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testExecutionRegistry() {
  const result = validateExecutionRegistry();
  assert(result.valid, "execution registry valid");
  assert(result.count >= 8, "execution count");

  const executions = buildIndustryExecutions();
  assert(
    executions.every(
      (execution) =>
        execution.activationId.length > 0 &&
        execution.score.totalExecutionScore > 0 &&
        execution.score.activationStrength > 0,
    ),
    "executions derived from activations",
  );

  console.log("✓ execution registry");
  console.log(" ", result.summary);
}

function testExecutionContext() {
  const result = validateExecutionContextRegistry();
  assert(result.valid, "execution context registry valid");

  const context = buildExecutionContext();
  assert(validateExecutionContextState(context), "execution context valid");
  assert(context.executionReady, "execution ready");

  console.log("✓ execution context");
  console.log(" ", result.summary);
}

function testExecutionQuery() {
  const result = validateExecutionQueryRegistry();
  assert(result.valid, "execution query registry valid");

  const canonical = executeExecutionQuery(CANONICAL_EXECUTION_QUERY);
  const suppliers = findSupplierExecutions(3);
  const brands = findBrandExecutions(3);
  const tenders = findTenderExecutions(3);
  const partnerships = findPartnershipExecutions(3);
  const top = findTopExecutions(5);
  const subject = getExecutionsBySubject(CANONICAL_EXECUTION_SUBJECT_ID);

  assert(canonical.executionReady, "canonical query ready");
  assert(suppliers.hitCount >= 1, "findSupplierExecutions");
  assert(brands.hitCount >= 1, "findBrandExecutions");
  assert(tenders.hitCount >= 2, "findTenderExecutions");
  assert(partnerships.hitCount >= 1, "findPartnershipExecutions");
  assert(top.hitCount >= 3, "findTopExecutions");
  assert(subject.length >= 1, "subject executions");

  const topExecution = top.executions[0]!;
  assert(topExecution.score.totalExecutionScore >= TOP_EXECUTION_SCORE_THRESHOLD, "top threshold");
  assert(
    topExecution.score.feasibility > 0 &&
      topExecution.score.readiness > 0 &&
      topExecution.score.impact > 0 &&
      topExecution.score.urgency > 0 &&
      topExecution.score.confidence > 0 &&
      topExecution.score.activationStrength > 0,
    "execution score dimensions",
  );

  console.log("✓ execution query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} topScore=${topExecution.score.totalExecutionScore}`,
  );
}

function testIndustryExecution() {
  const validation = validateIndustryExecution();
  assert(validation.valid, "industry execution validation");
  assert(INDUSTRY_EXECUTION_VERSION === "v33-industry-execution-1", "execution version");
  assert(INDUSTRY_EXECUTION_TAG === "v33-industry-execution-foundation", "execution tag");

  console.log("✓ industry execution validation");
  console.log(
    " ",
    `registry=${validation.executionRegistry.valid} context=${validation.executionContext.valid} query=${validation.executionQuery.valid}`,
  );
}

testExecutionRegistry();
testExecutionContext();
testExecutionQuery();
testIndustryExecution();
console.log("Industry Execution Foundation PASS");
