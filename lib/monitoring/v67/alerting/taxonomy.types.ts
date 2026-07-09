/**
 * V67 P3 — Alert taxonomy & governance types (read-only)
 */

export const V67_ALERT_TAXONOMY_VERSION = "v67-alert-taxonomy-1" as const;

export type AlertTypeCategory =
  | "availability"
  | "performance"
  | "security"
  | "deployment"
  | "slo"
  | "operational"
  | "informational";

export type AlertSeverityTier = "P0" | "P1" | "P2" | "P3" | "P4";

export type AlertTriggerKind = "threshold" | "absence" | "anomaly" | "manual" | "composite";

export type SuppressionKind = "dedup" | "aggregation" | "silence" | "maintenance-window";

export type AlertTaxonomySignals = {
  lifecycleReady?: boolean;
  typeCatalogComplete?: boolean;
  severityTiersComplete?: boolean;
  ruleCatalogComplete?: boolean;
  suppressionContractComplete?: boolean;
};

export type AlertTypeDefinition = {
  id: string;
  category: AlertTypeCategory;
  label: string;
  defaultSeverity: AlertSeverityTier;
  required: boolean;
  description: string;
};

export type AlertTypeManifest = {
  version: typeof V67_ALERT_TAXONOMY_VERSION;
  typeCount: number;
  categoryCount: number;
  catalogComplete: boolean;
  types: AlertTypeDefinition[];
  summary: string;
};

export type SeverityTierDefinition = {
  tier: AlertSeverityTier;
  label: string;
  foundationSeverity: string;
  responseMinutes: number;
  pageRequired: boolean;
  required: boolean;
  description: string;
};

export type SeverityTierManifest = {
  version: typeof V67_ALERT_TAXONOMY_VERSION;
  tierCount: number;
  manifestComplete: boolean;
  tiers: SeverityTierDefinition[];
  summary: string;
};

export type AlertRuleCatalogEntry = {
  id: string;
  name: string;
  typeRef: string;
  severityTier: AlertSeverityTier;
  triggerKind: AlertTriggerKind;
  condition: string;
  signal: string;
  aggregateKey: string;
  required: boolean;
  description: string;
};

export type AlertRuleCatalogManifest = {
  version: typeof V67_ALERT_TAXONOMY_VERSION;
  ruleCount: number;
  triggerKindCount: number;
  catalogComplete: boolean;
  rules: AlertRuleCatalogEntry[];
  summary: string;
};

export type SuppressionRuleDefinition = {
  id: string;
  kind: SuppressionKind;
  label: string;
  window: string;
  scope: string;
  required: boolean;
  description: string;
};

export type SuppressionContractManifest = {
  version: typeof V67_ALERT_TAXONOMY_VERSION;
  ruleCount: number;
  kindCount: number;
  contractComplete: boolean;
  rules: SuppressionRuleDefinition[];
  summary: string;
};

export type AlertTaxonomyReport = {
  version: typeof V67_ALERT_TAXONOMY_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  lifecycleVersion: string;
  lifecycleReady: boolean;
  alertTypes: AlertTypeManifest;
  severityTiers: SeverityTierManifest;
  ruleCatalog: AlertRuleCatalogManifest;
  suppressionContract: SuppressionContractManifest;
  taxonomyReady: boolean;
  readinessScore: number;
  summary: string;
};
