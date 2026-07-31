/**
 * PI-5.3 — Compose integration runtime plan from PI-5.2 routing + seam adapters.
 * Does not invoke FE/BE/Data modules.
 */
import type { IntegrationBindingKind } from "../foundation/binding-kinds";
import { INTEGRATION_FOUNDATION_ID } from "../foundation/integration.constants";
import { INTEGRATION_ROUTING_LAYER_ID } from "../routing/routing.constants";
import {
  resolveIntegrationRoutePlan,
  type IntegrationRoutePlan,
} from "../routing/integration-route-plan";
import type { IntegrationDomainId } from "../routing/domain-stage-routing";
import type { IntegrationWorkflowId } from "../routing/workflow-kinds";
import { INTEGRATION_RUNTIME_ID } from "./runtime.constants";
import {
  seamAdapterForPoint,
  seamAdapterMatchesFoundationPoint,
  type IntegrationRuntimeAdapter,
} from "./seam-runtime-bindings";
import {
  getWorkflowRuntimeBinding,
  type WorkflowRuntimeBinding,
  type WorkflowRuntimeMode,
} from "./workflow-runtime-bindings";

export type IntegrationRuntimePlan = Readonly<{
  runtimeId: typeof INTEGRATION_RUNTIME_ID;
  routingLayerId: typeof INTEGRATION_ROUTING_LAYER_ID;
  foundationId: typeof INTEGRATION_FOUNDATION_ID;
  bindingKind: IntegrationBindingKind;
  primaryDomain: IntegrationDomainId | null;
  route: IntegrationRoutePlan;
  adapters: readonly IntegrationRuntimeAdapter[];
  primaryAdapter: IntegrationRuntimeAdapter;
  workflows: readonly IntegrationWorkflowId[];
  workflowBindings: readonly WorkflowRuntimeBinding[];
  modes: readonly WorkflowRuntimeMode[];
  matchesRouting: boolean;
  reusesExistingPoints: boolean;
}>;

/**
 * Bind a route plan to existing seam runtime adapters + workflow runtimes.
 */
export function resolveIntegrationRuntimePlan(
  bindingKind: IntegrationBindingKind,
  primaryDomain: IntegrationDomainId | null = null,
): IntegrationRuntimePlan {
  const route = resolveIntegrationRoutePlan(bindingKind, primaryDomain);

  const adapters = route.pointIds.map((pointId) => {
    const adapter = seamAdapterForPoint(pointId);
    if (!adapter) {
      throw new Error(`No seam runtime adapter for point ${pointId}`);
    }
    return adapter;
  });

  const primaryAdapter = adapters[0];
  if (!primaryAdapter) {
    throw new Error(`No primary adapter for ${bindingKind}`);
  }

  const workflowBindings = route.workflows.map((workflowId) => {
    const binding = getWorkflowRuntimeBinding(workflowId);
    if (!binding) {
      throw new Error(`Unknown workflow runtime binding: ${workflowId}`);
    }
    return binding;
  });

  const reusesExistingPoints = adapters.every((adapter) =>
    seamAdapterMatchesFoundationPoint(adapter),
  );

  // Workflow required points must be covered by the routed seams.
  const matchesRouting =
    route.layerId === INTEGRATION_ROUTING_LAYER_ID &&
    route.matchesFoundation &&
    reusesExistingPoints &&
    workflowBindings.every((wb) =>
      wb.requiredPointIds.every((req) => route.pointIds.includes(req)),
    );

  return {
    runtimeId: INTEGRATION_RUNTIME_ID,
    routingLayerId: INTEGRATION_ROUTING_LAYER_ID,
    foundationId: INTEGRATION_FOUNDATION_ID,
    bindingKind,
    primaryDomain,
    route,
    adapters,
    primaryAdapter,
    workflows: route.workflows,
    workflowBindings,
    modes: workflowBindings.map((w) => w.mode),
    matchesRouting,
    reusesExistingPoints,
  };
}
