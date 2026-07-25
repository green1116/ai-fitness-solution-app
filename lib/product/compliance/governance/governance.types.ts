/**
 * Product Compliance — readiness / manifest types
 */

import type {
  COMPLIANCE_MANAGER_STATUSES,
  COMPLIANCE_READINESS_VERDICTS,
  PRODUCT_COMPLIANCE_GOVERNANCE_BASE,
  PRODUCT_COMPLIANCE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_COMPLIANCE_GOVERNANCE_ID,
  PRODUCT_COMPLIANCE_GOVERNANCE_VERSION,
} from "./governance.constants";

export type ComplianceReadinessVerdict =
  (typeof COMPLIANCE_READINESS_VERDICTS)[number];
export type ComplianceManagerStatus =
  (typeof COMPLIANCE_MANAGER_STATUSES)[number];

export type ComplianceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ComplianceReadinessResult = {
  verdict: ComplianceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: ComplianceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type ComplianceRegistryManifest = {
  governanceId: typeof PRODUCT_COMPLIANCE_GOVERNANCE_ID;
  version: typeof PRODUCT_COMPLIANCE_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_COMPLIANCE_GOVERNANCE_FREEZE_VERSION;
  base: typeof PRODUCT_COMPLIANCE_GOVERNANCE_BASE;
  frameworkCount: number;
  controlCount: number;
  evidenceCount: number;
  assessmentCount: number;
};
