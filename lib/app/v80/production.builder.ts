/**
 * V80 APP P4 — Production architecture builder (read-only P3 consumer)
 */
import { buildImplementationBlueprint } from "./blueprint.builder";
import { V80_APP_BLUEPRINT_VERSION } from "./blueprint.types";
import { isBillingFeatureGatingComplete, BILLING_FEATURE_GATING_MATRIX } from "./production.billing.spec";
import { isDeploymentArchitectureComplete, DEPLOYMENT_ARCHITECTURE } from "./production.deployment.spec";
import { isObservabilityGovernanceComplete, OBSERVABILITY_GOVERNANCE } from "./production.observability.spec";
import { isMultiTenantRuntimeComplete, MULTI_TENANT_RUNTIME } from "./production.tenant.spec";
import type {
  ProductionArchitectureManifest,
  ProductionArchitectureReport,
} from "./production.types";
import {
  V80_APP_PRODUCTION_FREEZE_VERSION,
  V80_APP_PRODUCTION_VERSION,
} from "./production.types";

export function buildProductionArchitectureManifest(input: {
  blueprintReady: boolean;
}): ProductionArchitectureManifest {
  const deploymentComplete = isDeploymentArchitectureComplete();
  const tenantComplete = isMultiTenantRuntimeComplete();
  const billingComplete = isBillingFeatureGatingComplete();
  const observabilityComplete = isObservabilityGovernanceComplete();

  const architectureComplete =
    input.blueprintReady &&
    deploymentComplete &&
    tenantComplete &&
    billingComplete &&
    observabilityComplete;

  return {
    version: V80_APP_PRODUCTION_VERSION,
    blueprintVersion: V80_APP_BLUEPRINT_VERSION,
    deploymentCount: DEPLOYMENT_ARCHITECTURE.length,
    tenantLayerCount: MULTI_TENANT_RUNTIME.length,
    billingGateCount: BILLING_FEATURE_GATING_MATRIX.length,
    observabilityCount: OBSERVABILITY_GOVERNANCE.length,
    architectureComplete,
    summary: `production-architecture complete=${architectureComplete} deployment=${DEPLOYMENT_ARCHITECTURE.length} billing=${BILLING_FEATURE_GATING_MATRIX.length}`,
  };
}

export function buildProductionArchitecture(input?: {
  deploymentId?: string;
}): ProductionArchitectureReport {
  const deploymentId = input?.deploymentId ?? "v80-app-production-default";
  const blueprint = buildImplementationBlueprint({ deploymentId });
  const manifest = buildProductionArchitectureManifest({
    blueprintReady: blueprint.blueprintReady,
  });

  const architectureReady = blueprint.blueprintReady && manifest.architectureComplete;

  return {
    version: V80_APP_PRODUCTION_VERSION,
    freezeVersion: V80_APP_PRODUCTION_FREEZE_VERSION,
    reportId: `production-architecture-${deploymentId}`,
    blueprintReady: blueprint.blueprintReady,
    manifest,
    deployment: DEPLOYMENT_ARCHITECTURE,
    tenantRuntime: MULTI_TENANT_RUNTIME,
    billingGates: BILLING_FEATURE_GATING_MATRIX,
    observability: OBSERVABILITY_GOVERNANCE,
    architectureReady,
    readinessScore: architectureReady ? 100 : 0,
    summary: [
      `production-architecture ready=${architectureReady}`,
      `blueprint=${blueprint.blueprintReady}`,
      `deployment=${manifest.deploymentCount}`,
    ].join(" "),
  };
}

export function assertProductionArchitecturePass(
  report: ProductionArchitectureReport,
): asserts report is ProductionArchitectureReport & { architectureReady: true } {
  if (!report.architectureReady) {
    throw new Error(`V80 APP production architecture not ready: ${report.summary}`);
  }
}
