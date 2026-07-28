/**
 * Product M13 — OS Compatibility Runtime domain types
 */

import type {
  OS_COMPATIBILITY_BINDING_STATUSES,
  OS_COMPATIBILITY_CONSTRAINTS,
  OS_COMPATIBILITY_MATRIX_KINDS,
  OS_COMPATIBILITY_MATRIX_STATUSES,
  OS_COMPATIBILITY_PAIR_STATUSES,
  OS_COMPATIBILITY_READINESS_VERDICTS,
  OS_COMPATIBILITY_RELATIONS,
  PRODUCT_OS_COMPATIBILITY_BASE,
  PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_OS_COMPATIBILITY_ID,
  PRODUCT_OS_COMPATIBILITY_VERSION,
} from "./compatibility.constants";

export type OsCompatibilityMatrixKind =
  (typeof OS_COMPATIBILITY_MATRIX_KINDS)[number];
export type OsCompatibilityMatrixStatus =
  (typeof OS_COMPATIBILITY_MATRIX_STATUSES)[number];
export type OsCompatibilityPairStatus =
  (typeof OS_COMPATIBILITY_PAIR_STATUSES)[number];
export type OsCompatibilityRelation =
  (typeof OS_COMPATIBILITY_RELATIONS)[number];
export type OsCompatibilityBindingStatus =
  (typeof OS_COMPATIBILITY_BINDING_STATUSES)[number];
export type OsCompatibilityConstraint =
  (typeof OS_COMPATIBILITY_CONSTRAINTS)[number];
export type OsCompatibilityReadinessVerdict =
  (typeof OS_COMPATIBILITY_READINESS_VERDICTS)[number];
export type OsCompatibilityMetadata = Record<string, unknown>;

export type OsCompatibilityMatrix = {
  id: string;
  matrixKey: string;
  kind: OsCompatibilityMatrixKind;
  status: OsCompatibilityMatrixStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: OsCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsCompatibilityMatrixInput = {
  id?: string;
  matrixKey: string;
  kind: OsCompatibilityMatrixKind;
  title: string;
  summary: string;
  metadata?: OsCompatibilityMetadata;
};

export type UpdateOsCompatibilityMatrixStatusInput = {
  matrixId: string;
  status: OsCompatibilityMatrixStatus;
};

/** Version pair — soft-ref to policyKey. */
export type OsCompatibilityPair = {
  id: string;
  matrixId: string;
  pairKey: string;
  sequence: number;
  status: OsCompatibilityPairStatus;
  relation: OsCompatibilityRelation;
  upstreamVersionRef: string;
  downstreamVersionRef: string;
  policyKeyRef: string;
  summary: string;
  detail: string;
  metadata: OsCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsCompatibilityPairInput = {
  id?: string;
  matrixId: string;
  pairKey: string;
  sequence: number;
  relation: OsCompatibilityRelation;
  upstreamVersionRef: string;
  downstreamVersionRef: string;
  policyKeyRef: string;
  summary: string;
  metadata?: OsCompatibilityMetadata;
};

export type UpdateOsCompatibilityPairStatusInput = {
  pairId: string;
  status: OsCompatibilityPairStatus;
};

/** Soft binding of pair to compatibility constraint. */
export type OsCompatibilityBinding = {
  id: string;
  matrixId: string;
  pairId: string;
  bindingKey: string;
  constraint: OsCompatibilityConstraint;
  fallbackVersionRef: string;
  status: OsCompatibilityBindingStatus;
  detail: string;
  metadata: OsCompatibilityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindOsCompatibilityPairInput = {
  id?: string;
  matrixId: string;
  pairId: string;
  bindingKey: string;
  constraint: OsCompatibilityConstraint;
  fallbackVersionRef: string;
  metadata?: OsCompatibilityMetadata;
};

export type OsCompatibilityReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OsCompatibilityReadinessResult = {
  verdict: OsCompatibilityReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OsCompatibilityReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OsCompatibilityManifest = {
  compatibilityRuntimeId: typeof PRODUCT_OS_COMPATIBILITY_ID;
  version: typeof PRODUCT_OS_COMPATIBILITY_VERSION;
  freezeVersion: typeof PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION;
  base: typeof PRODUCT_OS_COMPATIBILITY_BASE;
  matrixCount: number;
  pairCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
