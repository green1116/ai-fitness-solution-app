import type { RegistryValidation } from "./shared/types";
import { buildIndustryPipelines } from "./pipeline-registry";
import type {
  IndustryPipelineStatus,
  IndustryPipelineType,
  PipelineContext,
} from "./shared/types";
import {
  CANONICAL_PIPELINE_SUBJECT_ID,
  INDUSTRY_PIPELINE_TAG,
  INDUSTRY_PIPELINE_VERSION,
} from "./shared/types";

function buildTypeBreakdown(
  pipelines: ReturnType<typeof buildIndustryPipelines>,
): Record<IndustryPipelineType, number> {
  const breakdown: Record<IndustryPipelineType, number> = {
    supplier: 0,
    brand: 0,
    tender: 0,
    partnership: 0,
  };

  for (const pipeline of pipelines) {
    breakdown[pipeline.pipelineType] += 1;
  }

  return breakdown;
}

function buildStatusBreakdown(
  pipelines: ReturnType<typeof buildIndustryPipelines>,
): Record<IndustryPipelineStatus, number> {
  const breakdown: Record<IndustryPipelineStatus, number> = {
    lead: 0,
    qualified: 0,
    engaged: 0,
    proposal: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
  };

  for (const pipeline of pipelines) {
    breakdown[pipeline.pipelineStatus] += 1;
  }

  return breakdown;
}

export function buildPipelineContext(): PipelineContext {
  const pipelines = buildIndustryPipelines();

  return {
    contextId: `pipeline-context-${INDUSTRY_PIPELINE_VERSION}`,
    pipelines,
    pipelineCount: pipelines.length,
    typeBreakdown: buildTypeBreakdown(pipelines),
    statusBreakdown: buildStatusBreakdown(pipelines),
    pipelineReady: pipelines.length > 0,
    mode: "industry-pipeline",
  };
}

export function validatePipelineContextState(context: PipelineContext): boolean {
  const canonical = context.pipelines.filter(
    (pipeline) => pipeline.subjectId === CANONICAL_PIPELINE_SUBJECT_ID,
  );

  return (
    context.pipelineReady &&
    context.pipelineCount >= 8 &&
    context.pipelines.length === context.pipelineCount &&
    Object.values(context.typeBreakdown).every((count) => count > 0) &&
    Object.values(context.statusBreakdown).every((count) => count > 0) &&
    canonical.length >= 1 &&
    context.mode === "industry-pipeline"
  );
}

export function validatePipelineContextRegistry(): RegistryValidation {
  const context = buildPipelineContext();
  const valid =
    validatePipelineContextState(context) &&
    INDUSTRY_PIPELINE_VERSION === "v34-industry-pipeline-1" &&
    INDUSTRY_PIPELINE_TAG === "v34-industry-pipeline-foundation";

  return {
    valid,
    count: context.pipelineCount,
    summary: `pipeline-context count=${context.pipelineCount} types=4/4 statuses=7/7 valid=${valid}`,
  };
}
