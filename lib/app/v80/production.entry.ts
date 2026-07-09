/**
 * V80 APP P4 — Production architecture entry (read-only)
 */
export {
  BILLING_FEATURE_GATING_MATRIX,
  getBillingGatesByPlan,
  isBillingFeatureGatingComplete,
} from "./production.billing.spec";
export { assertProductionArchitecturePass, buildProductionArchitecture } from "./production.builder";
export {
  DEPLOYMENT_ARCHITECTURE,
  getDeploymentByTier,
  isDeploymentArchitectureComplete,
} from "./production.deployment.spec";
export {
  OBSERVABILITY_GOVERNANCE,
  getObservabilityByKind,
  isObservabilityGovernanceComplete,
} from "./production.observability.spec";
export {
  MULTI_TENANT_RUNTIME,
  isMultiTenantRuntimeComplete,
} from "./production.tenant.spec";
export {
  V80_APP_PRODUCTION_FREEZE_VERSION,
  V80_APP_PRODUCTION_VERSION,
} from "./production.types";
export type {
  BillingGateEntry,
  DeploymentComponentSpec,
  ObservabilitySpec,
  ProductionArchitectureReport,
  TenantIsolationSpec,
} from "./production.types";

import { buildProductionArchitecture } from "./production.builder";
import type { ProductionArchitectureReport } from "./production.types";

export function runProductionArchitecture(input?: {
  deploymentId?: string;
}): ProductionArchitectureReport {
  return buildProductionArchitecture(input);
}

export function formatProductionArchitectureSummary(
  report: ProductionArchitectureReport,
): string {
  return [
    "V80 APP Production Architecture",
    `  ready: ${report.architectureReady}`,
    `  score: ${report.readinessScore}/100`,
    `  blueprint: ${report.blueprintReady}`,
    `  deployment: ${report.manifest.deploymentCount}`,
    `  tenantLayers: ${report.manifest.tenantLayerCount}`,
    `  billingGates: ${report.manifest.billingGateCount}`,
    `  observability: ${report.manifest.observabilityCount}`,
  ].join("\n");
}
