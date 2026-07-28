/**
 * Product M11 — Knowledge Compatibility Runtime domain types
 */

import type {
  KNOWLEDGE_COMPATIBILITY_BINDING_STATUSES,
  KNOWLEDGE_COMPATIBILITY_CONSTRAINTS,
  KNOWLEDGE_COMPATIBILITY_MATRIX_KINDS,
  KNOWLEDGE_COMPATIBILITY_MATRIX_STATUSES,
  KNOWLEDGE_COMPATIBILITY_PAIR_STATUSES,
  KNOWLEDGE_COMPATIBILITY_READINESS_VERDICTS,
  KNOWLEDGE_COMPATIBILITY_RELATIONS,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION,
} from "./compatibility.constants";

export type KnowledgeCompatibilityMatrixKind =
  (typeof KNOWLEDGE_COMPATIBILITY_MATRIX_KINDS)[number];
export type KnowledgeCompatibilityMatrixStatus =
  (typeof KNOWLEDGE_COMPATIBILITY_MATRIX_STATUSES)[number];
export type KnowledgeCompatibilityPairStatus =
  (typeof KNOWLEDGE_COMPATIBILITY_PAIR_STATUSES)[number];
export type KnowledgeCompatibilityRelation =
  (typeof KNOWLEDGE_COMPATIBILITY_RELATIONS)[number];
export type KnowledgeCompatibilityBindingStatus =
  (typeof KNOWLEDGE_COMPATIBILITY_BINDING_STATUSES)[number];
export type KnowledgeCompatibilityConstraint =
  (typeof KNOWLEDGE_COMPATIBILITY_CONSTRAINTS)[number];
export type KnowledgeCompatibilityReadinessVerdict =
  (typeof KNOWLEDGE_COMPATIBILITY_READINESS_VERDICTS)[number];
export type KnowledgeCompatibilityMetadata = Record<string, unknown>;

export type KnowledgeCompatibilityMatrix = {
  id: string;
  matrixKey: string;
  kind: KnowledgeCompatibilityMatrixKind;
  status: KnowledgeCompatibilityMatrixStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: KnowledgeCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeCompatibilityMatrixInput = {
  id?: string;
  matrixKey: string;
  kind: KnowledgeCompatibilityMatrixKind;
  title: string;
  summary: string;
  metadata?: KnowledgeCompatibilityMetadata;
};

export type UpdateKnowledgeCompatibilityMatrixStatusInput = {
  matrixId: string;
  status: KnowledgeCompatibilityMatrixStatus;
};

/** Version pair — soft-ref to policyKey. */
export type KnowledgeCompatibilityPair = {
  id: string;
  matrixId: string;
  pairKey: string;
  sequence: number;
  status: KnowledgeCompatibilityPairStatus;
  relation: KnowledgeCompatibilityRelation;
  upstreamVersionRef: string;
  downstreamVersionRef: string;
  policyKeyRef: string;
  summary: string;
  detail: string;
  metadata: KnowledgeCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeCompatibilityPairInput = {
  id?: string;
  matrixId: string;
  pairKey: string;
  sequence: number;
  relation: KnowledgeCompatibilityRelation;
  upstreamVersionRef: string;
  downstreamVersionRef: string;
  policyKeyRef: string;
  summary: string;
  metadata?: KnowledgeCompatibilityMetadata;
};

export type UpdateKnowledgeCompatibilityPairStatusInput = {
  pairId: string;
  status: KnowledgeCompatibilityPairStatus;
};

/** Soft binding of pair to compatibility constraint. */
export type KnowledgeCompatibilityBinding = {
  id: string;
  matrixId: string;
  pairId: string;
  bindingKey: string;
  constraint: KnowledgeCompatibilityConstraint;
  fallbackVersionRef: string;
  status: KnowledgeCompatibilityBindingStatus;
  detail: string;
  metadata: KnowledgeCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindKnowledgeCompatibilityPairInput = {
  id?: string;
  matrixId: string;
  pairId: string;
  bindingKey: string;
  constraint: KnowledgeCompatibilityConstraint;
  fallbackVersionRef: string;
  metadata?: KnowledgeCompatibilityMetadata;
};

export type KnowledgeCompatibilityReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type KnowledgeCompatibilityReadinessResult = {
  verdict: KnowledgeCompatibilityReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: KnowledgeCompatibilityReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type KnowledgeCompatibilityManifest = {
  compatibilityRuntimeId: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_ID;
  version: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION;
  base: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE;
  matrixCount: number;
  pairCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
