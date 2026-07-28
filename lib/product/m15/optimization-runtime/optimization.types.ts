/**
 * Product M15 — Evolution Optimization Engine domain types
 */

import type {
  EVOLUTION_OPTIMIZATION_CAPABILITY_KINDS,
  EVOLUTION_OPTIMIZATION_CAPABILITY_STATUSES,
  EVOLUTION_OPTIMIZATION_DOMAIN_SCOPES,
  EVOLUTION_OPTIMIZATION_EVALUATION_MODES,
  EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_OPTIMIZATION_PROPOSAL_KINDS,
  EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES,
  EVOLUTION_OPTIMIZATION_READINESS_VERDICTS,
  PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
  PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_OPTIMIZATION_ID,
  PRODUCT_EVOLUTION_OPTIMIZATION_VERSION,
} from "./optimization.constants";

export type EvolutionOptimizationProposalKind =
  (typeof EVOLUTION_OPTIMIZATION_PROPOSAL_KINDS)[number];
export type EvolutionOptimizationProposalStatus =
  (typeof EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES)[number];
export type EvolutionOptimizationCapabilityKind =
  (typeof EVOLUTION_OPTIMIZATION_CAPABILITY_KINDS)[number];
export type EvolutionOptimizationCapabilityStatus =
  (typeof EVOLUTION_OPTIMIZATION_CAPABILITY_STATUSES)[number];
export type EvolutionOptimizationDomainScope =
  (typeof EVOLUTION_OPTIMIZATION_DOMAIN_SCOPES)[number];
export type EvolutionOptimizationEvaluationMode =
  (typeof EVOLUTION_OPTIMIZATION_EVALUATION_MODES)[number];
export type EvolutionOptimizationGovernancePolicyKind =
  (typeof EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_KINDS)[number];
export type EvolutionOptimizationGovernancePolicyStatus =
  (typeof EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_STATUSES)[number];
export type EvolutionOptimizationReadinessVerdict =
  (typeof EVOLUTION_OPTIMIZATION_READINESS_VERDICTS)[number];
export type EvolutionOptimizationMetadata = Record<string, unknown>;

/** Frozen optimization proposal definition (in-memory declaration). */
export type EvolutionOptimizationProposal = {
  id: string;
  proposalKey: string;
  kind: EvolutionOptimizationProposalKind;
  status: EvolutionOptimizationProposalStatus;
  scope: EvolutionOptimizationDomainScope;
  title: string;
  summary: string;
  learningRef: string;
  detail: string;
  metadata: EvolutionOptimizationMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionOptimizationProposalInput = {
  id?: string;
  proposalKey: string;
  kind: EvolutionOptimizationProposalKind;
  scope: EvolutionOptimizationDomainScope;
  title: string;
  summary: string;
  learningRef?: string;
  metadata?: EvolutionOptimizationMetadata;
};

export type UpdateEvolutionOptimizationProposalStatusInput = {
  proposalId: string;
  status: EvolutionOptimizationProposalStatus;
};

export type EvolutionOptimizationCapability = {
  id: string;
  proposalId: string;
  capabilityKey: string;
  kind: EvolutionOptimizationCapabilityKind;
  status: EvolutionOptimizationCapabilityStatus;
  summary: string;
  detail: string;
  metadata: EvolutionOptimizationMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionOptimizationCapabilityInput = {
  id?: string;
  proposalId: string;
  capabilityKey: string;
  kind: EvolutionOptimizationCapabilityKind;
  summary: string;
  metadata?: EvolutionOptimizationMetadata;
};

export type UpdateEvolutionOptimizationCapabilityStatusInput = {
  capabilityId: string;
  status: EvolutionOptimizationCapabilityStatus;
};

export type EvolutionOptimizationGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: EvolutionOptimizationGovernancePolicyKind;
  status: EvolutionOptimizationGovernancePolicyStatus;
  title: string;
  proposalKeyRef: string;
  ruleRef: string;
  detail: string;
  metadata: EvolutionOptimizationMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterEvolutionOptimizationGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: EvolutionOptimizationGovernancePolicyKind;
  title: string;
  proposalKeyRef: string;
  ruleRef: string;
  metadata?: EvolutionOptimizationMetadata;
};

export type EvolutionOptimizationEvaluationQuery = {
  queryKey: string;
  mode: EvolutionOptimizationEvaluationMode;
  kind?: EvolutionOptimizationProposalKind;
  capabilityKind?: EvolutionOptimizationCapabilityKind;
  scope?: EvolutionOptimizationDomainScope;
  proposalKeys?: string[];
};

export type EvolutionOptimizationEvaluationHit = {
  proposalId: string;
  proposalKey: string;
  kind: EvolutionOptimizationProposalKind;
  capabilityKey: string;
  matchedOn: "PROPOSAL" | "KIND" | "CAPABILITY" | "SCOPE";
};

/** Declarative evaluation contract — no execution / deployment / automation. */
export type EvolutionOptimizationEvaluationContract = {
  id: string;
  contractKey: string;
  query: EvolutionOptimizationEvaluationQuery;
  hitCount: number;
  hits: EvolutionOptimizationEvaluationHit[];
  detail: string;
  metadata: EvolutionOptimizationMetadata;
  evaluatedAt: string;
};

export type EvaluateEvolutionOptimizationEvaluationContractInput = {
  id?: string;
  contractKey: string;
  query: EvolutionOptimizationEvaluationQuery;
  metadata?: EvolutionOptimizationMetadata;
};

export type EvolutionOptimizationProposalValidationIssue = {
  field: string;
  message: string;
};

export type EvolutionOptimizationProposalValidationResult = {
  ok: boolean;
  issues: EvolutionOptimizationProposalValidationIssue[];
};

export type EvolutionOptimizationReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type EvolutionOptimizationReadinessResult = {
  verdict: EvolutionOptimizationReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: EvolutionOptimizationReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type EvolutionOptimizationManifest = {
  optimizationId: typeof PRODUCT_EVOLUTION_OPTIMIZATION_ID;
  version: typeof PRODUCT_EVOLUTION_OPTIMIZATION_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION;
  base: typeof PRODUCT_EVOLUTION_OPTIMIZATION_BASE;
  proposalCount: number;
  activeCount: number;
  capabilityCount: number;
  policyCount: number;
  contractCount: number;
  checksum: string;
  createdAt: string;
};
