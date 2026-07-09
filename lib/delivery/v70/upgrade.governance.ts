/**
 * V70 P5 — Upgrade governance types (read-only)
 */

export const V70_UPGRADE_GOVERNANCE_VERSION = "v70-upgrade-governance-1" as const;
export const V70_UPGRADE_GOVERNANCE_FREEZE_VERSION = "v70-upgrade-governance-freeze-1" as const;

export type UpgradeRiskLevel = "low" | "medium" | "high" | "critical";

export type UpgradeApprovalStatus = "required" | "approved" | "waived" | "rejected";

export type UpgradePath = {
  id: string;
  fromReleaseRef: string;
  toReleaseRef: string;
  fromVersion: string;
  toVersion: string;
  order: number;
  required: boolean;
  description: string;
};

export type UpgradePathManifest = {
  version: typeof V70_UPGRADE_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  paths: UpgradePath[];
  summary: string;
};

export type PreCheck = {
  id: string;
  upgradePlanRef: string;
  checkKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type PreCheckManifest = {
  version: typeof V70_UPGRADE_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  checks: PreCheck[];
  summary: string;
};

export type PostCheck = {
  id: string;
  upgradePlanRef: string;
  checkKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type PostCheckManifest = {
  version: typeof V70_UPGRADE_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  checks: PostCheck[];
  summary: string;
};

export type RollbackPlan = {
  id: string;
  upgradePlanRef: string;
  rollbackTarget: string;
  triggerCondition: string;
  required: boolean;
  description: string;
};

export type RollbackPlanManifest = {
  version: typeof V70_UPGRADE_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  plans: RollbackPlan[];
  summary: string;
};

export type UpgradePlan = {
  id: string;
  releaseRef: string;
  upgradePath: string;
  preCheck: string;
  postCheck: string;
  rollbackPlan: string;
  compatibilityCheck: string;
  approval: UpgradeApprovalStatus;
  riskLevel: UpgradeRiskLevel;
  maintenanceWindow: string;
  successCriteria: string;
  required: boolean;
  description: string;
};

export type UpgradePlanManifest = {
  version: typeof V70_UPGRADE_GOVERNANCE_VERSION;
  planCount: number;
  riskLevelCount: number;
  catalogComplete: boolean;
  plans: UpgradePlan[];
  summary: string;
};

export type UpgradeGovernanceSignals = {
  versionCompatibilityReady?: boolean;
  pathsComplete?: boolean;
  plansComplete?: boolean;
  preChecksComplete?: boolean;
  postChecksComplete?: boolean;
  rollbackPlansComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type UpgradeGovernanceReport = {
  version: typeof V70_UPGRADE_GOVERNANCE_VERSION;
  freezeVersion: typeof V70_UPGRADE_GOVERNANCE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  versionCompatibilityVersion: string;
  versionCompatibilityReady: boolean;
  paths: UpgradePathManifest;
  plans: UpgradePlanManifest;
  preChecks: PreCheckManifest;
  postChecks: PostCheckManifest;
  rollbackPlans: RollbackPlanManifest;
  governanceReady: boolean;
  readinessScore: number;
  summary: string;
};
