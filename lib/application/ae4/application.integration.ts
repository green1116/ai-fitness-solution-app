/**
 * AE-4 — Application integration plan over AE-3 workflow.
 * Integration catalogue only — does not invoke FE/BE/Data/Integration modules.
 */
import { AE3_WORKFLOW_ID } from "../ae3/workflow.definition";
import { resolveApplicationWorkflowPlan } from "../ae3/application.workflow";
import {
  AE4_INTEGRATION_BINDINGS,
  getAe4IntegrationBinding,
  type Ae4BindingId,
  type Ae4IntegrationBinding,
} from "./integration.binding";
import {
  APPLICATION_INTEGRATION_DEFINITION,
  AE4_BASE_FREEZE_REF,
  AE4_INTEGRATION_ID,
  AE4_WORKFLOW_REF,
} from "./integration.definition";
import {
  AE4_INTEGRATION_ENDPOINTS,
  type Ae4IntegrationEndpoint,
} from "./integration.endpoint";
import {
  APPLICATION_INTEGRATION_POLICY,
  type ApplicationIntegrationPolicy,
} from "./integration.policy";
import {
  AE4_INTEGRATION_REGISTRY,
  type Ae4IntegrationRegistryEntry,
} from "./integration.registry";

export type ApplicationIntegrationPlan = Readonly<{
  integrationId: typeof AE4_INTEGRATION_ID;
  baseFreezeRef: typeof AE4_BASE_FREEZE_REF;
  definition: typeof APPLICATION_INTEGRATION_DEFINITION;
  registry: typeof AE4_INTEGRATION_REGISTRY;
  bindings: typeof AE4_INTEGRATION_BINDINGS;
  endpoints: typeof AE4_INTEGRATION_ENDPOINTS;
  primaryBinding: Ae4IntegrationBinding;
  primaryEndpoints: readonly Ae4IntegrationEndpoint[];
  policy: ApplicationIntegrationPolicy;
  matchesWorkflow: boolean;
  integrationOnly: boolean;
}>;

/**
 * Resolve declarative AE-4 integration plan bound to AE-3 workflow.
 */
export function resolveApplicationIntegrationPlan(
  bindingId: Ae4BindingId = "B-FE-BE",
): ApplicationIntegrationPlan {
  const workflow = resolveApplicationWorkflowPlan();

  const primaryBinding =
    getAe4IntegrationBinding(bindingId) ??
    getAe4IntegrationBinding("B-FE-BE")!;

  const primaryEndpoints = AE4_INTEGRATION_ENDPOINTS.filter(
    (e) => e.bindingId === primaryBinding.bindingId,
  );

  const matchesWorkflow =
    AE4_WORKFLOW_REF === AE3_WORKFLOW_ID &&
    workflow.workflowId === AE3_WORKFLOW_ID &&
    workflow.matchesRuntime &&
    workflow.workflowOnly &&
    APPLICATION_INTEGRATION_DEFINITION.workflowRef === AE3_WORKFLOW_ID;

  const integrationOnly =
    APPLICATION_INTEGRATION_POLICY.hasBusinessLogic === false &&
    APPLICATION_INTEGRATION_POLICY.hasDeployment === false &&
    APPLICATION_INTEGRATION_POLICY.hasMonitoring === false &&
    APPLICATION_INTEGRATION_DEFINITION.nonGoals.includes("business-logic") &&
    APPLICATION_INTEGRATION_DEFINITION.nonGoals.includes("deployment") &&
    APPLICATION_INTEGRATION_DEFINITION.nonGoals.includes("monitoring");

  return {
    integrationId: AE4_INTEGRATION_ID,
    baseFreezeRef: AE4_BASE_FREEZE_REF,
    definition: APPLICATION_INTEGRATION_DEFINITION,
    registry: AE4_INTEGRATION_REGISTRY,
    bindings: AE4_INTEGRATION_BINDINGS,
    endpoints: AE4_INTEGRATION_ENDPOINTS,
    primaryBinding,
    primaryEndpoints,
    policy: APPLICATION_INTEGRATION_POLICY,
    matchesWorkflow,
    integrationOnly,
  };
}

export type { Ae4IntegrationRegistryEntry };
