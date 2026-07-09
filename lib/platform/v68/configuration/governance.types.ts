/**
 * V68 P3 — Configuration governance types (read-only)
 */

export const V68_CONFIGURATION_GOVERNANCE_VERSION = "v68-configuration-governance-1" as const;

export type ConfigValueKind = "string" | "number" | "boolean" | "enum" | "secret-ref";

export type ConfigSourceKind = "environment" | "file" | "declarative" | "frozen-reference";

export type ConfigValidityStatus = "valid" | "invalid" | "deprecated" | "unknown";

export type ConfigurationGovernanceSignals = {
  dependencyGraphReady?: boolean;
  itemCatalogComplete?: boolean;
  sourceCatalogComplete?: boolean;
  validityContractComplete?: boolean;
  alignmentComplete?: boolean;
};

export type ConfigItemDefinition = {
  id: string;
  key: string;
  serviceDefRef: string;
  valueKind: ConfigValueKind;
  defaultValue: string;
  required: boolean;
  description: string;
};

export type ConfigItemManifest = {
  version: typeof V68_CONFIGURATION_GOVERNANCE_VERSION;
  itemCount: number;
  kindCount: number;
  catalogComplete: boolean;
  items: ConfigItemDefinition[];
  summary: string;
};

export type ConfigSourceEntry = {
  id: string;
  sourceKind: ConfigSourceKind;
  path: string;
  serviceDefRef?: string;
  required: boolean;
  description: string;
};

export type ConfigSourceManifest = {
  version: typeof V68_CONFIGURATION_GOVERNANCE_VERSION;
  sourceCount: number;
  kindCount: number;
  catalogComplete: boolean;
  sources: ConfigSourceEntry[];
  summary: string;
};

export type ConfigValidityRule = {
  id: string;
  configItemRef: string;
  sourceRef: string;
  constraint: string;
  expectedStatus: ConfigValidityStatus;
  required: boolean;
  description: string;
};

export type ConfigValidityManifest = {
  version: typeof V68_CONFIGURATION_GOVERNANCE_VERSION;
  ruleCount: number;
  statusCount: number;
  contractComplete: boolean;
  rules: ConfigValidityRule[];
  summary: string;
};

export type ConfigAlignmentEntry = {
  id: string;
  configItemRef: string;
  sourceRef: string;
  validityRef: string;
  serviceDefRef: string;
  aligned: boolean;
  required: boolean;
  description: string;
};

export type ConfigAlignmentManifest = {
  version: typeof V68_CONFIGURATION_GOVERNANCE_VERSION;
  entryCount: number;
  alignedCount: number;
  manifestComplete: boolean;
  entries: ConfigAlignmentEntry[];
  summary: string;
};

export type ConfigurationGovernanceReport = {
  version: typeof V68_CONFIGURATION_GOVERNANCE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  dependencyGraphVersion: string;
  dependencyGraphReady: boolean;
  configItems: ConfigItemManifest;
  configSources: ConfigSourceManifest;
  configValidity: ConfigValidityManifest;
  configAlignment: ConfigAlignmentManifest;
  governanceReady: boolean;
  readinessScore: number;
  summary: string;
};
