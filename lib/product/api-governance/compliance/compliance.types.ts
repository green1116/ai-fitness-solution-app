/**
 * Product API Governance — compliance types (assessment record only)
 */

import type { GOVERNANCE_COMPLIANCE_VERDICTS } from "../management/management.constants";

export type GovernanceComplianceVerdict =
  (typeof GOVERNANCE_COMPLIANCE_VERDICTS)[number];
export type GovernanceComplianceMetadata = Record<string, unknown>;

export type GovernanceCompliance = {
  id: string;
  policyId: string;
  reviewId: string;
  complianceKey: string;
  verdict: GovernanceComplianceVerdict;
  detail: string;
  metadata: GovernanceComplianceMetadata;
  createdAt: string;
};

export type RecordGovernanceComplianceInput = {
  id?: string;
  policyId: string;
  reviewId: string;
  complianceKey: string;
  verdict: GovernanceComplianceVerdict;
  metadata?: GovernanceComplianceMetadata;
};
