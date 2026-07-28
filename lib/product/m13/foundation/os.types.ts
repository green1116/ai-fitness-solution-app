/**
 * Product M13 — Enterprise Operating System Foundation domain types
 */

import type {
  OS_CAPABILITY_KINDS,
  OS_CAPABILITY_STATUSES,
  OS_DOMAIN_SCOPES,
  OS_GOVERNANCE_POLICY_KINDS,
  OS_GOVERNANCE_POLICY_STATUSES,
  OS_OPERATION_MODES,
  OS_READINESS_VERDICTS,
  OS_SURFACE_KINDS,
  OS_SURFACE_STATUSES,
  PRODUCT_OS_FOUNDATION_BASE,
  PRODUCT_OS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_OS_FOUNDATION_ID,
  PRODUCT_OS_FOUNDATION_VERSION,
} from "./os.constants";

export type OsSurfaceKind = (typeof OS_SURFACE_KINDS)[number];
export type OsSurfaceStatus = (typeof OS_SURFACE_STATUSES)[number];
export type OsCapabilityKind = (typeof OS_CAPABILITY_KINDS)[number];
export type OsCapabilityStatus = (typeof OS_CAPABILITY_STATUSES)[number];
export type OsDomainScope = (typeof OS_DOMAIN_SCOPES)[number];
export type OsOperationMode = (typeof OS_OPERATION_MODES)[number];
export type OsGovernancePolicyKind =
  (typeof OS_GOVERNANCE_POLICY_KINDS)[number];
export type OsGovernancePolicyStatus =
  (typeof OS_GOVERNANCE_POLICY_STATUSES)[number];
export type OsReadinessVerdict = (typeof OS_READINESS_VERDICTS)[number];
export type OsMetadata = Record<string, unknown>;

/** Frozen operating surface definition (in-memory declaration). */
export type OsSurface = {
  id: string;
  surfaceKey: string;
  kind: OsSurfaceKind;
  status: OsSurfaceStatus;
  scope: OsDomainScope;
  title: string;
  summary: string;
  agentBaselineRef: string;
  detail: string;
  metadata: OsMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsSurfaceInput = {
  id?: string;
  surfaceKey: string;
  kind: OsSurfaceKind;
  scope: OsDomainScope;
  title: string;
  summary: string;
  agentBaselineRef?: string;
  metadata?: OsMetadata;
};

export type UpdateOsSurfaceStatusInput = {
  surfaceId: string;
  status: OsSurfaceStatus;
};

export type OsCapability = {
  id: string;
  surfaceId: string;
  capabilityKey: string;
  kind: OsCapabilityKind;
  status: OsCapabilityStatus;
  summary: string;
  detail: string;
  metadata: OsMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsCapabilityInput = {
  id?: string;
  surfaceId: string;
  capabilityKey: string;
  kind: OsCapabilityKind;
  summary: string;
  metadata?: OsMetadata;
};

export type UpdateOsCapabilityStatusInput = {
  capabilityId: string;
  status: OsCapabilityStatus;
};

export type OsGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: OsGovernancePolicyKind;
  status: OsGovernancePolicyStatus;
  title: string;
  surfaceKeyRef: string;
  ruleRef: string;
  detail: string;
  metadata: OsMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: OsGovernancePolicyKind;
  title: string;
  surfaceKeyRef: string;
  ruleRef: string;
  metadata?: OsMetadata;
};

export type OsOperationQuery = {
  queryKey: string;
  mode: OsOperationMode;
  kind?: OsSurfaceKind;
  capabilityKind?: OsCapabilityKind;
  scope?: OsDomainScope;
  surfaceKeys?: string[];
};

export type OsOperationHit = {
  surfaceId: string;
  surfaceKey: string;
  kind: OsSurfaceKind;
  capabilityKey: string;
  matchedOn: "SURFACE" | "KIND" | "CAPABILITY" | "SCOPE";
};

/** Declarative operation contract — no OS execution. */
export type OsOperationContract = {
  id: string;
  contractKey: string;
  query: OsOperationQuery;
  hitCount: number;
  hits: OsOperationHit[];
  detail: string;
  metadata: OsMetadata;
  evaluatedAt: string;
};

export type EvaluateOsOperationContractInput = {
  id?: string;
  contractKey: string;
  query: OsOperationQuery;
  metadata?: OsMetadata;
};

export type OsSurfaceValidationIssue = {
  field: string;
  message: string;
};

export type OsSurfaceValidationResult = {
  ok: boolean;
  issues: OsSurfaceValidationIssue[];
};

export type OsReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OsReadinessResult = {
  verdict: OsReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OsReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OsFoundationManifest = {
  foundationId: typeof PRODUCT_OS_FOUNDATION_ID;
  version: typeof PRODUCT_OS_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_OS_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_OS_FOUNDATION_BASE;
  surfaceCount: number;
  activeCount: number;
  capabilityCount: number;
  policyCount: number;
  contractCount: number;
  checksum: string;
  createdAt: string;
};
