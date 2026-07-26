/**
 * Product Integration Governance — policy types
 */

import type {
  INTEGRATION_GOVERNANCE_POLICY_KINDS,
  INTEGRATION_GOVERNANCE_POLICY_STATUSES,
} from "../management/management.constants";

export type IntegrationGovernancePolicyKind =
  (typeof INTEGRATION_GOVERNANCE_POLICY_KINDS)[number];
export type IntegrationGovernancePolicyStatus =
  (typeof INTEGRATION_GOVERNANCE_POLICY_STATUSES)[number];
export type IntegrationGovernancePolicyMetadata = Record<string, unknown>;

export type IntegrationGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: IntegrationGovernancePolicyKind;
  status: IntegrationGovernancePolicyStatus;
  title: string;
  catalogKeyRef: string;
  detail: string;
  metadata: IntegrationGovernancePolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntegrationGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: IntegrationGovernancePolicyKind;
  title: string;
  catalogKeyRef: string;
  metadata?: IntegrationGovernancePolicyMetadata;
};

export type UpdateIntegrationGovernancePolicyStatusInput = {
  policyId: string;
  status: IntegrationGovernancePolicyStatus;
};
