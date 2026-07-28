/**
 * Product M15 â€?Evolution Capability Evolution domain types
 * Main entity: CapabilitySpec (Capability domain; avoids P1 EvolutionCapability clash)
 */

import type {
  EVOLUTION_CAPABILITY_ADVANCEMENT_MODES,
  EVOLUTION_CAPABILITY_DOMAIN_SCOPES,
  EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_CAPABILITY_SPEC_KINDS,
  EVOLUTION_CAPABILITY_READINESS_VERDICTS,
  EVOLUTION_CAPABILITY_REVISION_KINDS,
  EVOLUTION_CAPABILITY_REVISION_STATUSES,
  EVOLUTION_CAPABILITY_SPEC_STATUSES,
  PRODUCT_EVOLUTION_CAPABILITY_BASE,
  PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION,
  PRODUCT_EVOLUTION_CAPABILITY_ID,
  PRODUCT_EVOLUTION_CAPABILITY_VERSION,
} from "./capability.constants";

export type EvolutionCapabilitySpecKind =
  (typeof EVOLUTION_CAPABILITY_SPEC_KINDS)[number];
export type EvolutionCapabilitySpecStatus =
  (typeof EVOLUTION_CAPABILITY_SPEC_STATUSES)[number];
export type EvolutionCapabilityRevisionKind =
  (typeof EVOLUTION_CAPABILITY_REVISION_KINDS)[number];
export type EvolutionCapabilityRevisionStatus =
  (typeof EVOLUTION_CAPABILITY_REVISION_STATUSES)[number];
export type EvolutionCapabilityDomainScope =
  (typeof EVOLUTION_CAPABILITY_DOMAIN_SCOPES)[number];
export type EvolutionCapabilityAdvancementMode =
  (typeof EVOLUTION_CAPABILITY_ADVANCEMENT_MODES)[number];
export type EvolutionCapabilityGovernancePolicyKind =
  (typeof EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_KINDS)[number];
export type EvolutionCapabilityGovernancePolicyStatus =
  (typeof EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_STATUSES)[number];
export type EvolutionCapabilityReadinessVerdict =
  (typeof EVOLUTION_CAPABILITY_READINESS_VERDICTS)[number];
export type EvolutionCapabilityRuntimeMetadata = Record<string, unknown>;

/** Frozen capability definition (in-memory declaration). */
export type EvolutionCapabilitySpec = {
  id: string;
  capabilityKey: string;
  kind: EvolutionCapabilitySpecKind;
  status: EvolutionCapabilitySpecStatus;
  scope: EvolutionCapabilityDomainScope;
  title: string;
  summary: string;
  optimizationRef: string;
  detail: string;
  metadata: EvolutionCapabilityRuntimeMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionCapabilitySpecInput = {
  id?: string;
  capabilityKey: string;
  kind: EvolutionCapabilitySpecKind;
  scope: EvolutionCapabilityDomainScope;
  title: string;
  summary: string;
  optimizationRef?: string;
  metadata?: EvolutionCapabilityRuntimeMetadata;
};

export type UpdateEvolutionCapabilitySpecStatusInput = {
  capabilityId: string;
  status: EvolutionCapabilitySpecStatus;
};

/** Declared capability revision â€?no runtime activation. */
export type EvolutionCapabilityRevision = {
  id: string;
  capabilityId: string;
  revisionKey: string;
  kind: EvolutionCapabilityRevisionKind;
  status: EvolutionCapabilityRevisionStatus;
  summary: string;
  detail: string;
  metadata: EvolutionCapabilityRuntimeMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionCapabilityRevisionInput = {
  id?: string;
  capabilityId: string;
  revisionKey: string;
  kind: EvolutionCapabilityRevisionKind;
  summary: string;
  metadata?: EvolutionCapabilityRuntimeMetadata;
};

export type UpdateEvolutionCapabilityRevisionStatusInput = {
  revisionId: string;
  status: EvolutionCapabilityRevisionStatus;
};

export type EvolutionCapabilityGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: EvolutionCapabilityGovernancePolicyKind;
  status: EvolutionCapabilityGovernancePolicyStatus;
  title: string;
  capabilityKeyRef: string;
  ruleRef: string;
  detail: string;
  metadata: EvolutionCapabilityRuntimeMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionCapabilityGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: EvolutionCapabilityGovernancePolicyKind;
  title: string;
  capabilityKeyRef: string;
  ruleRef: string;
  metadata?: EvolutionCapabilityRuntimeMetadata;
};

export type EvolutionCapabilityAdvancementQuery = {
  queryKey: string;
  mode: EvolutionCapabilityAdvancementMode;
  kind?: EvolutionCapabilitySpecKind;
  revisionKind?: EvolutionCapabilityRevisionKind;
  scope?: EvolutionCapabilityDomainScope;
  capabilityKeys?: string[];
};

export type EvolutionCapabilityAdvancementHit = {
  capabilityId: string;
  capabilityKey: string;
  kind: EvolutionCapabilitySpecKind;
  revisionKey: string;
  matchedOn: "CAPABILITY" | "KIND" | "REVISION" | "SCOPE";
};

/** Declarative advancement contract â€?no deployment / execution / activation. */
export type EvolutionCapabilityAdvancementContract = {
  id: string;
  contractKey: string;
  query: EvolutionCapabilityAdvancementQuery;
  hitCount: number;
  hits: EvolutionCapabilityAdvancementHit[];
  detail: string;
  metadata: EvolutionCapabilityRuntimeMetadata;
  evaluatedAt: string;
};

export type EvaluateEvolutionCapabilityAdvancementContractInput = {
  id?: string;
  contractKey: string;
  query: EvolutionCapabilityAdvancementQuery;
  metadata?: EvolutionCapabilityRuntimeMetadata;
};

export type EvolutionCapabilitySpecValidationIssue = {
  field: string;
  message: string;
};

export type EvolutionCapabilitySpecValidationResult = {
  ok: boolean;
  issues: EvolutionCapabilitySpecValidationIssue[];
};

export type EvolutionCapabilityReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type EvolutionCapabilityReadinessResult = {
  verdict: EvolutionCapabilityReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: EvolutionCapabilityReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type EvolutionCapabilityManifest = {
  capabilityRuntimeId: typeof PRODUCT_EVOLUTION_CAPABILITY_ID;
  version: typeof PRODUCT_EVOLUTION_CAPABILITY_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION;
  base: typeof PRODUCT_EVOLUTION_CAPABILITY_BASE;
  capabilityCount: number;
  activeCount: number;
  revisionCount: number;
  policyCount: number;
  contractCount: number;
  checksum: string;
  createdAt: string;
};
