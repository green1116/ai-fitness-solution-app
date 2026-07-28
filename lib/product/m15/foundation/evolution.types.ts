/**
 * Product M15 — Enterprise Evolution Foundation domain types
 */

import type {
  EVOLUTION_CAPABILITY_KINDS,
  EVOLUTION_CAPABILITY_STATUSES,
  EVOLUTION_DOMAIN_SCOPES,
  EVOLUTION_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_PROGRESSION_MODES,
  EVOLUTION_READINESS_VERDICTS,
  EVOLUTION_TRACK_KINDS,
  EVOLUTION_TRACK_STATUSES,
  PRODUCT_EVOLUTION_FOUNDATION_BASE,
  PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FOUNDATION_ID,
  PRODUCT_EVOLUTION_FOUNDATION_VERSION,
} from "./evolution.constants";

export type EvolutionTrackKind = (typeof EVOLUTION_TRACK_KINDS)[number];
export type EvolutionTrackStatus = (typeof EVOLUTION_TRACK_STATUSES)[number];
export type EvolutionCapabilityKind =
  (typeof EVOLUTION_CAPABILITY_KINDS)[number];
export type EvolutionCapabilityStatus =
  (typeof EVOLUTION_CAPABILITY_STATUSES)[number];
export type EvolutionDomainScope = (typeof EVOLUTION_DOMAIN_SCOPES)[number];
export type EvolutionProgressionMode =
  (typeof EVOLUTION_PROGRESSION_MODES)[number];
export type EvolutionGovernancePolicyKind =
  (typeof EVOLUTION_GOVERNANCE_POLICY_KINDS)[number];
export type EvolutionGovernancePolicyStatus =
  (typeof EVOLUTION_GOVERNANCE_POLICY_STATUSES)[number];
export type EvolutionReadinessVerdict =
  (typeof EVOLUTION_READINESS_VERDICTS)[number];
export type EvolutionMetadata = Record<string, unknown>;

/** Frozen evolution track definition (in-memory declaration). */
export type EvolutionTrack = {
  id: string;
  trackKey: string;
  kind: EvolutionTrackKind;
  status: EvolutionTrackStatus;
  scope: EvolutionDomainScope;
  title: string;
  summary: string;
  intelligenceBaselineRef: string;
  detail: string;
  metadata: EvolutionMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionTrackInput = {
  id?: string;
  trackKey: string;
  kind: EvolutionTrackKind;
  scope: EvolutionDomainScope;
  title: string;
  summary: string;
  intelligenceBaselineRef?: string;
  metadata?: EvolutionMetadata;
};

export type UpdateEvolutionTrackStatusInput = {
  trackId: string;
  status: EvolutionTrackStatus;
};

export type EvolutionCapability = {
  id: string;
  trackId: string;
  capabilityKey: string;
  kind: EvolutionCapabilityKind;
  status: EvolutionCapabilityStatus;
  summary: string;
  detail: string;
  metadata: EvolutionMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionCapabilityInput = {
  id?: string;
  trackId: string;
  capabilityKey: string;
  kind: EvolutionCapabilityKind;
  summary: string;
  metadata?: EvolutionMetadata;
};

export type UpdateEvolutionCapabilityStatusInput = {
  capabilityId: string;
  status: EvolutionCapabilityStatus;
};

export type EvolutionGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: EvolutionGovernancePolicyKind;
  status: EvolutionGovernancePolicyStatus;
  title: string;
  trackKeyRef: string;
  ruleRef: string;
  detail: string;
  metadata: EvolutionMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: EvolutionGovernancePolicyKind;
  title: string;
  trackKeyRef: string;
  ruleRef: string;
  metadata?: EvolutionMetadata;
};

export type EvolutionProgressionQuery = {
  queryKey: string;
  mode: EvolutionProgressionMode;
  kind?: EvolutionTrackKind;
  capabilityKind?: EvolutionCapabilityKind;
  scope?: EvolutionDomainScope;
  trackKeys?: string[];
};

export type EvolutionProgressionHit = {
  trackId: string;
  trackKey: string;
  kind: EvolutionTrackKind;
  capabilityKey: string;
  matchedOn: "TRACK" | "KIND" | "CAPABILITY" | "SCOPE";
};

/** Declarative progression contract — no evolution execution. */
export type EvolutionProgressionContract = {
  id: string;
  contractKey: string;
  query: EvolutionProgressionQuery;
  hitCount: number;
  hits: EvolutionProgressionHit[];
  detail: string;
  metadata: EvolutionMetadata;
  evaluatedAt: string;
};

export type EvaluateEvolutionProgressionContractInput = {
  id?: string;
  contractKey: string;
  query: EvolutionProgressionQuery;
  metadata?: EvolutionMetadata;
};

export type EvolutionTrackValidationIssue = {
  field: string;
  message: string;
};

export type EvolutionTrackValidationResult = {
  ok: boolean;
  issues: EvolutionTrackValidationIssue[];
};

export type EvolutionReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type EvolutionReadinessResult = {
  verdict: EvolutionReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: EvolutionReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type EvolutionFoundationManifest = {
  foundationId: typeof PRODUCT_EVOLUTION_FOUNDATION_ID;
  version: typeof PRODUCT_EVOLUTION_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_EVOLUTION_FOUNDATION_BASE;
  trackCount: number;
  activeCount: number;
  capabilityCount: number;
  policyCount: number;
  contractCount: number;
  checksum: string;
  createdAt: string;
};
