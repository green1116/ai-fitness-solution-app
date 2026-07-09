/**
 * V66 P6 — Backup & disaster recovery types (read-only)
 */

export const V66_DEPLOYMENT_DR_VERSION = "v66-deployment-dr-1" as const;

export type BackupPolicySeverity = "critical" | "high" | "medium" | "low";

export type BackupTargetKind =
  | "database"
  | "schema-snapshot"
  | "config"
  | "lockfile"
  | "deployment-artifact"
  | "verify-state";

export type RestoreChecklistStatus = "pass" | "fail" | "warn" | "na";

export type RetentionTier = "hot" | "warm" | "cold" | "archive";

export type RecoveryPointKind = "full" | "incremental" | "snapshot" | "config" | "declarative";

export type DeploymentDrSignals = {
  securityReady?: boolean;
  backupPolicyCatalogComplete?: boolean;
  restoreChecklistPass?: boolean;
  retentionMatrixComplete?: boolean;
  recoveryPointInventoryComplete?: boolean;
};

export type BackupPolicyDefinition = {
  id: string;
  label: string;
  target: BackupTargetKind;
  severity: BackupPolicySeverity;
  required: boolean;
  frequency: string;
  retentionRef: string;
  control: string;
  notes?: string;
};

export type BackupPolicyManifest = {
  version: typeof V66_DEPLOYMENT_DR_VERSION;
  policyCount: number;
  targetCount: number;
  catalogComplete: boolean;
  policies: BackupPolicyDefinition[];
  summary: string;
};

export type RestoreChecklistItem = {
  id: string;
  label: string;
  status: RestoreChecklistStatus;
  required: boolean;
  phase: "prepare" | "restore" | "validate" | "cutover";
  notes?: string;
};

export type RestoreChecklistManifest = {
  version: typeof V66_DEPLOYMENT_DR_VERSION;
  itemCount: number;
  passCount: number;
  checklistPass: boolean;
  items: RestoreChecklistItem[];
  summary: string;
};

export type RetentionMatrixEntry = {
  id: string;
  asset: string;
  tier: RetentionTier;
  duration: string;
  rpo: string;
  rto: string;
  required: boolean;
};

export type RetentionMatrixManifest = {
  version: typeof V66_DEPLOYMENT_DR_VERSION;
  entryCount: number;
  tierCount: number;
  matrixComplete: boolean;
  entries: RetentionMatrixEntry[];
  summary: string;
};

export type RecoveryPointEntry = {
  id: string;
  label: string;
  kind: RecoveryPointKind;
  source: string;
  required: boolean;
  description: string;
};

export type RecoveryPointManifest = {
  version: typeof V66_DEPLOYMENT_DR_VERSION;
  pointCount: number;
  requiredCount: number;
  inventoryComplete: boolean;
  entries: RecoveryPointEntry[];
  summary: string;
};

export type DeploymentDrReport = {
  version: typeof V66_DEPLOYMENT_DR_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  securityVersion: string;
  securityReady: boolean;
  backupPolicies: BackupPolicyManifest;
  restoreChecklist: RestoreChecklistManifest;
  retentionMatrix: RetentionMatrixManifest;
  recoveryPoints: RecoveryPointManifest;
  drReady: boolean;
  readinessScore: number;
  summary: string;
};
