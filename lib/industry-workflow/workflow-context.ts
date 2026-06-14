import type { RegistryValidation } from "./shared/types";
import { buildIndustryWorkflows } from "./workflow-registry";
import type {
  IndustryWorkflowStatus,
  IndustryWorkflowType,
  WorkflowContext,
} from "./shared/types";
import {
  CANONICAL_WORKFLOW_SUBJECT_ID,
  INDUSTRY_WORKFLOW_TAG,
  INDUSTRY_WORKFLOW_VERSION,
} from "./shared/types";

function buildTypeBreakdown(
  workflows: ReturnType<typeof buildIndustryWorkflows>,
): Record<IndustryWorkflowType, number> {
  const breakdown: Record<IndustryWorkflowType, number> = {
    supplier: 0,
    brand: 0,
    tender: 0,
    partnership: 0,
  };

  for (const workflow of workflows) {
    breakdown[workflow.workflowType] += 1;
  }

  return breakdown;
}

function buildStatusBreakdown(
  workflows: ReturnType<typeof buildIndustryWorkflows>,
): Record<IndustryWorkflowStatus, number> {
  const breakdown: Record<IndustryWorkflowStatus, number> = {
    draft: 0,
    planned: 0,
    running: 0,
    paused: 0,
    completed: 0,
    blocked: 0,
  };

  for (const workflow of workflows) {
    breakdown[workflow.workflowStatus] += 1;
  }

  return breakdown;
}

export function buildWorkflowContext(): WorkflowContext {
  const workflows = buildIndustryWorkflows();

  return {
    contextId: `workflow-context-${INDUSTRY_WORKFLOW_VERSION}`,
    workflows,
    workflowCount: workflows.length,
    typeBreakdown: buildTypeBreakdown(workflows),
    statusBreakdown: buildStatusBreakdown(workflows),
    workflowReady: workflows.length > 0,
    mode: "industry-workflow",
  };
}

export function validateWorkflowContextState(context: WorkflowContext): boolean {
  const canonical = context.workflows.filter(
    (workflow) => workflow.subjectId === CANONICAL_WORKFLOW_SUBJECT_ID,
  );

  return (
    context.workflowReady &&
    context.workflowCount >= 8 &&
    context.workflows.length === context.workflowCount &&
    Object.values(context.typeBreakdown).every((count) => count > 0) &&
    Object.values(context.statusBreakdown).every((count) => count > 0) &&
    canonical.length >= 1 &&
    context.mode === "industry-workflow"
  );
}

export function validateWorkflowContextRegistry(): RegistryValidation {
  const context = buildWorkflowContext();
  const valid =
    validateWorkflowContextState(context) &&
    INDUSTRY_WORKFLOW_VERSION === "v34-industry-workflow-1" &&
    INDUSTRY_WORKFLOW_TAG === "v34-industry-workflow-foundation";

  return {
    valid,
    count: context.workflowCount,
    summary: `workflow-context count=${context.workflowCount} types=4/4 statuses=6/6 valid=${valid}`,
  };
}
