/**
 * Product M14 — Intelligence Compatibility Runtime domain types
 */

import type {
  INTELLIGENCE_COMPATIBILITY_BINDING_STATUSES,
  INTELLIGENCE_COMPATIBILITY_CONSTRAINTS,
  INTELLIGENCE_COMPATIBILITY_MATRIX_KINDS,
  INTELLIGENCE_COMPATIBILITY_MATRIX_STATUSES,
  INTELLIGENCE_COMPATIBILITY_PAIR_STATUSES,
  INTELLIGENCE_COMPATIBILITY_READINESS_VERDICTS,
  INTELLIGENCE_COMPATIBILITY_RELATIONS,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_ID,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION,
} from "./compatibility.constants";

export type IntelligenceCompatibilityMatrixKind =
  (typeof INTELLIGENCE_COMPATIBILITY_MATRIX_KINDS)[number];
export type IntelligenceCompatibilityMatrixStatus =
  (typeof INTELLIGENCE_COMPATIBILITY_MATRIX_STATUSES)[number];
export type IntelligenceCompatibilityPairStatus =
  (typeof INTELLIGENCE_COMPATIBILITY_PAIR_STATUSES)[number];
export type IntelligenceCompatibilityRelation =
  (typeof INTELLIGENCE_COMPATIBILITY_RELATIONS)[number];
export type IntelligenceCompatibilityBindingStatus =
  (typeof INTELLIGENCE_COMPATIBILITY_BINDING_STATUSES)[number];
export type IntelligenceCompatibilityConstraint =
  (typeof INTELLIGENCE_COMPATIBILITY_CONSTRAINTS)[number];
export type IntelligenceCompatibilityReadinessVerdict =
  (typeof INTELLIGENCE_COMPATIBILITY_READINESS_VERDICTS)[number];
export type IntelligenceCompatibilityMetadata = Record<string, unknown>;

export type IntelligenceCompatibilityMatrix = {
  id: string;
  matrixKey: string;
  kind: IntelligenceCompatibilityMatrixKind;
  status: IntelligenceCompatibilityMatrixStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: IntelligenceCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceCompatibilityMatrixInput = {
  id?: string;
  matrixKey: string;
  kind: IntelligenceCompatibilityMatrixKind;
  title: string;
  summary: string;
  metadata?: IntelligenceCompatibilityMetadata;
};

export type UpdateIntelligenceCompatibilityMatrixStatusInput = {
  matrixId: string;
  status: IntelligenceCompatibilityMatrixStatus;
};

/** Version pair — soft-ref to policyKey. */
export type IntelligenceCompatibilityPair = {
  id: string;
  matrixId: string;
  pairKey: string;
  sequence: number;
  status: IntelligenceCompatibilityPairStatus;
  relation: IntelligenceCompatibilityRelation;
  upstreamVersionRef: string;
  downstreamVersionRef: string;
  policyKeyRef: string;
  summary: string;
  detail: string;
  metadata: IntelligenceCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceCompatibilityPairInput = {
  id?: string;
  matrixId: string;
  pairKey: string;
  sequence: number;
  relation: IntelligenceCompatibilityRelation;
  upstreamVersionRef: string;
  downstreamVersionRef: string;
  policyKeyRef: string;
  summary: string;
  metadata?: IntelligenceCompatibilityMetadata;
};

export type UpdateIntelligenceCompatibilityPairStatusInput = {
  pairId: string;
  status: IntelligenceCompatibilityPairStatus;
};

/** Soft binding of pair to compatibility constraint. */
export type IntelligenceCompatibilityBinding = {
  id: string;
  matrixId: string;
  pairId: string;
  bindingKey: string;
  constraint: IntelligenceCompatibilityConstraint;
  fallbackVersionRef: string;
  status: IntelligenceCompatibilityBindingStatus;
  detail: string;
  metadata: IntelligenceCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindIntelligenceCompatibilityPairInput = {
  id?: string;
  matrixId: string;
  pairId: string;
  bindingKey: string;
  constraint: IntelligenceCompatibilityConstraint;
  fallbackVersionRef: string;
  metadata?: IntelligenceCompatibilityMetadata;
};

export type IntelligenceCompatibilityReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IntelligenceCompatibilityReadinessResult = {
  verdict: IntelligenceCompatibilityReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: IntelligenceCompatibilityReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type IntelligenceCompatibilityManifest = {
  compatibilityRuntimeId: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_ID;
  version: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION;
  base: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE;
  matrixCount: number;
  pairCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
