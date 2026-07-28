/**
 * Product M12 — Agent Compatibility Runtime domain types
 */

import type {
  AGENT_COMPATIBILITY_BINDING_STATUSES,
  AGENT_COMPATIBILITY_CONSTRAINTS,
  AGENT_COMPATIBILITY_MATRIX_KINDS,
  AGENT_COMPATIBILITY_MATRIX_STATUSES,
  AGENT_COMPATIBILITY_PAIR_STATUSES,
  AGENT_COMPATIBILITY_READINESS_VERDICTS,
  AGENT_COMPATIBILITY_RELATIONS,
  PRODUCT_AGENT_COMPATIBILITY_BASE,
  PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_AGENT_COMPATIBILITY_ID,
  PRODUCT_AGENT_COMPATIBILITY_VERSION,
} from "./compatibility.constants";

export type AgentCompatibilityMatrixKind =
  (typeof AGENT_COMPATIBILITY_MATRIX_KINDS)[number];
export type AgentCompatibilityMatrixStatus =
  (typeof AGENT_COMPATIBILITY_MATRIX_STATUSES)[number];
export type AgentCompatibilityPairStatus =
  (typeof AGENT_COMPATIBILITY_PAIR_STATUSES)[number];
export type AgentCompatibilityRelation =
  (typeof AGENT_COMPATIBILITY_RELATIONS)[number];
export type AgentCompatibilityBindingStatus =
  (typeof AGENT_COMPATIBILITY_BINDING_STATUSES)[number];
export type AgentCompatibilityConstraint =
  (typeof AGENT_COMPATIBILITY_CONSTRAINTS)[number];
export type AgentCompatibilityReadinessVerdict =
  (typeof AGENT_COMPATIBILITY_READINESS_VERDICTS)[number];
export type AgentCompatibilityMetadata = Record<string, unknown>;

export type AgentCompatibilityMatrix = {
  id: string;
  matrixKey: string;
  kind: AgentCompatibilityMatrixKind;
  status: AgentCompatibilityMatrixStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: AgentCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentCompatibilityMatrixInput = {
  id?: string;
  matrixKey: string;
  kind: AgentCompatibilityMatrixKind;
  title: string;
  summary: string;
  metadata?: AgentCompatibilityMetadata;
};

export type UpdateAgentCompatibilityMatrixStatusInput = {
  matrixId: string;
  status: AgentCompatibilityMatrixStatus;
};

/** Version pair — soft-ref to policyKey. */
export type AgentCompatibilityPair = {
  id: string;
  matrixId: string;
  pairKey: string;
  sequence: number;
  status: AgentCompatibilityPairStatus;
  relation: AgentCompatibilityRelation;
  upstreamVersionRef: string;
  downstreamVersionRef: string;
  policyKeyRef: string;
  summary: string;
  detail: string;
  metadata: AgentCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentCompatibilityPairInput = {
  id?: string;
  matrixId: string;
  pairKey: string;
  sequence: number;
  relation: AgentCompatibilityRelation;
  upstreamVersionRef: string;
  downstreamVersionRef: string;
  policyKeyRef: string;
  summary: string;
  metadata?: AgentCompatibilityMetadata;
};

export type UpdateAgentCompatibilityPairStatusInput = {
  pairId: string;
  status: AgentCompatibilityPairStatus;
};

/** Soft binding of pair to compatibility constraint. */
export type AgentCompatibilityBinding = {
  id: string;
  matrixId: string;
  pairId: string;
  bindingKey: string;
  constraint: AgentCompatibilityConstraint;
  fallbackVersionRef: string;
  status: AgentCompatibilityBindingStatus;
  detail: string;
  metadata: AgentCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAgentCompatibilityPairInput = {
  id?: string;
  matrixId: string;
  pairId: string;
  bindingKey: string;
  constraint: AgentCompatibilityConstraint;
  fallbackVersionRef: string;
  metadata?: AgentCompatibilityMetadata;
};

export type AgentCompatibilityReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AgentCompatibilityReadinessResult = {
  verdict: AgentCompatibilityReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AgentCompatibilityReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AgentCompatibilityManifest = {
  compatibilityRuntimeId: typeof PRODUCT_AGENT_COMPATIBILITY_ID;
  version: typeof PRODUCT_AGENT_COMPATIBILITY_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION;
  base: typeof PRODUCT_AGENT_COMPATIBILITY_BASE;
  matrixCount: number;
  pairCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
