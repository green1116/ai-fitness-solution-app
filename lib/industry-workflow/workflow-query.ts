import { validateWorkflowContextRegistry } from "./workflow-context";
import {
  buildIndustryWorkflows,
  getWorkflowsBySubject,
  getWorkflowsByType,
  validateWorkflowRegistry,
} from "./workflow-registry";
import type {
  IndustryWorkflow,
  IndustryWorkflowValidation,
  RegistryValidation,
  WorkflowQuery,
  WorkflowQueryResult,
} from "./shared/types";
import {
  CANONICAL_WORKFLOW_QUERY,
  CANONICAL_WORKFLOW_SUBJECT_ID,
  TOP_WORKFLOW_SCORE_THRESHOLD,
} from "./shared/types";

function applyWorkflowQuery(input: WorkflowQuery, source: IndustryWorkflow[]): IndustryWorkflow[] {
  let workflows = [...source];

  if (input.subjectId) {
    workflows = workflows.filter((workflow) => workflow.subjectId === input.subjectId);
  }

  if (input.workflowType) {
    workflows = workflows.filter((workflow) => workflow.workflowType === input.workflowType);
  }

  if (input.workflowStatus) {
    workflows = workflows.filter((workflow) => workflow.workflowStatus === input.workflowStatus);
  }

  if (input.minWorkflowScore !== undefined) {
    workflows = workflows.filter(
      (workflow) => workflow.score.totalWorkflowScore >= input.minWorkflowScore!,
    );
  }

  if (input.limit !== undefined) {
    workflows = workflows.slice(0, input.limit);
  }

  return workflows;
}

function toQueryResult(query: WorkflowQuery, workflows: IndustryWorkflow[]): WorkflowQueryResult {
  const queryParts = [
    query.subjectId ?? "all-subjects",
    query.workflowType ?? "all-types",
    query.workflowStatus ?? "all-status",
    query.minWorkflowScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `workflow-query-${queryParts.join("-")}`,
    query,
    workflows,
    hitCount: workflows.length,
    workflowReady: workflows.length > 0,
  };
}

export function findSupplierWorkflows(limit = 5): WorkflowQueryResult {
  return toQueryResult(
    { workflowType: "supplier", limit },
    applyWorkflowQuery({ workflowType: "supplier", limit }, getWorkflowsByType("supplier")),
  );
}

export function findBrandWorkflows(limit = 5): WorkflowQueryResult {
  return toQueryResult(
    { workflowType: "brand", limit },
    applyWorkflowQuery({ workflowType: "brand", limit }, getWorkflowsByType("brand")),
  );
}

export function findTenderWorkflows(limit = 5): WorkflowQueryResult {
  return toQueryResult(
    { workflowType: "tender", limit },
    applyWorkflowQuery({ workflowType: "tender", limit }, getWorkflowsByType("tender")),
  );
}

export function findPartnershipWorkflows(limit = 5): WorkflowQueryResult {
  return toQueryResult(
    { workflowType: "partnership", limit },
    applyWorkflowQuery({ workflowType: "partnership", limit }, getWorkflowsByType("partnership")),
  );
}

export function findTopWorkflows(limit = 5): WorkflowQueryResult {
  return toQueryResult(
    { minWorkflowScore: TOP_WORKFLOW_SCORE_THRESHOLD, limit },
    applyWorkflowQuery(
      { minWorkflowScore: TOP_WORKFLOW_SCORE_THRESHOLD, limit },
      buildIndustryWorkflows(),
    ),
  );
}

export function executeWorkflowQuery(query: WorkflowQuery = {}): WorkflowQueryResult {
  return toQueryResult(query, applyWorkflowQuery(query, buildIndustryWorkflows()));
}

export function validateWorkflowQueryRegistry(): RegistryValidation {
  const canonical = executeWorkflowQuery(CANONICAL_WORKFLOW_QUERY);
  const suppliers = findSupplierWorkflows(3);
  const brands = findBrandWorkflows(3);
  const tenders = findTenderWorkflows(3);
  const partnerships = findPartnershipWorkflows(3);
  const top = findTopWorkflows(5);
  const subject = getWorkflowsBySubject(CANONICAL_WORKFLOW_SUBJECT_ID);

  const valid =
    canonical.workflowReady &&
    canonical.hitCount >= 1 &&
    suppliers.hitCount >= 1 &&
    brands.hitCount >= 1 &&
    tenders.hitCount >= 2 &&
    partnerships.hitCount >= 1 &&
    top.hitCount >= 3 &&
    subject.length >= 1 &&
    canonical.workflows.every(
      (workflow) =>
        workflow.score.feasibility > 0 &&
        workflow.score.readiness > 0 &&
        workflow.score.impact > 0 &&
        workflow.score.urgency > 0 &&
        workflow.score.confidence > 0 &&
        workflow.score.executionStrength > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `workflow-query canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}

export function validateIndustryWorkflow(): IndustryWorkflowValidation {
  const workflowRegistry = validateWorkflowRegistry();
  const workflowContext = validateWorkflowContextRegistry();
  const workflowQuery = validateWorkflowQueryRegistry();

  return {
    valid: workflowRegistry.valid && workflowContext.valid && workflowQuery.valid,
    workflowRegistry,
    workflowContext,
    workflowQuery,
  };
}
