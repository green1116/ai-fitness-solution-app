import type { RegistryValidation } from "./shared/types";
import { buildIndustryExecutions } from "./execution-registry";
import type {
  ExecutionContext,
  IndustryExecutionStatus,
  IndustryExecutionType,
} from "./shared/types";
import {
  CANONICAL_EXECUTION_SUBJECT_ID,
  INDUSTRY_EXECUTION_TAG,
  INDUSTRY_EXECUTION_VERSION,
} from "./shared/types";

function buildTypeBreakdown(
  executions: ReturnType<typeof buildIndustryExecutions>,
): Record<IndustryExecutionType, number> {
  const breakdown: Record<IndustryExecutionType, number> = {
    supplier: 0,
    brand: 0,
    tender: 0,
    partnership: 0,
  };

  for (const execution of executions) {
    breakdown[execution.executionType] += 1;
  }

  return breakdown;
}

function buildStatusBreakdown(
  executions: ReturnType<typeof buildIndustryExecutions>,
): Record<IndustryExecutionStatus, number> {
  const breakdown: Record<IndustryExecutionStatus, number> = {
    planned: 0,
    ready: 0,
    executing: 0,
    completed: 0,
    blocked: 0,
  };

  for (const execution of executions) {
    breakdown[execution.executionStatus] += 1;
  }

  return breakdown;
}

export function buildExecutionContext(): ExecutionContext {
  const executions = buildIndustryExecutions();

  return {
    contextId: `execution-context-${INDUSTRY_EXECUTION_VERSION}`,
    executions,
    executionCount: executions.length,
    typeBreakdown: buildTypeBreakdown(executions),
    statusBreakdown: buildStatusBreakdown(executions),
    executionReady: executions.length > 0,
    mode: "industry-execution",
  };
}

export function validateExecutionContextState(context: ExecutionContext): boolean {
  const canonical = context.executions.filter(
    (execution) => execution.subjectId === CANONICAL_EXECUTION_SUBJECT_ID,
  );

  return (
    context.executionReady &&
    context.executionCount >= 8 &&
    context.executions.length === context.executionCount &&
    Object.values(context.typeBreakdown).every((count) => count > 0) &&
    Object.values(context.statusBreakdown).every((count) => count > 0) &&
    canonical.length >= 1 &&
    context.mode === "industry-execution"
  );
}

export function validateExecutionContextRegistry(): RegistryValidation {
  const context = buildExecutionContext();
  const valid =
    validateExecutionContextState(context) &&
    INDUSTRY_EXECUTION_VERSION === "v33-industry-execution-1" &&
    INDUSTRY_EXECUTION_TAG === "v33-industry-execution-foundation";

  return {
    valid,
    count: context.executionCount,
    summary: `execution-context count=${context.executionCount} types=4/4 statuses=5/5 valid=${valid}`,
  };
}
