/**
 * Product M15 — Evolution Feedback Platform domain types
 */

import type {
  EVOLUTION_FEEDBACK_CAPABILITY_KINDS,
  EVOLUTION_FEEDBACK_CAPABILITY_STATUSES,
  EVOLUTION_FEEDBACK_DOMAIN_SCOPES,
  EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_FEEDBACK_INTAKE_MODES,
  EVOLUTION_FEEDBACK_KINDS,
  EVOLUTION_FEEDBACK_READINESS_VERDICTS,
  EVOLUTION_FEEDBACK_STATUSES,
  PRODUCT_EVOLUTION_FEEDBACK_BASE,
  PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FEEDBACK_ID,
  PRODUCT_EVOLUTION_FEEDBACK_VERSION,
} from "./feedback.constants";

export type EvolutionFeedbackKind = (typeof EVOLUTION_FEEDBACK_KINDS)[number];
export type EvolutionFeedbackStatus =
  (typeof EVOLUTION_FEEDBACK_STATUSES)[number];
export type EvolutionFeedbackCapabilityKind =
  (typeof EVOLUTION_FEEDBACK_CAPABILITY_KINDS)[number];
export type EvolutionFeedbackCapabilityStatus =
  (typeof EVOLUTION_FEEDBACK_CAPABILITY_STATUSES)[number];
export type EvolutionFeedbackDomainScope =
  (typeof EVOLUTION_FEEDBACK_DOMAIN_SCOPES)[number];
export type EvolutionFeedbackIntakeMode =
  (typeof EVOLUTION_FEEDBACK_INTAKE_MODES)[number];
export type EvolutionFeedbackGovernancePolicyKind =
  (typeof EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_KINDS)[number];
export type EvolutionFeedbackGovernancePolicyStatus =
  (typeof EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_STATUSES)[number];
export type EvolutionFeedbackReadinessVerdict =
  (typeof EVOLUTION_FEEDBACK_READINESS_VERDICTS)[number];
export type EvolutionFeedbackMetadata = Record<string, unknown>;

/** Frozen feedback channel definition (in-memory declaration). */
export type EvolutionFeedback = {
  id: string;
  feedbackKey: string;
  kind: EvolutionFeedbackKind;
  status: EvolutionFeedbackStatus;
  scope: EvolutionFeedbackDomainScope;
  title: string;
  summary: string;
  foundationRef: string;
  detail: string;
  metadata: EvolutionFeedbackMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionFeedbackInput = {
  id?: string;
  feedbackKey: string;
  kind: EvolutionFeedbackKind;
  scope: EvolutionFeedbackDomainScope;
  title: string;
  summary: string;
  foundationRef?: string;
  metadata?: EvolutionFeedbackMetadata;
};

export type UpdateEvolutionFeedbackStatusInput = {
  feedbackId: string;
  status: EvolutionFeedbackStatus;
};

export type EvolutionFeedbackCapability = {
  id: string;
  feedbackId: string;
  capabilityKey: string;
  kind: EvolutionFeedbackCapabilityKind;
  status: EvolutionFeedbackCapabilityStatus;
  summary: string;
  detail: string;
  metadata: EvolutionFeedbackMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionFeedbackCapabilityInput = {
  id?: string;
  feedbackId: string;
  capabilityKey: string;
  kind: EvolutionFeedbackCapabilityKind;
  summary: string;
  metadata?: EvolutionFeedbackMetadata;
};

export type UpdateEvolutionFeedbackCapabilityStatusInput = {
  capabilityId: string;
  status: EvolutionFeedbackCapabilityStatus;
};

export type EvolutionFeedbackGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: EvolutionFeedbackGovernancePolicyKind;
  status: EvolutionFeedbackGovernancePolicyStatus;
  title: string;
  feedbackKeyRef: string;
  ruleRef: string;
  detail: string;
  metadata: EvolutionFeedbackMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionFeedbackGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: EvolutionFeedbackGovernancePolicyKind;
  title: string;
  feedbackKeyRef: string;
  ruleRef: string;
  metadata?: EvolutionFeedbackMetadata;
};

export type EvolutionFeedbackIntakeQuery = {
  queryKey: string;
  mode: EvolutionFeedbackIntakeMode;
  kind?: EvolutionFeedbackKind;
  capabilityKind?: EvolutionFeedbackCapabilityKind;
  scope?: EvolutionFeedbackDomainScope;
  feedbackKeys?: string[];
};

export type EvolutionFeedbackIntakeHit = {
  feedbackId: string;
  feedbackKey: string;
  kind: EvolutionFeedbackKind;
  capabilityKey: string;
  matchedOn: "FEEDBACK" | "KIND" | "CAPABILITY" | "SCOPE";
};

/** Declarative intake contract — no learning / optimization / AI analysis. */
export type EvolutionFeedbackIntakeContract = {
  id: string;
  contractKey: string;
  query: EvolutionFeedbackIntakeQuery;
  hitCount: number;
  hits: EvolutionFeedbackIntakeHit[];
  detail: string;
  metadata: EvolutionFeedbackMetadata;
  evaluatedAt: string;
};

export type EvaluateEvolutionFeedbackIntakeContractInput = {
  id?: string;
  contractKey: string;
  query: EvolutionFeedbackIntakeQuery;
  metadata?: EvolutionFeedbackMetadata;
};

export type EvolutionFeedbackValidationIssue = {
  field: string;
  message: string;
};

export type EvolutionFeedbackValidationResult = {
  ok: boolean;
  issues: EvolutionFeedbackValidationIssue[];
};

export type EvolutionFeedbackReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type EvolutionFeedbackReadinessResult = {
  verdict: EvolutionFeedbackReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: EvolutionFeedbackReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type EvolutionFeedbackManifest = {
  feedbackId: typeof PRODUCT_EVOLUTION_FEEDBACK_ID;
  version: typeof PRODUCT_EVOLUTION_FEEDBACK_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION;
  base: typeof PRODUCT_EVOLUTION_FEEDBACK_BASE;
  feedbackCount: number;
  activeCount: number;
  capabilityCount: number;
  policyCount: number;
  contractCount: number;
  checksum: string;
  createdAt: string;
};
