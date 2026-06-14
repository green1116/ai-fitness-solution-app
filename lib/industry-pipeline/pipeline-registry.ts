import { buildIndustryWorkflows } from "@/lib/industry-workflow";
import type { IndustryWorkflow } from "@/lib/industry-workflow";
import { buildPipelineScore, resolvePipelineStatusFromWorkflow } from "./pipeline-scoring";
import type { IndustryPipeline, IndustryPipelineType, RegistryValidation } from "./shared/types";
import { CANONICAL_PIPELINE_SUBJECT_ID } from "./shared/types";

function workflowToPipeline(workflow: IndustryWorkflow, rank: number): IndustryPipeline {
  const pipelineId = `ind-pipeline-${workflow.workflowId}`;
  const score = buildPipelineScore(pipelineId, workflow, rank);

  return {
    pipelineId,
    workflowId: workflow.workflowId,
    executionId: workflow.executionId,
    activationId: workflow.activationId,
    opportunityId: workflow.opportunityId,
    pipelineType: workflow.workflowType,
    subjectId: workflow.subjectId,
    subjectType: workflow.subjectType,
    title: `${workflow.title.replace(" — Workflow", "")} — Pipeline`,
    summary: `${workflow.summary} Transitioned to industry pipeline stage.`,
    insightIds: [...workflow.insightIds],
    pipelineStatus: resolvePipelineStatusFromWorkflow(workflow, score, rank),
    score,
    generatedAt: workflow.generatedAt,
    metadata: {
      ...workflow.metadata,
      sourceWorkflowScore: workflow.score.totalWorkflowScore.toString(),
      sourceLayer: "v34-industry-workflow",
    },
    mode: "industry-pipeline",
  };
}

export function buildIndustryPipelines(): IndustryPipeline[] {
  const workflows = buildIndustryWorkflows();

  return workflows.map((workflow, index) => workflowToPipeline(workflow, index + 1));
}

export function getPipelineById(pipelineId: string): IndustryPipeline | undefined {
  return buildIndustryPipelines().find((pipeline) => pipeline.pipelineId === pipelineId);
}

export function getPipelinesByType(pipelineType: IndustryPipelineType): IndustryPipeline[] {
  return buildIndustryPipelines().filter((pipeline) => pipeline.pipelineType === pipelineType);
}

export function getPipelinesBySubject(subjectId: string): IndustryPipeline[] {
  return buildIndustryPipelines().filter((pipeline) => pipeline.subjectId === subjectId);
}

export function validatePipelineRegistry(): RegistryValidation {
  const pipelines = buildIndustryPipelines();
  const requiredTypes: IndustryPipelineType[] = ["supplier", "brand", "tender", "partnership"];
  const requiredStatuses = [
    "lead",
    "qualified",
    "engaged",
    "proposal",
    "negotiation",
    "won",
    "lost",
  ] as const;

  const typeCoverage = requiredTypes.every((type) =>
    pipelines.some((pipeline) => pipeline.pipelineType === type),
  );

  const statusCoverage = requiredStatuses.every((status) =>
    pipelines.some((pipeline) => pipeline.pipelineStatus === status),
  );

  const scoreValid = pipelines.every(
    (pipeline) =>
      pipeline.score.feasibility > 0 &&
      pipeline.score.readiness > 0 &&
      pipeline.score.impact > 0 &&
      pipeline.score.urgency > 0 &&
      pipeline.score.confidence > 0 &&
      pipeline.score.workflowStrength > 0 &&
      pipeline.score.totalPipelineScore > 0 &&
      pipeline.insightIds.length > 0 &&
      pipeline.mode === "industry-pipeline",
  );

  const canonical = getPipelinesBySubject(CANONICAL_PIPELINE_SUBJECT_ID);

  const valid =
    pipelines.length >= 8 &&
    typeCoverage &&
    statusCoverage &&
    scoreValid &&
    canonical.length >= 1;

  return {
    valid,
    count: pipelines.length,
    summary: `pipeline-registry count=${pipelines.length} types=${requiredTypes.filter((t) => pipelines.some((p) => p.pipelineType === t)).length}/4 statuses=${requiredStatuses.filter((s) => pipelines.some((p) => p.pipelineStatus === s)).length}/7 valid=${valid}`,
  };
}
