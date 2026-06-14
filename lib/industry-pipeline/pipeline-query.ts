import { validatePipelineContextRegistry } from "./pipeline-context";
import {
  buildIndustryPipelines,
  getPipelinesBySubject,
  getPipelinesByType,
  validatePipelineRegistry,
} from "./pipeline-registry";
import type {
  IndustryPipeline,
  IndustryPipelineValidation,
  RegistryValidation,
  PipelineQuery,
  PipelineQueryResult,
} from "./shared/types";
import {
  CANONICAL_PIPELINE_QUERY,
  CANONICAL_PIPELINE_SUBJECT_ID,
  TOP_PIPELINE_SCORE_THRESHOLD,
} from "./shared/types";

function applyPipelineQuery(input: PipelineQuery, source: IndustryPipeline[]): IndustryPipeline[] {
  let pipelines = [...source];

  if (input.subjectId) {
    pipelines = pipelines.filter((pipeline) => pipeline.subjectId === input.subjectId);
  }

  if (input.pipelineType) {
    pipelines = pipelines.filter((pipeline) => pipeline.pipelineType === input.pipelineType);
  }

  if (input.pipelineStatus) {
    pipelines = pipelines.filter((pipeline) => pipeline.pipelineStatus === input.pipelineStatus);
  }

  if (input.minPipelineScore !== undefined) {
    pipelines = pipelines.filter(
      (pipeline) => pipeline.score.totalPipelineScore >= input.minPipelineScore!,
    );
  }

  if (input.limit !== undefined) {
    pipelines = pipelines.slice(0, input.limit);
  }

  return pipelines;
}

function toQueryResult(query: PipelineQuery, pipelines: IndustryPipeline[]): PipelineQueryResult {
  const queryParts = [
    query.subjectId ?? "all-subjects",
    query.pipelineType ?? "all-types",
    query.pipelineStatus ?? "all-status",
    query.minPipelineScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `pipeline-query-${queryParts.join("-")}`,
    query,
    pipelines,
    hitCount: pipelines.length,
    pipelineReady: pipelines.length > 0,
  };
}

export function findSupplierPipelines(limit = 5): PipelineQueryResult {
  return toQueryResult(
    { pipelineType: "supplier", limit },
    applyPipelineQuery({ pipelineType: "supplier", limit }, getPipelinesByType("supplier")),
  );
}

export function findBrandPipelines(limit = 5): PipelineQueryResult {
  return toQueryResult(
    { pipelineType: "brand", limit },
    applyPipelineQuery({ pipelineType: "brand", limit }, getPipelinesByType("brand")),
  );
}

export function findTenderPipelines(limit = 5): PipelineQueryResult {
  return toQueryResult(
    { pipelineType: "tender", limit },
    applyPipelineQuery({ pipelineType: "tender", limit }, getPipelinesByType("tender")),
  );
}

export function findPartnershipPipelines(limit = 5): PipelineQueryResult {
  return toQueryResult(
    { pipelineType: "partnership", limit },
    applyPipelineQuery(
      { pipelineType: "partnership", limit },
      getPipelinesByType("partnership"),
    ),
  );
}

export function findTopPipelines(limit = 5): PipelineQueryResult {
  return toQueryResult(
    { minPipelineScore: TOP_PIPELINE_SCORE_THRESHOLD, limit },
    applyPipelineQuery(
      { minPipelineScore: TOP_PIPELINE_SCORE_THRESHOLD, limit },
      buildIndustryPipelines(),
    ),
  );
}

export function executePipelineQuery(query: PipelineQuery = {}): PipelineQueryResult {
  return toQueryResult(query, applyPipelineQuery(query, buildIndustryPipelines()));
}

export function validatePipelineQueryRegistry(): RegistryValidation {
  const canonical = executePipelineQuery(CANONICAL_PIPELINE_QUERY);
  const suppliers = findSupplierPipelines(3);
  const brands = findBrandPipelines(3);
  const tenders = findTenderPipelines(3);
  const partnerships = findPartnershipPipelines(3);
  const top = findTopPipelines(5);
  const subject = getPipelinesBySubject(CANONICAL_PIPELINE_SUBJECT_ID);

  const valid =
    canonical.pipelineReady &&
    canonical.hitCount >= 1 &&
    suppliers.hitCount >= 1 &&
    brands.hitCount >= 1 &&
    tenders.hitCount >= 2 &&
    partnerships.hitCount >= 1 &&
    top.hitCount >= 3 &&
    subject.length >= 1 &&
    canonical.pipelines.every(
      (pipeline) =>
        pipeline.score.feasibility > 0 &&
        pipeline.score.readiness > 0 &&
        pipeline.score.impact > 0 &&
        pipeline.score.urgency > 0 &&
        pipeline.score.confidence > 0 &&
        pipeline.score.workflowStrength > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `pipeline-query canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}

export function validateIndustryPipeline(): IndustryPipelineValidation {
  const pipelineRegistry = validatePipelineRegistry();
  const pipelineContext = validatePipelineContextRegistry();
  const pipelineQuery = validatePipelineQueryRegistry();

  return {
    valid: pipelineRegistry.valid && pipelineContext.valid && pipelineQuery.valid,
    pipelineRegistry,
    pipelineContext,
    pipelineQuery,
  };
}
