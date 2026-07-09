/**
 * V67 P4 — SLO/SLI governance types (read-only)
 */

export const V67_SLO_GOVERNANCE_VERSION = "v67-slo-governance-1" as const;

export type SliKind =
  | "availability"
  | "latency"
  | "correctness"
  | "throughput"
  | "freshness"
  | "operational";

export type SloTier = "critical" | "standard" | "best-effort";

export type MeasurementWindow = "5m" | "1h" | "24h" | "7d" | "30d";

export type BudgetWindowKind = "rolling" | "calendar" | "fixed";

export type SloGovernanceSignals = {
  taxonomyReady?: boolean;
  sliCatalogComplete?: boolean;
  sloCatalogComplete?: boolean;
  objectiveCatalogComplete?: boolean;
  budgetContractComplete?: boolean;
  foundationSloAligned?: boolean;
};

export type SliTypeDefinition = {
  id: string;
  foundationRef: string;
  kind: SliKind;
  name: string;
  unit: string;
  window: MeasurementWindow;
  goodEvent: string;
  validEvent: string;
  required: boolean;
  description: string;
};

export type SliTypeManifest = {
  version: typeof V67_SLO_GOVERNANCE_VERSION;
  typeCount: number;
  kindCount: number;
  catalogComplete: boolean;
  types: SliTypeDefinition[];
  summary: string;
};

export type SloTypeDefinition = {
  id: string;
  foundationRef: string;
  sliRef: string;
  name: string;
  tier: SloTier;
  objective: number;
  window: MeasurementWindow;
  alertRuleRef?: string;
  required: boolean;
  description: string;
};

export type SloTypeManifest = {
  version: typeof V67_SLO_GOVERNANCE_VERSION;
  typeCount: number;
  tierCount: number;
  catalogComplete: boolean;
  types: SloTypeDefinition[];
  summary: string;
};

export type ObjectiveCatalogEntry = {
  id: string;
  sloRef: string;
  sliRef: string;
  tier: SloTier;
  target: number;
  unit: string;
  owner: string;
  required: boolean;
  description: string;
};

export type ObjectiveCatalogManifest = {
  version: typeof V67_SLO_GOVERNANCE_VERSION;
  entryCount: number;
  tierCount: number;
  catalogComplete: boolean;
  objectives: ObjectiveCatalogEntry[];
  summary: string;
};

export type ErrorBudgetRule = {
  id: string;
  sloRef: string;
  budgetPercent: number;
  window: MeasurementWindow;
  windowKind: BudgetWindowKind;
  burnRateThreshold: number;
  required: boolean;
  description: string;
};

export type BudgetContractManifest = {
  version: typeof V67_SLO_GOVERNANCE_VERSION;
  ruleCount: number;
  windowKindCount: number;
  contractComplete: boolean;
  rules: ErrorBudgetRule[];
  summary: string;
};

export type SloGovernanceReport = {
  version: typeof V67_SLO_GOVERNANCE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  taxonomyVersion: string;
  taxonomyReady: boolean;
  sliTypes: SliTypeManifest;
  sloTypes: SloTypeManifest;
  objectiveCatalog: ObjectiveCatalogManifest;
  budgetContract: BudgetContractManifest;
  governanceReady: boolean;
  readinessScore: number;
  summary: string;
};
