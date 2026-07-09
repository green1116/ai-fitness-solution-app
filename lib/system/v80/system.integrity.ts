/**
 * V80 P4 — System meta integrity types (declarative, read-only)
 */

export const V80_SYSTEM_INTEGRITY_VERSION = "v80-system-meta-integrity-1" as const;
export const V80_SYSTEM_INTEGRITY_FREEZE_VERSION =
  "v80-system-meta-integrity-freeze-1" as const;

export type SystemIntegrityKind =
  | "consistency"
  | "drift"
  | "reconciliation"
  | "freeze"
  | "policy"
  | "simulation";

export type SystemIntegrityStatus = "enforced" | "pending" | "waived" | "blocked";

export type SystemIntegrityRule = {
  id: string;
  kind: SystemIntegrityKind;
  layerRefs: string[];
  policyRef: string;
  invariantRef: string;
  simulationRef: string;
  consistencyRef: string;
  driftRef: string;
  reconciliationRef: string;
  freezeRef: string;
  roleRef: string;
  topologyRef: string;
  scopeRef: string;
  rule: string;
  passCondition: string;
  blockCondition: string;
  status: SystemIntegrityStatus;
  required: boolean;
  description: string;
};

export type SystemConsistencyCheck = {
  id: string;
  checkKind: string;
  layerRefs: string[];
  policyRef: string;
  invariantRef: string;
  passCondition: string;
  integrityRef: string;
  required: boolean;
  description: string;
};

export type SystemDriftDetector = {
  id: string;
  driftKind: string;
  layerRef: string;
  policyRef: string;
  invariantRef: string;
  simulationRef: string;
  detectCondition: string;
  integrityRef: string;
  required: boolean;
  description: string;
};

export type SystemReconciliationRule = {
  id: string;
  reconcileKind: string;
  layerRefs: string[];
  policyRef: string;
  driftRef: string;
  action: string;
  passCondition: string;
  integrityRef: string;
  required: boolean;
  description: string;
};

export type SystemGlobalFreezeSemantic = {
  id: string;
  semanticKind: string;
  layerRefs: string[];
  policyRef: string;
  invariantRef: string;
  rule: string;
  integrityRef: string;
  required: boolean;
  description: string;
};

export type SystemIntegrityCatalogManifest = {
  version: typeof V80_SYSTEM_INTEGRITY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  rules: SystemIntegrityRule[];
  summary: string;
};

export type SystemConsistencyManifest = {
  version: typeof V80_SYSTEM_INTEGRITY_VERSION;
  checkCount: number;
  consistencyComplete: boolean;
  checks: SystemConsistencyCheck[];
  summary: string;
};

export type SystemDriftDetectionManifest = {
  version: typeof V80_SYSTEM_INTEGRITY_VERSION;
  detectorCount: number;
  driftDetectionComplete: boolean;
  detectors: SystemDriftDetector[];
  summary: string;
};

export type SystemReconciliationManifest = {
  version: typeof V80_SYSTEM_INTEGRITY_VERSION;
  ruleCount: number;
  reconciliationComplete: boolean;
  rules: SystemReconciliationRule[];
  freezeSemantics: SystemGlobalFreezeSemantic[];
  summary: string;
};

export type SystemIntegrityCatalogSignals = {
  systemSimulationCatalogReady?: boolean;
  catalogComplete?: boolean;
  consistencyComplete?: boolean;
  driftComplete?: boolean;
  reconciliationComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type SystemIntegrityCatalogReport = {
  version: typeof V80_SYSTEM_INTEGRITY_VERSION;
  freezeVersion: typeof V80_SYSTEM_INTEGRITY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  systemSimulationCatalogVersion: string;
  systemSimulationCatalogReady: boolean;
  catalog: SystemIntegrityCatalogManifest;
  consistency: SystemConsistencyManifest;
  drift: SystemDriftDetectionManifest;
  reconciliation: SystemReconciliationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
