import { buildIndustryPipelines } from "@/lib/industry-pipeline";
import type { IndustryPipeline } from "@/lib/industry-pipeline";
import { buildLifecycleScore, resolveLifecycleStatusFromPipeline } from "./lifecycle-scoring";
import type { IndustryLifecycle, IndustryLifecycleType, RegistryValidation } from "./shared/types";
import { CANONICAL_LIFECYCLE_SUBJECT_ID } from "./shared/types";

function pipelineToLifecycle(pipeline: IndustryPipeline, rank: number): IndustryLifecycle {
  const lifecycleId = `ind-lifecycle-${pipeline.pipelineId}`;
  const score = buildLifecycleScore(lifecycleId, pipeline, rank);

  return {
    lifecycleId,
    pipelineId: pipeline.pipelineId,
    workflowId: pipeline.workflowId,
    executionId: pipeline.executionId,
    activationId: pipeline.activationId,
    opportunityId: pipeline.opportunityId,
    lifecycleType: pipeline.pipelineType,
    subjectId: pipeline.subjectId,
    subjectType: pipeline.subjectType,
    title: `${pipeline.title.replace(" — Pipeline", "")} — Lifecycle`,
    summary: `${pipeline.summary} Transitioned to industry lifecycle stage.`,
    insightIds: [...pipeline.insightIds],
    lifecycleStatus: resolveLifecycleStatusFromPipeline(pipeline, score, rank),
    score,
    generatedAt: pipeline.generatedAt,
    metadata: {
      ...pipeline.metadata,
      sourcePipelineScore: pipeline.score.totalPipelineScore.toString(),
      sourceLayer: "v34-industry-pipeline",
    },
    mode: "industry-lifecycle",
  };
}

export function buildIndustryLifecycles(): IndustryLifecycle[] {
  const pipelines = buildIndustryPipelines();

  return pipelines.map((pipeline, index) => pipelineToLifecycle(pipeline, index + 1));
}

export function getLifecycleById(lifecycleId: string): IndustryLifecycle | undefined {
  return buildIndustryLifecycles().find((lifecycle) => lifecycle.lifecycleId === lifecycleId);
}

export function getLifecyclesByType(lifecycleType: IndustryLifecycleType): IndustryLifecycle[] {
  return buildIndustryLifecycles().filter((lifecycle) => lifecycle.lifecycleType === lifecycleType);
}

export function getLifecyclesBySubject(subjectId: string): IndustryLifecycle[] {
  return buildIndustryLifecycles().filter((lifecycle) => lifecycle.subjectId === subjectId);
}

export function validateLifecycleRegistry(): RegistryValidation {
  const lifecycles = buildIndustryLifecycles();
  const requiredTypes: IndustryLifecycleType[] = ["supplier", "brand", "tender", "partnership"];
  const requiredStatuses = [
    "discovered",
    "qualified",
    "designed",
    "bidding",
    "awarded",
    "delivering",
    "retained",
    "closed",
  ] as const;

  const typeCoverage = requiredTypes.every((type) =>
    lifecycles.some((lifecycle) => lifecycle.lifecycleType === type),
  );

  const statusCoverage = requiredStatuses.every((status) =>
    lifecycles.some((lifecycle) => lifecycle.lifecycleStatus === status),
  );

  const scoreValid = lifecycles.every(
    (lifecycle) =>
      lifecycle.score.feasibility > 0 &&
      lifecycle.score.readiness > 0 &&
      lifecycle.score.impact > 0 &&
      lifecycle.score.urgency > 0 &&
      lifecycle.score.confidence > 0 &&
      lifecycle.score.pipelineStrength > 0 &&
      lifecycle.score.totalLifecycleScore > 0 &&
      lifecycle.insightIds.length > 0 &&
      lifecycle.mode === "industry-lifecycle",
  );

  const canonical = getLifecyclesBySubject(CANONICAL_LIFECYCLE_SUBJECT_ID);

  const valid =
    lifecycles.length >= 8 &&
    typeCoverage &&
    statusCoverage &&
    scoreValid &&
    canonical.length >= 1;

  return {
    valid,
    count: lifecycles.length,
    summary: `lifecycle-registry count=${lifecycles.length} types=${requiredTypes.filter((t) => lifecycles.some((l) => l.lifecycleType === t)).length}/4 statuses=${requiredStatuses.filter((s) => lifecycles.some((l) => l.lifecycleStatus === s)).length}/8 valid=${valid}`,
  };
}
