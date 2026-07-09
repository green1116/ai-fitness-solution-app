/**
 * V80 APP P4 — Production architecture types (spec only)
 */

export const V80_APP_PRODUCTION_VERSION = "v80-app-production-architecture-1" as const;
export const V80_APP_PRODUCTION_FREEZE_VERSION =
  "v80-app-production-architecture-freeze-1" as const;

export type DeploymentTier = "edge" | "compute" | "worker" | "data";

export type DeploymentComponentSpec = {
  id: string;
  tier: DeploymentTier;
  component: string;
  runtime: string;
  scaling: string;
  blueprintRef?: string;
  required: boolean;
  description: string;
};

export type TenantIsolationSpec = {
  id: string;
  layer: "auth" | "data" | "compute" | "storage";
  mechanism: string;
  enforcement: string;
  prismaScope: string;
  required: boolean;
};

export type BillingGateEntry = {
  id: string;
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  featureKey: string;
  gateKey: string;
  apiRoutes: string[];
  pdfArtifacts: string[];
  usageType: string | null;
  limit: string;
};

export type ObservabilitySpec = {
  id: string;
  kind: "log" | "audit" | "metric" | "integrity" | "alert";
  source: string;
  sink: string;
  retention: string;
  governanceRef: string;
  required: boolean;
};

export type ProductionArchitectureManifest = {
  version: typeof V80_APP_PRODUCTION_VERSION;
  blueprintVersion: string;
  deploymentCount: number;
  tenantLayerCount: number;
  billingGateCount: number;
  observabilityCount: number;
  architectureComplete: boolean;
  summary: string;
};

export type ProductionArchitectureReport = {
  version: typeof V80_APP_PRODUCTION_VERSION;
  freezeVersion: typeof V80_APP_PRODUCTION_FREEZE_VERSION;
  reportId: string;
  blueprintReady: boolean;
  manifest: ProductionArchitectureManifest;
  deployment: DeploymentComponentSpec[];
  tenantRuntime: TenantIsolationSpec[];
  billingGates: BillingGateEntry[];
  observability: ObservabilitySpec[];
  architectureReady: boolean;
  readinessScore: number;
  summary: string;
};
