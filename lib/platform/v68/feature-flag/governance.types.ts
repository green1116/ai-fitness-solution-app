/**
 * V68 P4 — Feature flag governance types (read-only)
 */

export const V68_FEATURE_FLAG_GOVERNANCE_VERSION = "v68-feature-flag-governance-1" as const;

export type FlagStateKind = "enabled" | "disabled" | "rollout" | "kill-switch";

export type FlagScopeKind = "global" | "service" | "environment" | "tenant";

export type ToggleActionKind = "enable" | "disable" | "rollout-percent" | "kill";

export type FeatureFlagGovernanceSignals = {
  configurationGovernanceReady?: boolean;
  definitionCatalogComplete?: boolean;
  stateCatalogComplete?: boolean;
  scopeCatalogComplete?: boolean;
  toggleContractComplete?: boolean;
  refsAligned?: boolean;
};

export type FlagDefinition = {
  id: string;
  key: string;
  serviceDefRef?: string;
  configItemRef?: string;
  defaultState: FlagStateKind;
  required: boolean;
  description: string;
};

export type FlagDefinitionManifest = {
  version: typeof V68_FEATURE_FLAG_GOVERNANCE_VERSION;
  flagCount: number;
  stateKindCount: number;
  catalogComplete: boolean;
  flags: FlagDefinition[];
  summary: string;
};

export type FlagStateEntry = {
  id: string;
  flagRef: string;
  stateKind: FlagStateKind;
  declarativeValue: string;
  required: boolean;
  description: string;
};

export type FlagStateManifest = {
  version: typeof V68_FEATURE_FLAG_GOVERNANCE_VERSION;
  entryCount: number;
  stateKindCount: number;
  catalogComplete: boolean;
  states: FlagStateEntry[];
  summary: string;
};

export type FlagScopeEntry = {
  id: string;
  flagRef: string;
  scopeKind: FlagScopeKind;
  targetRef: string;
  required: boolean;
  description: string;
};

export type FlagScopeManifest = {
  version: typeof V68_FEATURE_FLAG_GOVERNANCE_VERSION;
  entryCount: number;
  scopeKindCount: number;
  catalogComplete: boolean;
  scopes: FlagScopeEntry[];
  summary: string;
};

export type ToggleRule = {
  id: string;
  flagRef: string;
  action: ToggleActionKind;
  condition: string;
  required: boolean;
  description: string;
};

export type ToggleContractManifest = {
  version: typeof V68_FEATURE_FLAG_GOVERNANCE_VERSION;
  ruleCount: number;
  actionKindCount: number;
  contractComplete: boolean;
  rules: ToggleRule[];
  summary: string;
};

export type FeatureFlagGovernanceReport = {
  version: typeof V68_FEATURE_FLAG_GOVERNANCE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  configurationGovernanceVersion: string;
  configurationGovernanceReady: boolean;
  flagDefinitions: FlagDefinitionManifest;
  flagStates: FlagStateManifest;
  flagScopes: FlagScopeManifest;
  toggleContract: ToggleContractManifest;
  governanceReady: boolean;
  readinessScore: number;
  summary: string;
};
