/**
 * V80 P5 — System meta closure types (declarative, read-only)
 */

export const V80_SYSTEM_CLOSURE_VERSION = "v80-system-meta-closure-1" as const;
export const V80_SYSTEM_CLOSURE_FREEZE_VERSION = "v80-system-meta-closure-freeze-1" as const;
export const V80_SYSTEM_SIGNOFF_VERSION = "v80-system-signoff-1" as const;
export const V80_SYSTEM_FREEZE_VERSION = "v80-system-freeze-1" as const;

export type SystemClosureKind =
  | "ontology"
  | "policy"
  | "simulation"
  | "integrity"
  | "completeness"
  | "seal";

export type SystemClosureStatus = "certified" | "pending" | "blocked" | "waived";

export type SystemClosureProof = {
  id: string;
  kind: SystemClosureKind;
  phase: string;
  phaseVersion: string;
  layerRefs: string[];
  completenessRef: string;
  invariantCertRef: string;
  passCondition: string;
  status: SystemClosureStatus;
  required: boolean;
  description: string;
};

export type SystemCompletenessProof = {
  id: string;
  phase: string;
  phaseLabel: string;
  phaseVersion: string;
  verifyScript: string;
  coverageCondition: string;
  closureRef: string;
  required: boolean;
  description: string;
};

export type SystemGlobalInvariantCert = {
  id: string;
  invariantRef: string;
  layerRefs: string[];
  certificationRule: string;
  stackCondition: string;
  closureRef: string;
  required: boolean;
  description: string;
};

export type SystemSealStateKind = "sealed" | "unsealed" | "blocked";

export type SystemVersionLock = {
  systemInventory: string;
  systemPolicy: string;
  systemSimulation: string;
  systemIntegrity: string;
  systemClosure: string;
  signoff: typeof V80_SYSTEM_SIGNOFF_VERSION;
  freeze: typeof V80_SYSTEM_FREEZE_VERSION;
  upstreamV79TaskSignoff: string;
  upstreamV79TaskFreeze: string;
};

export type SystemRollbackEntry = {
  id: string;
  phase: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type SystemFinalFreezeManifest = {
  version: typeof V80_SYSTEM_FREEZE_VERSION;
  sealId: string;
  sealedAt: string;
  deploymentId: string;
  lockVersion: SystemVersionLock;
  versionLockOk: boolean;
  rollbackIndexComplete: boolean;
  rollbackEntries: SystemRollbackEntry[];
  sealState: SystemSealStateKind;
  sealed: boolean;
  summary: string;
};

export type SystemPhaseReadiness = {
  p1: boolean;
  p2: boolean;
  p3: boolean;
  p4: boolean;
  ready: boolean;
  blocked: boolean;
  summary: string;
};

export type SystemClosureCatalogManifest = {
  version: typeof V80_SYSTEM_CLOSURE_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  proofs: SystemClosureProof[];
  summary: string;
};

export type SystemCompletenessManifest = {
  version: typeof V80_SYSTEM_CLOSURE_VERSION;
  proofCount: number;
  completenessComplete: boolean;
  proofs: SystemCompletenessProof[];
  summary: string;
};

export type SystemInvariantCertManifest = {
  version: typeof V80_SYSTEM_CLOSURE_VERSION;
  certCount: number;
  certificationComplete: boolean;
  certifications: SystemGlobalInvariantCert[];
  summary: string;
};

export type SystemClosureSignals = {
  systemIntegrityCatalogReady?: boolean;
  catalogComplete?: boolean;
  completenessComplete?: boolean;
  certificationComplete?: boolean;
  sealComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type SystemClosureReport = {
  version: typeof V80_SYSTEM_CLOSURE_VERSION;
  freezeVersion: typeof V80_SYSTEM_CLOSURE_FREEZE_VERSION;
  signoffVersion: typeof V80_SYSTEM_SIGNOFF_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  systemIntegrityVersion: string;
  systemIntegrityReady: boolean;
  readiness: SystemPhaseReadiness;
  catalog: SystemClosureCatalogManifest;
  completeness: SystemCompletenessManifest;
  invariantCert: SystemInvariantCertManifest;
  freeze: SystemFinalFreezeManifest;
  closureReady: boolean;
  readinessScore: number;
  closingSummary: string;
  summary: string;
};
