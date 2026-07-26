/**
 * Product Integration Governance — readiness / manifest types
 */

import type {
  INTEGRATION_GOVERNANCE_MANAGER_STATUSES,
  INTEGRATION_GOVERNANCE_READINESS_VERDICTS,
  PRODUCT_INTEGRATION_GOVERNANCE_BASE,
  PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTEGRATION_GOVERNANCE_ID,
  PRODUCT_INTEGRATION_GOVERNANCE_VERSION,
} from "./management.constants";

export type IntegrationGovernanceReadinessVerdict =
  (typeof INTEGRATION_GOVERNANCE_READINESS_VERDICTS)[number];
export type IntegrationGovernanceManagerStatus =
  (typeof INTEGRATION_GOVERNANCE_MANAGER_STATUSES)[number];

export type IntegrationGovernanceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IntegrationGovernanceReadinessResult = {
  verdict: IntegrationGovernanceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: IntegrationGovernanceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type IntegrationGovernanceRegistryManifest = {
  governanceId: typeof PRODUCT_INTEGRATION_GOVERNANCE_ID;
  version: typeof PRODUCT_INTEGRATION_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION;
  base: typeof PRODUCT_INTEGRATION_GOVERNANCE_BASE;
  policyCount: number;
  standardCount: number;
  reviewCount: number;
  complianceCount: number;
  releaseCount: number;
};
