/**
 * PI-5.2 — Resolve integration route plans from binding kind + Domain.
 * Reuses PI-5.1 points/stages — does not invoke FE/BE/Data modules.
 */
import {
  bindingKindTouchesDomain,
  type IntegrationBindingKind,
} from "../foundation/binding-kinds";
import {
  getIntegrationPoint,
  type IntegrationPointId,
  type IntegrationPointRecord,
} from "../foundation/integration-points";
import type { IntegrationPipelineStage } from "../foundation/pipeline-stages";
import { INTEGRATION_FOUNDATION_ID } from "../foundation/integration.constants";
import { INTEGRATION_ROUTING_LAYER_ID } from "./routing.constants";
import {
  domainIntegrationPoint,
  type IntegrationDomainId,
} from "./domain-stage-routing";
import {
  defaultPointsForStages,
  isFullPipeline,
  stagesForBindingKind,
} from "./stage-routing";
import type { IntegrationWorkflowId } from "./workflow-kinds";

/** Binding kind → primary workflow bias (PD-6.3). */
export const BINDING_KIND_WORKFLOW_BIAS: Record<
  IntegrationBindingKind,
  readonly IntegrationWorkflowId[]
> = {
  API: ["WF-READ", "WF-COMMAND"],
  "API+NAV": ["WF-COMMAND", "WF-READ", "WF-NAV"],
  NEAREST: ["WF-READ", "WF-COMMAND", "WF-ASYNC"],
  NAV: ["WF-NAV"],
  PREF: ["WF-NAV"],
};

export type IntegrationRoutePlan = Readonly<{
  layerId: typeof INTEGRATION_ROUTING_LAYER_ID;
  foundationId: typeof INTEGRATION_FOUNDATION_ID;
  bindingKind: IntegrationBindingKind;
  primaryDomain: IntegrationDomainId | null;
  stages: readonly IntegrationPipelineStage[];
  pointIds: readonly IntegrationPointId[];
  points: readonly IntegrationPointRecord[];
  workflows: readonly IntegrationWorkflowId[];
  touchesDomain: boolean;
  matchesFoundation: boolean;
}>;

/**
 * Plan the integration route for a binding kind (+ optional primary Domain).
 */
export function resolveIntegrationRoutePlan(
  bindingKind: IntegrationBindingKind,
  primaryDomain: IntegrationDomainId | null = null,
): IntegrationRoutePlan {
  const stages = stagesForBindingKind(bindingKind);
  const touchesDomain = bindingKindTouchesDomain(bindingKind);
  const pointIds = [...defaultPointsForStages(stages)];

  if (touchesDomain && primaryDomain) {
    const domainPoint = domainIntegrationPoint(primaryDomain);
    if (!pointIds.includes(domainPoint)) {
      // Insert after DOMAIN ports (ports stay first among DOMAIN stage points)
      const portsIdx = pointIds.indexOf("INTP-DOMAIN-PORTS");
      if (portsIdx >= 0) {
        pointIds.splice(portsIdx + 1, 0, domainPoint);
      } else {
        pointIds.push(domainPoint);
      }
    }
  }

  if (!touchesDomain && primaryDomain) {
    throw new Error(
      `Client binding ${bindingKind} must not declare primary Domain ${primaryDomain}`,
    );
  }

  const points = pointIds.map((id) => {
    const point = getIntegrationPoint(id);
    if (!point) throw new Error(`Unknown integration point: ${id}`);
    return point;
  });

  const matchesFoundation =
    points.every((p) => stages.includes(p.stageId)) &&
    (touchesDomain ? isFullPipeline(stages) : stages.length === 1) &&
    (!touchesDomain || pointIds.includes("INTP-DOMAIN-PORTS"));

  return {
    layerId: INTEGRATION_ROUTING_LAYER_ID,
    foundationId: INTEGRATION_FOUNDATION_ID,
    bindingKind,
    primaryDomain,
    stages,
    pointIds,
    points,
    workflows: BINDING_KIND_WORKFLOW_BIAS[bindingKind],
    touchesDomain,
    matchesFoundation,
  };
}
