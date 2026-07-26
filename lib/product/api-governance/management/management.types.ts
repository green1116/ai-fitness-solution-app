/**
 * Product API Governance — readiness / manifest types
 */

import type {
  GOVERNANCE_MANAGER_STATUSES,
  GOVERNANCE_READINESS_VERDICTS,
  PRODUCT_API_GOVERNANCE_BASE,
  PRODUCT_API_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_API_GOVERNANCE_ID,
  PRODUCT_API_GOVERNANCE_VERSION,
} from "./management.constants";

export type GovernanceReadinessVerdict =
  (typeof GOVERNANCE_READINESS_VERDICTS)[number];
export type GovernanceManagerStatus =
  (typeof GOVERNANCE_MANAGER_STATUSES)[number];

export type GovernanceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type GovernanceReadinessResult = {
  verdict: GovernanceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: GovernanceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type GovernanceRegistryManifest = {
  governanceId: typeof PRODUCT_API_GOVERNANCE_ID;
  version: typeof PRODUCT_API_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_API_GOVERNANCE_FREEZE_VERSION;
  base: typeof PRODUCT_API_GOVERNANCE_BASE;
  policyCount: number;
  standardCount: number;
  reviewCount: number;
  complianceCount: number;
  releaseCount: number;
};
