/**
 * Launch L3 — Backup types + readiness / manifest
 */

import type {
  BACKUP_STATUSES,
  L3_MANAGER_STATUSES,
  L3_READINESS_VERDICTS,
  LAUNCH_L3_PRODUCTION_HARDENING_BASE,
  LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_ID,
  LAUNCH_L3_PRODUCTION_HARDENING_VERSION,
} from "../runtime/runtime.constants";

export type BackupStatus = (typeof BACKUP_STATUSES)[number];
export type L3ReadinessVerdict = (typeof L3_READINESS_VERDICTS)[number];
export type L3ManagerStatus = (typeof L3_MANAGER_STATUSES)[number];
export type BackupMetadata = Record<string, unknown>;

export type BackupSnapshot = {
  id: string;
  runtimeId: string;
  label: string;
  status: BackupStatus;
  sizeMb: number;
  detail: string;
  metadata: BackupMetadata;
  capturedAt: string;
};

export type CaptureBackupSnapshotInput = {
  id?: string;
  runtimeId: string;
  label: string;
  sizeMb: number;
  metadata?: BackupMetadata;
};

export type BackupRestore = {
  id: string;
  snapshotId: string;
  targetRuntimeId: string;
  status: BackupStatus;
  detail: string;
  restoredAt: string;
};

export type RestoreBackupInput = {
  id?: string;
  snapshotId: string;
  targetRuntimeId: string;
};

export type L3ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type L3ReadinessResult = {
  verdict: L3ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: L3ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type L3RegistryManifest = {
  foundationId: typeof LAUNCH_L3_PRODUCTION_HARDENING_ID;
  version: typeof LAUNCH_L3_PRODUCTION_HARDENING_VERSION;
  freezeVersion: typeof LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION;
  base: typeof LAUNCH_L3_PRODUCTION_HARDENING_BASE;
  runtimeCount: number;
  healthCount: number;
  policyCount: number;
  securityCheckCount: number;
  metricCount: number;
  alertCount: number;
  auditEventCount: number;
  trailCount: number;
  snapshotCount: number;
  restoreCount: number;
};
