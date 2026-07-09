/**
 * V68 P5 — Capacity planning types (read-only)
 */

export const V68_CAPACITY_PLANNING_VERSION = "v68-capacity-planning-1" as const;

export type ResourceKind = "cpu" | "memory" | "requests" | "connections" | "storage";

export type ThresholdKind = "warning" | "critical" | "saturated";

export type StressRiskLevel = "low" | "medium" | "high" | "critical";

export type CapacityUnit = "percent" | "count" | "rps" | "ms" | "gb";

export type CapacityPlanningSignals = {
  featureFlagGovernanceReady?: boolean;
  baselineCatalogComplete?: boolean;
  thresholdCatalogComplete?: boolean;
  resourceLimitComplete?: boolean;
  stressRiskComplete?: boolean;
  refsAligned?: boolean;
};

export type CapacityBaselineEntry = {
  id: string;
  serviceDefRef: string;
  resourceKind: ResourceKind;
  baselineValue: number;
  unit: CapacityUnit;
  window: string;
  required: boolean;
  description: string;
};

export type CapacityBaselineManifest = {
  version: typeof V68_CAPACITY_PLANNING_VERSION;
  entryCount: number;
  resourceKindCount: number;
  catalogComplete: boolean;
  baselines: CapacityBaselineEntry[];
  summary: string;
};

export type ThresholdDefinition = {
  id: string;
  baselineRef: string;
  thresholdKind: ThresholdKind;
  thresholdValue: number;
  unit: CapacityUnit;
  required: boolean;
  description: string;
};

export type ThresholdDefinitionManifest = {
  version: typeof V68_CAPACITY_PLANNING_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  thresholds: ThresholdDefinition[];
  summary: string;
};

export type ResourceLimitEntry = {
  id: string;
  serviceDefRef: string;
  resourceKind: ResourceKind;
  maxValue: number;
  unit: CapacityUnit;
  hardLimit: boolean;
  required: boolean;
  description: string;
};

export type ResourceLimitManifest = {
  version: typeof V68_CAPACITY_PLANNING_VERSION;
  entryCount: number;
  resourceKindCount: number;
  catalogComplete: boolean;
  limits: ResourceLimitEntry[];
  summary: string;
};

export type StressRiskMarker = {
  id: string;
  serviceDefRef: string;
  thresholdRef: string;
  riskLevel: StressRiskLevel;
  triggerCondition: string;
  required: boolean;
  description: string;
};

export type StressRiskManifest = {
  version: typeof V68_CAPACITY_PLANNING_VERSION;
  entryCount: number;
  riskLevelCount: number;
  catalogComplete: boolean;
  markers: StressRiskMarker[];
  summary: string;
};

export type CapacityPlanningReport = {
  version: typeof V68_CAPACITY_PLANNING_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  featureFlagGovernanceVersion: string;
  featureFlagGovernanceReady: boolean;
  baselines: CapacityBaselineManifest;
  thresholds: ThresholdDefinitionManifest;
  resourceLimits: ResourceLimitManifest;
  stressRisks: StressRiskManifest;
  planningReady: boolean;
  readinessScore: number;
  summary: string;
};
