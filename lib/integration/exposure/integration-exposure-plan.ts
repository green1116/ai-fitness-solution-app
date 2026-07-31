/**
 * PI-5.4 — Compose integration exposure with PI-5.3 runtime.
 * Does not invoke FE/BE/Data modules.
 */
import type { IntegrationBindingKind } from "../foundation/binding-kinds";
import { INTEGRATION_FOUNDATION_ID } from "../foundation/integration.constants";
import type { IntegrationPointId } from "../foundation/integration-points";
import type { IntegrationDomainId } from "../routing/domain-stage-routing";
import { INTEGRATION_ROUTING_LAYER_ID } from "../routing/routing.constants";
import type { IntegrationWorkflowId } from "../routing/workflow-kinds";
import { INTEGRATION_RUNTIME_ID } from "../runtime/runtime.constants";
import {
  resolveIntegrationRuntimePlan,
  type IntegrationRuntimePlan,
} from "../runtime/integration-runtime-plan";
import type { IntegrationRuntimeAdapter } from "../runtime/seam-runtime-bindings";
import { INTEGRATION_EXPOSURE_LAYER_ID } from "./exposure.constants";
import {
  CONTRACT_EXPOSURE_BINDINGS,
  type ContractExposureBinding,
  type IntegrationContractId,
} from "./contract-exposure-bindings";
import {
  getBindingKindExposure,
  type BindingKindExposure,
  type IntegrationExposureMode,
} from "./binding-kind-exposure";

export type IntegrationExposurePlan = Readonly<{
  layerId: typeof INTEGRATION_EXPOSURE_LAYER_ID;
  runtimeId: typeof INTEGRATION_RUNTIME_ID;
  routingLayerId: typeof INTEGRATION_ROUTING_LAYER_ID;
  foundationId: typeof INTEGRATION_FOUNDATION_ID;
  bindingKind: IntegrationBindingKind;
  primaryDomain: IntegrationDomainId | null;
  exposure: BindingKindExposure;
  modes: readonly IntegrationExposureMode[];
  contracts: readonly ContractExposureBinding[];
  runtime: IntegrationRuntimePlan;
  adapters: readonly IntegrationRuntimeAdapter[];
  workflows: readonly IntegrationWorkflowId[];
  matchesRuntime: boolean;
  reusesExistingWorkflows: boolean;
}>;

/**
 * Bind a binding kind (+ Domain) to exposure modes + runtime plan.
 */
export function resolveIntegrationExposurePlan(
  bindingKind: IntegrationBindingKind,
  primaryDomain: IntegrationDomainId | null = null,
): IntegrationExposurePlan {
  const exposure = getBindingKindExposure(bindingKind);
  if (!exposure) {
    throw new Error(`Unknown binding kind exposure: ${bindingKind}`);
  }

  const runtime = resolveIntegrationRuntimePlan(bindingKind, primaryDomain);

  const contracts = exposure.contractIds.map((id) => {
    const row = CONTRACT_EXPOSURE_BINDINGS.find((c) => c.contractId === id);
    if (!row) throw new Error(`Unknown contract exposure: ${id}`);
    return row;
  });

  const reusesExistingWorkflows = exposure.workflowBias.every((wf) =>
    runtime.workflows.includes(wf),
  );

  const contractPointsCovered = contracts.every((contract) =>
    contract.pointIds.every((pointId) => {
      if ((runtime.route.pointIds as readonly IntegrationPointId[]).includes(pointId)) {
        return true;
      }
      // CROSS contracts may cite API for error/compat; only required when on HTTP routes.
      return (
        contract.stageId === "CROSS" &&
        runtime.route.touchesDomain &&
        (pointId === "INTP-API-SURFACE" || pointId === "INTP-FE-ADAPTER")
      );
    }),
  );

  // For HTTP kinds, primary exposure seam must be among adapters.
  const primaryExposed = runtime.adapters.some(
    (a) => a.pointId === exposure.primaryPointId,
  );

  const matchesRuntime =
    runtime.runtimeId === INTEGRATION_RUNTIME_ID &&
    runtime.matchesRouting &&
    runtime.reusesExistingPoints &&
    reusesExistingWorkflows &&
    primaryExposed &&
    contractPointsCovered;

  return {
    layerId: INTEGRATION_EXPOSURE_LAYER_ID,
    runtimeId: INTEGRATION_RUNTIME_ID,
    routingLayerId: INTEGRATION_ROUTING_LAYER_ID,
    foundationId: INTEGRATION_FOUNDATION_ID,
    bindingKind,
    primaryDomain,
    exposure,
    modes: exposure.modes,
    contracts,
    runtime,
    adapters: runtime.adapters,
    workflows: runtime.workflows,
    matchesRuntime,
    reusesExistingWorkflows,
  };
}

export function listExposedContractIds(
  plan: IntegrationExposurePlan,
): IntegrationContractId[] {
  return plan.contracts.map((c) => c.contractId);
}
