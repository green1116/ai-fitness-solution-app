/**
 * Product M15 — Evolution Governance domain types
 * Main entity: EvolutionGovernance
 */

import type {
  EVOLUTION_GOVERNANCE_CONTROL_POLICY_KINDS,
  EVOLUTION_GOVERNANCE_CONTROL_POLICY_STATUSES,
  EVOLUTION_GOVERNANCE_DOMAIN_SCOPES,
  EVOLUTION_GOVERNANCE_FRAME_KINDS,
  EVOLUTION_GOVERNANCE_FRAME_STATUSES,
  EVOLUTION_GOVERNANCE_OVERSIGHT_MODES,
  EVOLUTION_GOVERNANCE_READINESS_VERDICTS,
  EVOLUTION_GOVERNANCE_REVIEW_KINDS,
  EVOLUTION_GOVERNANCE_REVIEW_STATUSES,
  PRODUCT_EVOLUTION_GOVERNANCE_BASE,
  PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_GOVERNANCE_ID,
  PRODUCT_EVOLUTION_GOVERNANCE_VERSION,
} from "./governance.constants";

export type EvolutionGovernanceKind =
  (typeof EVOLUTION_GOVERNANCE_FRAME_KINDS)[number];
export type EvolutionGovernanceStatus =
  (typeof EVOLUTION_GOVERNANCE_FRAME_STATUSES)[number];
export type EvolutionGovernanceReviewKind =
  (typeof EVOLUTION_GOVERNANCE_REVIEW_KINDS)[number];
export type EvolutionGovernanceReviewStatus =
  (typeof EVOLUTION_GOVERNANCE_REVIEW_STATUSES)[number];
export type EvolutionGovernanceDomainScope =
  (typeof EVOLUTION_GOVERNANCE_DOMAIN_SCOPES)[number];
export type EvolutionGovernanceOversightMode =
  (typeof EVOLUTION_GOVERNANCE_OVERSIGHT_MODES)[number];
export type EvolutionGovernanceControlPolicyKind =
  (typeof EVOLUTION_GOVERNANCE_CONTROL_POLICY_KINDS)[number];
export type EvolutionGovernanceControlPolicyStatus =
  (typeof EVOLUTION_GOVERNANCE_CONTROL_POLICY_STATUSES)[number];
export type EvolutionGovernanceReadinessVerdict =
  (typeof EVOLUTION_GOVERNANCE_READINESS_VERDICTS)[number];
export type EvolutionGovernanceRuntimeMetadata = Record<string, unknown>;

/** Frozen evolution governance frame (in-memory declaration). */
export type EvolutionGovernance = {
  id: string;
  governanceKey: string;
  kind: EvolutionGovernanceKind;
  status: EvolutionGovernanceStatus;
  scope: EvolutionGovernanceDomainScope;
  title: string;
  summary: string;
  capabilityRef: string;
  detail: string;
  metadata: EvolutionGovernanceRuntimeMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionGovernanceInput = {
  id?: string;
  governanceKey: string;
  kind: EvolutionGovernanceKind;
  scope: EvolutionGovernanceDomainScope;
  title: string;
  summary: string;
  capabilityRef?: string;
  metadata?: EvolutionGovernanceRuntimeMetadata;
};

export type UpdateEvolutionGovernanceStatusInput = {
  governanceId: string;
  status: EvolutionGovernanceStatus;
};

/** Declared governance review — no capability upgrade / execution. */
export type EvolutionGovernanceReview = {
  id: string;
  governanceId: string;
  reviewKey: string;
  kind: EvolutionGovernanceReviewKind;
  status: EvolutionGovernanceReviewStatus;
  summary: string;
  detail: string;
  metadata: EvolutionGovernanceRuntimeMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionGovernanceReviewInput = {
  id?: string;
  governanceId: string;
  reviewKey: string;
  kind: EvolutionGovernanceReviewKind;
  summary: string;
  metadata?: EvolutionGovernanceRuntimeMetadata;
};

export type UpdateEvolutionGovernanceReviewStatusInput = {
  reviewId: string;
  status: EvolutionGovernanceReviewStatus;
};

export type EvolutionGovernanceControlPolicy = {
  id: string;
  policyKey: string;
  kind: EvolutionGovernanceControlPolicyKind;
  status: EvolutionGovernanceControlPolicyStatus;
  title: string;
  governanceKeyRef: string;
  ruleRef: string;
  detail: string;
  metadata: EvolutionGovernanceRuntimeMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionGovernanceControlPolicyInput = {
  id?: string;
  policyKey: string;
  kind: EvolutionGovernanceControlPolicyKind;
  title: string;
  governanceKeyRef: string;
  ruleRef: string;
  metadata?: EvolutionGovernanceRuntimeMetadata;
};

export type EvolutionGovernanceOversightQuery = {
  queryKey: string;
  mode: EvolutionGovernanceOversightMode;
  kind?: EvolutionGovernanceKind;
  reviewKind?: EvolutionGovernanceReviewKind;
  scope?: EvolutionGovernanceDomainScope;
  governanceKeys?: string[];
};

export type EvolutionGovernanceOversightHit = {
  governanceId: string;
  governanceKey: string;
  kind: EvolutionGovernanceKind;
  reviewKey: string;
  matchedOn: "GOVERNANCE" | "KIND" | "REVIEW" | "SCOPE";
};

/** Declarative oversight contract — no deployment / execution / capability upgrade. */
export type EvolutionGovernanceOversightContract = {
  id: string;
  contractKey: string;
  query: EvolutionGovernanceOversightQuery;
  hitCount: number;
  hits: EvolutionGovernanceOversightHit[];
  detail: string;
  metadata: EvolutionGovernanceRuntimeMetadata;
  evaluatedAt: string;
};

export type EvaluateEvolutionGovernanceOversightContractInput = {
  id?: string;
  contractKey: string;
  query: EvolutionGovernanceOversightQuery;
  metadata?: EvolutionGovernanceRuntimeMetadata;
};

export type EvolutionGovernanceValidationIssue = {
  field: string;
  message: string;
};

export type EvolutionGovernanceValidationResult = {
  ok: boolean;
  issues: EvolutionGovernanceValidationIssue[];
};

export type EvolutionGovernanceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type EvolutionGovernanceReadinessResult = {
  verdict: EvolutionGovernanceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: EvolutionGovernanceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type EvolutionGovernanceManifest = {
  governanceRuntimeId: typeof PRODUCT_EVOLUTION_GOVERNANCE_ID;
  version: typeof PRODUCT_EVOLUTION_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION;
  base: typeof PRODUCT_EVOLUTION_GOVERNANCE_BASE;
  governanceCount: number;
  activeCount: number;
  reviewCount: number;
  policyCount: number;
  contractCount: number;
  checksum: string;
  createdAt: string;
};
