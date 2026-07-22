/**
 * Evolution P5 — Global Deployment Network types
 */

import type {
  DEPLOYMENT_INTELLIGENCE_MODES,
  DEPLOYMENT_OPTIMIZATION_ACTIONS,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_FREEZE_VERSION,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION,
  GLOBAL_MANAGER_STATUSES,
  GLOBAL_READINESS_VERDICTS,
  GLOBAL_REGIONS,
  REGION_ROLES,
  REGIONAL_HEALTH_LEVELS,
  ROUTING_STRATEGIES,
} from "./global.constants";

export type GlobalRegion = (typeof GLOBAL_REGIONS)[number];
export type RegionRole = (typeof REGION_ROLES)[number];
export type DeploymentIntelligenceMode =
  (typeof DEPLOYMENT_INTELLIGENCE_MODES)[number];
export type RegionalHealthLevel = (typeof REGIONAL_HEALTH_LEVELS)[number];
export type RoutingStrategy = (typeof ROUTING_STRATEGIES)[number];
export type DeploymentOptimizationAction =
  (typeof DEPLOYMENT_OPTIMIZATION_ACTIONS)[number];
export type GlobalReadinessVerdict =
  (typeof GLOBAL_READINESS_VERDICTS)[number];
export type GlobalManagerStatus = (typeof GLOBAL_MANAGER_STATUSES)[number];

export type GlobalMetadata = Record<string, unknown>;

/** Multi-region model. */
export type MultiRegionProfile = {
  id: string;
  name: string;
  productId: string;
  deploymentPackageId: string;
  region: GlobalRegion;
  role: RegionRole;
  cloudRuntimeId?: string;
  environmentProfileId?: string;
  weight: number;
  detail: string;
  metadata: GlobalMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateMultiRegionProfileInput = {
  id?: string;
  name: string;
  productId: string;
  deploymentPackageId: string;
  region: GlobalRegion;
  role?: RegionRole;
  cloudRuntimeId?: string;
  environmentProfileId?: string;
  weight?: number;
  metadata?: GlobalMetadata;
};

/** Deployment intelligence. */
export type DeploymentIntelligence = {
  id: string;
  name: string;
  productId: string;
  deploymentPackageId: string;
  orchestrationId: string;
  intelligenceDashboardId?: string;
  mode: DeploymentIntelligenceMode;
  regionProfileIds: string[];
  intelligenceScore: number;
  detail: string;
  metadata: GlobalMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateDeploymentIntelligenceInput = {
  id?: string;
  name: string;
  productId: string;
  deploymentPackageId: string;
  orchestrationId: string;
  intelligenceDashboardId?: string;
  regionProfileIds: string[];
  mode?: DeploymentIntelligenceMode;
  metadata?: GlobalMetadata;
};

/** Regional health. */
export type RegionalHealthReport = {
  id: string;
  deploymentIntelligenceId: string;
  regionProfileId: string;
  region: GlobalRegion;
  level: RegionalHealthLevel;
  score: number;
  runtimeHealthy: boolean;
  opsScore: number;
  detail: string;
  assessedAt: string;
};

export type AssessRegionalHealthInput = {
  id?: string;
  deploymentIntelligenceId: string;
  regionProfileId: string;
};

/** Global routing insights. */
export type GlobalRoutingInsight = {
  id: string;
  deploymentIntelligenceId: string;
  strategy: RoutingStrategy;
  preferredRegion: GlobalRegion;
  alternateRegions: GlobalRegion[];
  latencyBias: number;
  capacityBias: number;
  detail: string;
  computedAt: string;
};

export type ComputeRoutingInsightInput = {
  id?: string;
  deploymentIntelligenceId: string;
  strategy?: RoutingStrategy;
};

/** Deployment optimization. */
export type DeploymentOptimization = {
  id: string;
  deploymentIntelligenceId: string;
  action: DeploymentOptimizationAction;
  targetRegion?: GlobalRegion;
  expectedGain: number;
  rationale: string;
  detail: string;
  recommendedAt: string;
};

export type OptimizeDeploymentInput = {
  id?: string;
  deploymentIntelligenceId: string;
};

/** Readiness. */
export type GlobalReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type GlobalReadinessResult = {
  deploymentIntelligenceId: string;
  verdict: GlobalReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: GlobalReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type GlobalRegistryManifest = {
  globalNetworkId: typeof EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID;
  version: typeof EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION;
  freezeVersion: typeof EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_FREEZE_VERSION;
  base: typeof EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE;
  regionProfileCount: number;
  deploymentIntelligenceCount: number;
  regionalHealthCount: number;
  routingInsightCount: number;
  optimizationCount: number;
};
