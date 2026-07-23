/**
 * Commercialization P7 — Governance types
 */

import type {
  GOVERNANCE_MANAGER_STATUSES,
  GOVERNANCE_POLICY_STATUSES,
  GOVERNANCE_READINESS_VERDICTS,
  GOVERNANCE_SCOPES,
} from "./governance.constants";

export type GovernanceScope = (typeof GOVERNANCE_SCOPES)[number];
export type GovernancePolicyStatus =
  (typeof GOVERNANCE_POLICY_STATUSES)[number];
export type GovernanceReadinessVerdict =
  (typeof GOVERNANCE_READINESS_VERDICTS)[number];
export type GovernanceManagerStatus =
  (typeof GOVERNANCE_MANAGER_STATUSES)[number];
export type GovernanceMetadata = Record<string, unknown>;

export type GovernanceRecord = {
  id: string;
  name: string;
  scope: GovernanceScope;
  owner: string;
  detail: string;
  metadata: GovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterGovernanceInput = {
  id?: string;
  name: string;
  scope: GovernanceScope;
  owner: string;
  metadata?: GovernanceMetadata;
};

export type GovernancePolicy = {
  id: string;
  governanceId: string;
  title: string;
  status: GovernancePolicyStatus;
  threshold: number;
  detail: string;
  createdAt: string;
  updatedAt: string;
};

export type DefinePolicyInput = {
  id?: string;
  governanceId: string;
  title: string;
  status?: GovernancePolicyStatus;
  threshold: number;
};
