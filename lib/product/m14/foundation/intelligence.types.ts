/**
 * Product M14 — Enterprise Intelligence Foundation domain types
 */

import type {
  INTELLIGENCE_ANALYSIS_MODES,
  INTELLIGENCE_CAPABILITY_KINDS,
  INTELLIGENCE_CAPABILITY_STATUSES,
  INTELLIGENCE_DOMAIN_SCOPES,
  INTELLIGENCE_GOVERNANCE_POLICY_KINDS,
  INTELLIGENCE_GOVERNANCE_POLICY_STATUSES,
  INTELLIGENCE_LENS_KINDS,
  INTELLIGENCE_LENS_STATUSES,
  INTELLIGENCE_READINESS_VERDICTS,
  PRODUCT_INTELLIGENCE_FOUNDATION_BASE,
  PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_FOUNDATION_ID,
  PRODUCT_INTELLIGENCE_FOUNDATION_VERSION,
} from "./intelligence.constants";

export type IntelligenceLensKind = (typeof INTELLIGENCE_LENS_KINDS)[number];
export type IntelligenceLensStatus =
  (typeof INTELLIGENCE_LENS_STATUSES)[number];
export type IntelligenceCapabilityKind =
  (typeof INTELLIGENCE_CAPABILITY_KINDS)[number];
export type IntelligenceCapabilityStatus =
  (typeof INTELLIGENCE_CAPABILITY_STATUSES)[number];
export type IntelligenceDomainScope =
  (typeof INTELLIGENCE_DOMAIN_SCOPES)[number];
export type IntelligenceAnalysisMode =
  (typeof INTELLIGENCE_ANALYSIS_MODES)[number];
export type IntelligenceGovernancePolicyKind =
  (typeof INTELLIGENCE_GOVERNANCE_POLICY_KINDS)[number];
export type IntelligenceGovernancePolicyStatus =
  (typeof INTELLIGENCE_GOVERNANCE_POLICY_STATUSES)[number];
export type IntelligenceReadinessVerdict =
  (typeof INTELLIGENCE_READINESS_VERDICTS)[number];
export type IntelligenceMetadata = Record<string, unknown>;

/** Frozen intelligence lens definition (in-memory declaration). */
export type IntelligenceLens = {
  id: string;
  lensKey: string;
  kind: IntelligenceLensKind;
  status: IntelligenceLensStatus;
  scope: IntelligenceDomainScope;
  title: string;
  summary: string;
  osBaselineRef: string;
  detail: string;
  metadata: IntelligenceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceLensInput = {
  id?: string;
  lensKey: string;
  kind: IntelligenceLensKind;
  scope: IntelligenceDomainScope;
  title: string;
  summary: string;
  osBaselineRef?: string;
  metadata?: IntelligenceMetadata;
};

export type UpdateIntelligenceLensStatusInput = {
  lensId: string;
  status: IntelligenceLensStatus;
};

export type IntelligenceCapability = {
  id: string;
  lensId: string;
  capabilityKey: string;
  kind: IntelligenceCapabilityKind;
  status: IntelligenceCapabilityStatus;
  summary: string;
  detail: string;
  metadata: IntelligenceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceCapabilityInput = {
  id?: string;
  lensId: string;
  capabilityKey: string;
  kind: IntelligenceCapabilityKind;
  summary: string;
  metadata?: IntelligenceMetadata;
};

export type UpdateIntelligenceCapabilityStatusInput = {
  capabilityId: string;
  status: IntelligenceCapabilityStatus;
};

export type IntelligenceGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: IntelligenceGovernancePolicyKind;
  status: IntelligenceGovernancePolicyStatus;
  title: string;
  lensKeyRef: string;
  ruleRef: string;
  detail: string;
  metadata: IntelligenceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: IntelligenceGovernancePolicyKind;
  title: string;
  lensKeyRef: string;
  ruleRef: string;
  metadata?: IntelligenceMetadata;
};

export type IntelligenceAnalysisQuery = {
  queryKey: string;
  mode: IntelligenceAnalysisMode;
  kind?: IntelligenceLensKind;
  capabilityKind?: IntelligenceCapabilityKind;
  scope?: IntelligenceDomainScope;
  lensKeys?: string[];
};

export type IntelligenceAnalysisHit = {
  lensId: string;
  lensKey: string;
  kind: IntelligenceLensKind;
  capabilityKey: string;
  matchedOn: "LENS" | "KIND" | "CAPABILITY" | "SCOPE";
};

/** Declarative analysis contract — no intelligence execution. */
export type IntelligenceAnalysisContract = {
  id: string;
  contractKey: string;
  query: IntelligenceAnalysisQuery;
  hitCount: number;
  hits: IntelligenceAnalysisHit[];
  detail: string;
  metadata: IntelligenceMetadata;
  evaluatedAt: string;
};

export type EvaluateIntelligenceAnalysisContractInput = {
  id?: string;
  contractKey: string;
  query: IntelligenceAnalysisQuery;
  metadata?: IntelligenceMetadata;
};

export type IntelligenceLensValidationIssue = {
  field: string;
  message: string;
};

export type IntelligenceLensValidationResult = {
  ok: boolean;
  issues: IntelligenceLensValidationIssue[];
};

export type IntelligenceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IntelligenceReadinessResult = {
  verdict: IntelligenceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: IntelligenceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type IntelligenceFoundationManifest = {
  foundationId: typeof PRODUCT_INTELLIGENCE_FOUNDATION_ID;
  version: typeof PRODUCT_INTELLIGENCE_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_INTELLIGENCE_FOUNDATION_BASE;
  lensCount: number;
  activeCount: number;
  capabilityCount: number;
  policyCount: number;
  contractCount: number;
  checksum: string;
  createdAt: string;
};
