/**
 * V34 Industry Workflow Foundation — Phase 1 verification
 */
import {
  buildIndustryWorkflows,
  buildWorkflowContext,
  CANONICAL_WORKFLOW_QUERY,
  CANONICAL_WORKFLOW_SUBJECT_ID,
  executeWorkflowQuery,
  findBrandWorkflows,
  findPartnershipWorkflows,
  findSupplierWorkflows,
  findTenderWorkflows,
  findTopWorkflows,
  getWorkflowsBySubject,
  INDUSTRY_WORKFLOW_TAG,
  INDUSTRY_WORKFLOW_VERSION,
  TOP_WORKFLOW_SCORE_THRESHOLD,
  validateIndustryWorkflow,
  validateWorkflowContextRegistry,
  validateWorkflowContextState,
  validateWorkflowQueryRegistry,
  validateWorkflowRegistry,
} from "../lib/industry-workflow";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testWorkflowRegistry() {
  const result = validateWorkflowRegistry();
  assert(result.valid, "workflow registry valid");
  assert(result.count >= 8, "workflow count");

  const workflows = buildIndustryWorkflows();
  assert(
    workflows.every(
      (workflow) =>
        workflow.executionId.length > 0 &&
        workflow.score.totalWorkflowScore > 0 &&
        workflow.score.executionStrength > 0,
    ),
    "workflows derived from executions",
  );

  console.log("✓ workflow registry");
  console.log(" ", result.summary);
}

function testWorkflowContext() {
  const result = validateWorkflowContextRegistry();
  assert(result.valid, "workflow context registry valid");

  const context = buildWorkflowContext();
  assert(validateWorkflowContextState(context), "workflow context valid");
  assert(context.workflowReady, "workflow ready");

  console.log("✓ workflow context");
  console.log(" ", result.summary);
}

function testWorkflowQuery() {
  const result = validateWorkflowQueryRegistry();
  assert(result.valid, "workflow query registry valid");

  const canonical = executeWorkflowQuery(CANONICAL_WORKFLOW_QUERY);
  const suppliers = findSupplierWorkflows(3);
  const brands = findBrandWorkflows(3);
  const tenders = findTenderWorkflows(3);
  const partnerships = findPartnershipWorkflows(3);
  const top = findTopWorkflows(5);
  const subject = getWorkflowsBySubject(CANONICAL_WORKFLOW_SUBJECT_ID);

  assert(canonical.workflowReady, "canonical query ready");
  assert(suppliers.hitCount >= 1, "findSupplierWorkflows");
  assert(brands.hitCount >= 1, "findBrandWorkflows");
  assert(tenders.hitCount >= 2, "findTenderWorkflows");
  assert(partnerships.hitCount >= 1, "findPartnershipWorkflows");
  assert(top.hitCount >= 3, "findTopWorkflows");
  assert(subject.length >= 1, "subject workflows");

  const topWorkflow = top.workflows[0]!;
  assert(topWorkflow.score.totalWorkflowScore >= TOP_WORKFLOW_SCORE_THRESHOLD, "top threshold");
  assert(
    topWorkflow.score.feasibility > 0 &&
      topWorkflow.score.readiness > 0 &&
      topWorkflow.score.impact > 0 &&
      topWorkflow.score.urgency > 0 &&
      topWorkflow.score.confidence > 0 &&
      topWorkflow.score.executionStrength > 0,
    "workflow score dimensions",
  );

  console.log("✓ workflow query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} topScore=${topWorkflow.score.totalWorkflowScore}`,
  );
}

function testIndustryWorkflow() {
  const validation = validateIndustryWorkflow();
  assert(validation.valid, "industry workflow validation");
  assert(INDUSTRY_WORKFLOW_VERSION === "v34-industry-workflow-1", "workflow version");
  assert(INDUSTRY_WORKFLOW_TAG === "v34-industry-workflow-foundation", "workflow tag");

  console.log("✓ industry workflow validation");
  console.log(
    " ",
    `registry=${validation.workflowRegistry.valid} context=${validation.workflowContext.valid} query=${validation.workflowQuery.valid}`,
  );
}

testWorkflowRegistry();
testWorkflowContext();
testWorkflowQuery();
testIndustryWorkflow();
console.log("Industry Workflow Foundation PASS");
