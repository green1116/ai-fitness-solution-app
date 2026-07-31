/**
 * PI-5.2 — Binding kind → pipeline stage route (PD-6.1 §2.2).
 * Reuses PI-5.1 stages and INTP-* points only.
 */
import type { IntegrationBindingKind } from "../foundation/binding-kinds";
import type { IntegrationPointId } from "../foundation/integration-points";
import type { IntegrationPipelineStage } from "../foundation/pipeline-stages";
import { INTEGRATION_PIPELINE_STAGES } from "../foundation/pipeline-stages";

/** HTTP Domain-touching kinds traverse the full pipeline. */
export const HTTP_PIPELINE_STAGES: readonly IntegrationPipelineStage[] = [
  "UI",
  "API",
  "SERVICE",
  "DOMAIN",
  "PERSISTENCE",
];

/** Client-only kinds stay on UI. */
export const CLIENT_PIPELINE_STAGES: readonly IntegrationPipelineStage[] = [
  "UI",
];

/** Default seam points visited per stage on HTTP routes. */
export const STAGE_DEFAULT_POINTS: Record<
  IntegrationPipelineStage,
  readonly IntegrationPointId[]
> = {
  UI: ["INTP-FE-ADAPTER"],
  API: ["INTP-API-SURFACE"],
  SERVICE: ["INTP-SERVICE-LAYER"],
  DOMAIN: ["INTP-DOMAIN-PORTS"],
  PERSISTENCE: ["INTP-DATA-REPOSITORY", "INTP-DATA-RUNTIME"],
};

export function stagesForBindingKind(
  kind: IntegrationBindingKind,
): readonly IntegrationPipelineStage[] {
  if (kind === "NAV" || kind === "PREF") return CLIENT_PIPELINE_STAGES;
  return HTTP_PIPELINE_STAGES;
}

export function defaultPointsForStages(
  stages: readonly IntegrationPipelineStage[],
): IntegrationPointId[] {
  const out: IntegrationPointId[] = [];
  for (const stage of stages) {
    for (const pointId of STAGE_DEFAULT_POINTS[stage]) {
      out.push(pointId);
    }
  }
  return out;
}

export function isFullPipeline(
  stages: readonly IntegrationPipelineStage[],
): boolean {
  return (
    stages.length === INTEGRATION_PIPELINE_STAGES.length &&
    INTEGRATION_PIPELINE_STAGES.every((s, i) => stages[i] === s)
  );
}
