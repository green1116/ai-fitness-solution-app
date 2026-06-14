import { validateExecutionContextRegistry } from "./execution-context";
import {
  buildIndustryExecutions,
  getExecutionsBySubject,
  getExecutionsByType,
  validateExecutionRegistry,
} from "./execution-registry";
import type {
  ExecutionQuery,
  ExecutionQueryResult,
  IndustryExecution,
  IndustryExecutionValidation,
  RegistryValidation,
} from "./shared/types";
import {
  CANONICAL_EXECUTION_QUERY,
  CANONICAL_EXECUTION_SUBJECT_ID,
  TOP_EXECUTION_SCORE_THRESHOLD,
} from "./shared/types";

function applyExecutionQuery(input: ExecutionQuery, source: IndustryExecution[]): IndustryExecution[] {
  let executions = [...source];

  if (input.subjectId) {
    executions = executions.filter((execution) => execution.subjectId === input.subjectId);
  }

  if (input.executionType) {
    executions = executions.filter((execution) => execution.executionType === input.executionType);
  }

  if (input.executionStatus) {
    executions = executions.filter(
      (execution) => execution.executionStatus === input.executionStatus,
    );
  }

  if (input.minExecutionScore !== undefined) {
    executions = executions.filter(
      (execution) => execution.score.totalExecutionScore >= input.minExecutionScore!,
    );
  }

  if (input.limit !== undefined) {
    executions = executions.slice(0, input.limit);
  }

  return executions;
}

function toQueryResult(query: ExecutionQuery, executions: IndustryExecution[]): ExecutionQueryResult {
  const queryParts = [
    query.subjectId ?? "all-subjects",
    query.executionType ?? "all-types",
    query.executionStatus ?? "all-status",
    query.minExecutionScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `execution-query-${queryParts.join("-")}`,
    query,
    executions,
    hitCount: executions.length,
    executionReady: executions.length > 0,
  };
}

export function findSupplierExecutions(limit = 5): ExecutionQueryResult {
  return toQueryResult(
    { executionType: "supplier", limit },
    applyExecutionQuery({ executionType: "supplier", limit }, getExecutionsByType("supplier")),
  );
}

export function findBrandExecutions(limit = 5): ExecutionQueryResult {
  return toQueryResult(
    { executionType: "brand", limit },
    applyExecutionQuery({ executionType: "brand", limit }, getExecutionsByType("brand")),
  );
}

export function findTenderExecutions(limit = 5): ExecutionQueryResult {
  return toQueryResult(
    { executionType: "tender", limit },
    applyExecutionQuery({ executionType: "tender", limit }, getExecutionsByType("tender")),
  );
}

export function findPartnershipExecutions(limit = 5): ExecutionQueryResult {
  return toQueryResult(
    { executionType: "partnership", limit },
    applyExecutionQuery({ executionType: "partnership", limit }, getExecutionsByType("partnership")),
  );
}

export function findTopExecutions(limit = 5): ExecutionQueryResult {
  return toQueryResult(
    { minExecutionScore: TOP_EXECUTION_SCORE_THRESHOLD, limit },
    applyExecutionQuery(
      { minExecutionScore: TOP_EXECUTION_SCORE_THRESHOLD, limit },
      buildIndustryExecutions(),
    ),
  );
}

export function executeExecutionQuery(query: ExecutionQuery = {}): ExecutionQueryResult {
  return toQueryResult(query, applyExecutionQuery(query, buildIndustryExecutions()));
}

export function validateExecutionQueryRegistry(): RegistryValidation {
  const canonical = executeExecutionQuery(CANONICAL_EXECUTION_QUERY);
  const suppliers = findSupplierExecutions(3);
  const brands = findBrandExecutions(3);
  const tenders = findTenderExecutions(3);
  const partnerships = findPartnershipExecutions(3);
  const top = findTopExecutions(5);
  const subject = getExecutionsBySubject(CANONICAL_EXECUTION_SUBJECT_ID);

  const valid =
    canonical.executionReady &&
    canonical.hitCount >= 1 &&
    suppliers.hitCount >= 1 &&
    brands.hitCount >= 1 &&
    tenders.hitCount >= 2 &&
    partnerships.hitCount >= 1 &&
    top.hitCount >= 3 &&
    subject.length >= 1 &&
    canonical.executions.every(
      (execution) =>
        execution.score.feasibility > 0 &&
        execution.score.readiness > 0 &&
        execution.score.impact > 0 &&
        execution.score.urgency > 0 &&
        execution.score.confidence > 0 &&
        execution.score.activationStrength > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `execution-query canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}

export function validateIndustryExecution(): IndustryExecutionValidation {
  const executionRegistry = validateExecutionRegistry();
  const executionContext = validateExecutionContextRegistry();
  const executionQuery = validateExecutionQueryRegistry();

  return {
    valid: executionRegistry.valid && executionContext.valid && executionQuery.valid,
    executionRegistry,
    executionContext,
    executionQuery,
  };
}
