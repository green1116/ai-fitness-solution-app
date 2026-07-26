/**
 * Product API Governance — policy types
 */

import type {
  GOVERNANCE_POLICY_KINDS,
  GOVERNANCE_POLICY_STATUSES,
} from "../management/management.constants";

export type GovernancePolicyKind = (typeof GOVERNANCE_POLICY_KINDS)[number];
export type GovernancePolicyStatus =
  (typeof GOVERNANCE_POLICY_STATUSES)[number];
export type GovernancePolicyMetadata = Record<string, unknown>;

export type GovernancePolicy = {
  id: string;
  policyKey: string;
  kind: GovernancePolicyKind;
  status: GovernancePolicyStatus;
  title: string;
  portalKeyRef: string;
  detail: string;
  metadata: GovernancePolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: GovernancePolicyKind;
  title: string;
  portalKeyRef: string;
  metadata?: GovernancePolicyMetadata;
};

export type UpdateGovernancePolicyStatusInput = {
  policyId: string;
  status: GovernancePolicyStatus;
};
