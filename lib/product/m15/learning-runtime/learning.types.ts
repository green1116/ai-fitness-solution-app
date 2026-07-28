/**
 * Product M15 — Evolution Learning Engine domain types
 */

import type {
  EVOLUTION_LEARNING_CAPABILITY_KINDS,
  EVOLUTION_LEARNING_CAPABILITY_STATUSES,
  EVOLUTION_LEARNING_DOMAIN_SCOPES,
  EVOLUTION_LEARNING_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_LEARNING_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_LEARNING_INSIGHT_MODES,
  EVOLUTION_LEARNING_KINDS,
  EVOLUTION_LEARNING_READINESS_VERDICTS,
  EVOLUTION_LEARNING_STATUSES,
  PRODUCT_EVOLUTION_LEARNING_BASE,
  PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION,
  PRODUCT_EVOLUTION_LEARNING_ID,
  PRODUCT_EVOLUTION_LEARNING_VERSION,
} from "./learning.constants";

export type EvolutionLearningKind = (typeof EVOLUTION_LEARNING_KINDS)[number];
export type EvolutionLearningStatus =
  (typeof EVOLUTION_LEARNING_STATUSES)[number];
export type EvolutionLearningCapabilityKind =
  (typeof EVOLUTION_LEARNING_CAPABILITY_KINDS)[number];
export type EvolutionLearningCapabilityStatus =
  (typeof EVOLUTION_LEARNING_CAPABILITY_STATUSES)[number];
export type EvolutionLearningDomainScope =
  (typeof EVOLUTION_LEARNING_DOMAIN_SCOPES)[number];
export type EvolutionLearningInsightMode =
  (typeof EVOLUTION_LEARNING_INSIGHT_MODES)[number];
export type EvolutionLearningGovernancePolicyKind =
  (typeof EVOLUTION_LEARNING_GOVERNANCE_POLICY_KINDS)[number];
export type EvolutionLearningGovernancePolicyStatus =
  (typeof EVOLUTION_LEARNING_GOVERNANCE_POLICY_STATUSES)[number];
export type EvolutionLearningReadinessVerdict =
  (typeof EVOLUTION_LEARNING_READINESS_VERDICTS)[number];
export type EvolutionLearningMetadata = Record<string, unknown>;

/** Frozen learning artifact definition (in-memory declaration). */
export type EvolutionLearning = {
  id: string;
  learningKey: string;
  kind: EvolutionLearningKind;
  status: EvolutionLearningStatus;
  scope: EvolutionLearningDomainScope;
  title: string;
  summary: string;
  experienceRef: string;
  detail: string;
  metadata: EvolutionLearningMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionLearningInput = {
  id?: string;
  learningKey: string;
  kind: EvolutionLearningKind;
  scope: EvolutionLearningDomainScope;
  title: string;
  summary: string;
  experienceRef?: string;
  metadata?: EvolutionLearningMetadata;
};

export type UpdateEvolutionLearningStatusInput = {
  learningId: string;
  status: EvolutionLearningStatus;
};

export type EvolutionLearningCapability = {
  id: string;
  learningId: string;
  capabilityKey: string;
  kind: EvolutionLearningCapabilityKind;
  status: EvolutionLearningCapabilityStatus;
  summary: string;
  detail: string;
  metadata: EvolutionLearningMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionLearningCapabilityInput = {
  id?: string;
  learningId: string;
  capabilityKey: string;
  kind: EvolutionLearningCapabilityKind;
  summary: string;
  metadata?: EvolutionLearningMetadata;
};

export type UpdateEvolutionLearningCapabilityStatusInput = {
  capabilityId: string;
  status: EvolutionLearningCapabilityStatus;
};

export type EvolutionLearningGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: EvolutionLearningGovernancePolicyKind;
  status: EvolutionLearningGovernancePolicyStatus;
  title: string;
  learningKeyRef: string;
  ruleRef: string;
  detail: string;
  metadata: EvolutionLearningMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionLearningGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: EvolutionLearningGovernancePolicyKind;
  title: string;
  learningKeyRef: string;
  ruleRef: string;
  metadata?: EvolutionLearningMetadata;
};

export type EvolutionLearningInsightQuery = {
  queryKey: string;
  mode: EvolutionLearningInsightMode;
  kind?: EvolutionLearningKind;
  capabilityKind?: EvolutionLearningCapabilityKind;
  scope?: EvolutionLearningDomainScope;
  learningKeys?: string[];
};

export type EvolutionLearningInsightHit = {
  learningId: string;
  learningKey: string;
  kind: EvolutionLearningKind;
  capabilityKey: string;
  matchedOn: "LEARNING" | "KIND" | "CAPABILITY" | "SCOPE";
};

/** Declarative insight contract — no optimization / recommendation / execution. */
export type EvolutionLearningInsightContract = {
  id: string;
  contractKey: string;
  query: EvolutionLearningInsightQuery;
  hitCount: number;
  hits: EvolutionLearningInsightHit[];
  detail: string;
  metadata: EvolutionLearningMetadata;
  evaluatedAt: string;
};

export type EvaluateEvolutionLearningInsightContractInput = {
  id?: string;
  contractKey: string;
  query: EvolutionLearningInsightQuery;
  metadata?: EvolutionLearningMetadata;
};

export type EvolutionLearningValidationIssue = {
  field: string;
  message: string;
};

export type EvolutionLearningValidationResult = {
  ok: boolean;
  issues: EvolutionLearningValidationIssue[];
};

export type EvolutionLearningReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type EvolutionLearningReadinessResult = {
  verdict: EvolutionLearningReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: EvolutionLearningReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type EvolutionLearningManifest = {
  learningId: typeof PRODUCT_EVOLUTION_LEARNING_ID;
  version: typeof PRODUCT_EVOLUTION_LEARNING_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION;
  base: typeof PRODUCT_EVOLUTION_LEARNING_BASE;
  learningCount: number;
  activeCount: number;
  capabilityCount: number;
  policyCount: number;
  contractCount: number;
  checksum: string;
  createdAt: string;
};
