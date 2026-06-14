import { buildIndustryExecutions } from "@/lib/industry-execution";
import type { IndustryExecution } from "@/lib/industry-execution";
import { buildWorkflowScore, resolveWorkflowStatusFromExecution } from "./workflow-scoring";
import type { IndustryWorkflow, IndustryWorkflowType, RegistryValidation } from "./shared/types";
import { CANONICAL_WORKFLOW_SUBJECT_ID } from "./shared/types";

function executionToWorkflow(execution: IndustryExecution, rank: number): IndustryWorkflow {
  const workflowId = `ind-workflow-${execution.executionId}`;
  const score = buildWorkflowScore(workflowId, execution, rank);

  return {
    workflowId,
    executionId: execution.executionId,
    activationId: execution.activationId,
    opportunityId: execution.opportunityId,
    workflowType: execution.executionType,
    subjectId: execution.subjectId,
    subjectType: execution.subjectType,
    title: `${execution.title.replace(" — Execution", "")} — Workflow`,
    summary: `${execution.summary} Transitioned to industry workflow pipeline.`,
    insightIds: [...execution.insightIds],
    workflowStatus: resolveWorkflowStatusFromExecution(execution, score, rank),
    score,
    generatedAt: execution.generatedAt,
    metadata: {
      ...execution.metadata,
      sourceExecutionScore: execution.score.totalExecutionScore.toString(),
      sourceLayer: "v33-industry-execution",
    },
    mode: "industry-workflow",
  };
}

export function buildIndustryWorkflows(): IndustryWorkflow[] {
  const executions = buildIndustryExecutions();

  return executions.map((execution, index) => executionToWorkflow(execution, index + 1));
}

export function getWorkflowById(workflowId: string): IndustryWorkflow | undefined {
  return buildIndustryWorkflows().find((workflow) => workflow.workflowId === workflowId);
}

export function getWorkflowsByType(workflowType: IndustryWorkflowType): IndustryWorkflow[] {
  return buildIndustryWorkflows().filter((workflow) => workflow.workflowType === workflowType);
}

export function getWorkflowsBySubject(subjectId: string): IndustryWorkflow[] {
  return buildIndustryWorkflows().filter((workflow) => workflow.subjectId === subjectId);
}

export function validateWorkflowRegistry(): RegistryValidation {
  const workflows = buildIndustryWorkflows();
  const requiredTypes: IndustryWorkflowType[] = ["supplier", "brand", "tender", "partnership"];
  const requiredStatuses = ["draft", "planned", "running", "paused", "completed", "blocked"] as const;

  const typeCoverage = requiredTypes.every((type) =>
    workflows.some((workflow) => workflow.workflowType === type),
  );

  const statusCoverage = requiredStatuses.every((status) =>
    workflows.some((workflow) => workflow.workflowStatus === status),
  );

  const scoreValid = workflows.every(
    (workflow) =>
      workflow.score.feasibility > 0 &&
      workflow.score.readiness > 0 &&
      workflow.score.impact > 0 &&
      workflow.score.urgency > 0 &&
      workflow.score.confidence > 0 &&
      workflow.score.executionStrength > 0 &&
      workflow.score.totalWorkflowScore > 0 &&
      workflow.insightIds.length > 0 &&
      workflow.mode === "industry-workflow",
  );

  const canonical = getWorkflowsBySubject(CANONICAL_WORKFLOW_SUBJECT_ID);

  const valid =
    workflows.length >= 8 &&
    typeCoverage &&
    statusCoverage &&
    scoreValid &&
    canonical.length >= 1;

  return {
    valid,
    count: workflows.length,
    summary: `workflow-registry count=${workflows.length} types=${requiredTypes.filter((t) => workflows.some((w) => w.workflowType === t)).length}/4 statuses=${requiredStatuses.filter((s) => workflows.some((w) => w.workflowStatus === s)).length}/6 valid=${valid}`,
  };
}
