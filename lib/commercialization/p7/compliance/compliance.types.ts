/**
 * Commercialization P7 — Compliance types + readiness / manifest
 */

import type {
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION,
  COMPLIANCE_VERDICTS,
  GOVERNANCE_MANAGER_STATUSES,
  GOVERNANCE_READINESS_VERDICTS,
} from "../governance/governance.constants";

export type ComplianceVerdict = (typeof COMPLIANCE_VERDICTS)[number];
export type GovernanceReadinessVerdict =
  (typeof GOVERNANCE_READINESS_VERDICTS)[number];
export type GovernanceManagerStatus =
  (typeof GOVERNANCE_MANAGER_STATUSES)[number];

export type ComplianceCheck = {
  id: string;
  name: string;
  component: string;
  ok: boolean;
  weight: number;
  detail: string;
  checkedAt: string;
};

export type RunComplianceCheckInput = {
  id?: string;
  name: string;
  component: string;
  ok: boolean;
  weight?: number;
};

export type ComplianceStatus = {
  id: string;
  verdict: ComplianceVerdict;
  score: number;
  checkCount: number;
  passCount: number;
  failCount: number;
  detail: string;
  evaluatedAt: string;
};

export type EvaluateComplianceStatusInput = {
  id?: string;
};

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
  foundationId: typeof COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID;
  version: typeof COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION;
  freezeVersion: typeof COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION;
  base: typeof COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE;
  governanceCount: number;
  policyCount: number;
  approvalCount: number;
  ruleCount: number;
  riskCount: number;
  controlCount: number;
  auditCount: number;
  trailCount: number;
  complianceCheckCount: number;
  complianceStatusCount: number;
};
