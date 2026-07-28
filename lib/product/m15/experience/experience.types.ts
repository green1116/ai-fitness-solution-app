/**
 * Product M15 — Evolution Experience Platform domain types
 */

import type {
  EVOLUTION_EXPERIENCE_CAPABILITY_KINDS,
  EVOLUTION_EXPERIENCE_CAPABILITY_STATUSES,
  EVOLUTION_EXPERIENCE_DOMAIN_SCOPES,
  EVOLUTION_EXPERIENCE_EXPOSURE_MODES,
  EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_EXPERIENCE_KINDS,
  EVOLUTION_EXPERIENCE_READINESS_VERDICTS,
  EVOLUTION_EXPERIENCE_STATUSES,
  PRODUCT_EVOLUTION_EXPERIENCE_BASE,
  PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_EXPERIENCE_ID,
  PRODUCT_EVOLUTION_EXPERIENCE_VERSION,
} from "./experience.constants";

export type EvolutionExperienceKind =
  (typeof EVOLUTION_EXPERIENCE_KINDS)[number];
export type EvolutionExperienceStatus =
  (typeof EVOLUTION_EXPERIENCE_STATUSES)[number];
export type EvolutionExperienceCapabilityKind =
  (typeof EVOLUTION_EXPERIENCE_CAPABILITY_KINDS)[number];
export type EvolutionExperienceCapabilityStatus =
  (typeof EVOLUTION_EXPERIENCE_CAPABILITY_STATUSES)[number];
export type EvolutionExperienceDomainScope =
  (typeof EVOLUTION_EXPERIENCE_DOMAIN_SCOPES)[number];
export type EvolutionExperienceExposureMode =
  (typeof EVOLUTION_EXPERIENCE_EXPOSURE_MODES)[number];
export type EvolutionExperienceGovernancePolicyKind =
  (typeof EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_KINDS)[number];
export type EvolutionExperienceGovernancePolicyStatus =
  (typeof EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_STATUSES)[number];
export type EvolutionExperienceReadinessVerdict =
  (typeof EVOLUTION_EXPERIENCE_READINESS_VERDICTS)[number];
export type EvolutionExperienceMetadata = Record<string, unknown>;

/** Frozen experience surface definition (in-memory declaration). */
export type EvolutionExperience = {
  id: string;
  experienceKey: string;
  kind: EvolutionExperienceKind;
  status: EvolutionExperienceStatus;
  scope: EvolutionExperienceDomainScope;
  title: string;
  summary: string;
  feedbackRef: string;
  detail: string;
  metadata: EvolutionExperienceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionExperienceInput = {
  id?: string;
  experienceKey: string;
  kind: EvolutionExperienceKind;
  scope: EvolutionExperienceDomainScope;
  title: string;
  summary: string;
  feedbackRef?: string;
  metadata?: EvolutionExperienceMetadata;
};

export type UpdateEvolutionExperienceStatusInput = {
  experienceId: string;
  status: EvolutionExperienceStatus;
};

export type EvolutionExperienceCapability = {
  id: string;
  experienceId: string;
  capabilityKey: string;
  kind: EvolutionExperienceCapabilityKind;
  status: EvolutionExperienceCapabilityStatus;
  summary: string;
  detail: string;
  metadata: EvolutionExperienceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionExperienceCapabilityInput = {
  id?: string;
  experienceId: string;
  capabilityKey: string;
  kind: EvolutionExperienceCapabilityKind;
  summary: string;
  metadata?: EvolutionExperienceMetadata;
};

export type UpdateEvolutionExperienceCapabilityStatusInput = {
  capabilityId: string;
  status: EvolutionExperienceCapabilityStatus;
};

export type EvolutionExperienceGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: EvolutionExperienceGovernancePolicyKind;
  status: EvolutionExperienceGovernancePolicyStatus;
  title: string;
  experienceKeyRef: string;
  ruleRef: string;
  detail: string;
  metadata: EvolutionExperienceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionExperienceGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: EvolutionExperienceGovernancePolicyKind;
  title: string;
  experienceKeyRef: string;
  ruleRef: string;
  metadata?: EvolutionExperienceMetadata;
};

export type EvolutionExperienceExposureQuery = {
  queryKey: string;
  mode: EvolutionExperienceExposureMode;
  kind?: EvolutionExperienceKind;
  capabilityKind?: EvolutionExperienceCapabilityKind;
  scope?: EvolutionExperienceDomainScope;
  experienceKeys?: string[];
};

export type EvolutionExperienceExposureHit = {
  experienceId: string;
  experienceKey: string;
  kind: EvolutionExperienceKind;
  capabilityKey: string;
  matchedOn: "EXPERIENCE" | "KIND" | "CAPABILITY" | "SCOPE";
};

/** Declarative exposure contract — no learning / optimization / AI analysis. */
export type EvolutionExperienceExposureContract = {
  id: string;
  contractKey: string;
  query: EvolutionExperienceExposureQuery;
  hitCount: number;
  hits: EvolutionExperienceExposureHit[];
  detail: string;
  metadata: EvolutionExperienceMetadata;
  evaluatedAt: string;
};

export type EvaluateEvolutionExperienceExposureContractInput = {
  id?: string;
  contractKey: string;
  query: EvolutionExperienceExposureQuery;
  metadata?: EvolutionExperienceMetadata;
};

export type EvolutionExperienceValidationIssue = {
  field: string;
  message: string;
};

export type EvolutionExperienceValidationResult = {
  ok: boolean;
  issues: EvolutionExperienceValidationIssue[];
};

export type EvolutionExperienceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type EvolutionExperienceReadinessResult = {
  verdict: EvolutionExperienceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: EvolutionExperienceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type EvolutionExperienceManifest = {
  experienceId: typeof PRODUCT_EVOLUTION_EXPERIENCE_ID;
  version: typeof PRODUCT_EVOLUTION_EXPERIENCE_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION;
  base: typeof PRODUCT_EVOLUTION_EXPERIENCE_BASE;
  experienceCount: number;
  activeCount: number;
  capabilityCount: number;
  policyCount: number;
  contractCount: number;
  checksum: string;
  createdAt: string;
};
