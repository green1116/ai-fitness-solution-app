/**
 * Product Integration Governance — compliance types (assessment record only)
 */

import type { INTEGRATION_GOVERNANCE_COMPLIANCE_VERDICTS } from "../management/management.constants";

export type IntegrationGovernanceComplianceVerdict =
  (typeof INTEGRATION_GOVERNANCE_COMPLIANCE_VERDICTS)[number];
export type IntegrationGovernanceComplianceMetadata = Record<string, unknown>;

export type IntegrationGovernanceCompliance = {
  id: string;
  policyId: string;
  reviewId: string;
  complianceKey: string;
  verdict: IntegrationGovernanceComplianceVerdict;
  detail: string;
  metadata: IntegrationGovernanceComplianceMetadata;
  createdAt: string;
};

export type RecordIntegrationGovernanceComplianceInput = {
  id?: string;
  policyId: string;
  reviewId: string;
  complianceKey: string;
  verdict: IntegrationGovernanceComplianceVerdict;
  metadata?: IntegrationGovernanceComplianceMetadata;
};
