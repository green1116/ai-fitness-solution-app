/**
 * Product Integration Governance — review types (record only, no runtime workflow)
 */

import type { INTEGRATION_GOVERNANCE_REVIEW_VERDICTS } from "../management/management.constants";

export type IntegrationGovernanceReviewVerdict =
  (typeof INTEGRATION_GOVERNANCE_REVIEW_VERDICTS)[number];
export type IntegrationGovernanceReviewMetadata = Record<string, unknown>;

export type IntegrationGovernanceReview = {
  id: string;
  policyId: string;
  standardId: string;
  reviewKey: string;
  subjectRef: string;
  verdict: IntegrationGovernanceReviewVerdict;
  detail: string;
  metadata: IntegrationGovernanceReviewMetadata;
  createdAt: string;
};

export type RecordIntegrationGovernanceReviewInput = {
  id?: string;
  policyId: string;
  standardId: string;
  reviewKey: string;
  subjectRef: string;
  verdict: IntegrationGovernanceReviewVerdict;
  metadata?: IntegrationGovernanceReviewMetadata;
};
