/**
 * V66 P6 — Backup policy catalog (declarative inventory)
 */
import type { BackupPolicyDefinition, BackupPolicyManifest } from "./dr.types";
import { V66_DEPLOYMENT_DR_VERSION } from "./dr.types";

export const BACKUP_POLICY_CATALOG: BackupPolicyDefinition[] = [
  {
    id: "BP-001",
    label: "PostgreSQL database full backup",
    target: "database",
    severity: "critical",
    required: true,
    frequency: "daily",
    retentionRef: "RET-001",
    control: "Supabase/PostgreSQL provider backup — declarative policy only",
    notes: "No backup execution in V66 P6",
  },
  {
    id: "BP-002",
    label: "Prisma schema snapshot baseline",
    target: "schema-snapshot",
    severity: "critical",
    required: true,
    frequency: "on-change",
    retentionRef: "RET-002",
    control: ".prisma-stability/snapshots/baseline.json",
    notes: "npm run prisma:snapshot",
  },
  {
    id: "BP-003",
    label: "Migration rollback plan awareness",
    target: "schema-snapshot",
    severity: "high",
    required: true,
    frequency: "per-migration",
    retentionRef: "RET-002",
    control: "lib/prisma-stability/migration/migration.rollback.plan.ts",
    notes: "Frozen reference; no runtime invocation in P6",
  },
  {
    id: "BP-004",
    label: "Environment config template backup",
    target: "config",
    severity: "high",
    required: true,
    frequency: "on-change",
    retentionRef: "RET-003",
    control: ".env.example",
    notes: "Secrets excluded; template only",
  },
  {
    id: "BP-005",
    label: "Dependency lockfile integrity",
    target: "lockfile",
    severity: "high",
    required: true,
    frequency: "on-change",
    retentionRef: "RET-004",
    control: "package-lock.json",
  },
  {
    id: "BP-006",
    label: "V66 deployment module catalog",
    target: "deployment-artifact",
    severity: "medium",
    required: true,
    frequency: "per-release",
    retentionRef: "RET-005",
    control: "lib/deployment/v66/",
  },
  {
    id: "BP-007",
    label: "Deployment verify state checkpoint",
    target: "verify-state",
    severity: "medium",
    required: true,
    frequency: "per-deploy",
    retentionRef: "RET-005",
    control: "npm run verify:v66-deployment",
  },
  {
    id: "BP-008",
    label: "Structured deployment log retention",
    target: "deployment-artifact",
    severity: "medium",
    required: false,
    frequency: "continuous",
    retentionRef: "RET-006",
    control: "lib/deployment/v66/deployment.log.formatter.ts",
    notes: "P3 observability log schema",
  },
  {
    id: "BP-009",
    label: "Rollback guard policy snapshot",
    target: "deployment-artifact",
    severity: "high",
    required: true,
    frequency: "per-release",
    retentionRef: "RET-005",
    control: "lib/deployment/v66/rollback.guard.ts",
  },
  {
    id: "BP-010",
    label: "Recovery instructions reference",
    target: "schema-snapshot",
    severity: "high",
    required: true,
    frequency: "on-change",
    retentionRef: "RET-002",
    control: "lib/prisma-stability/recovery/recovery.instructions.ts",
    notes: "Frozen Prisma stability layer reference",
  },
];

export function buildBackupPolicyManifest(): BackupPolicyManifest {
  const policies = BACKUP_POLICY_CATALOG;
  const targets = new Set(policies.map((p) => p.target));
  const catalogComplete = policies.length >= 8 && targets.size >= 5;

  return {
    version: V66_DEPLOYMENT_DR_VERSION,
    policyCount: policies.length,
    targetCount: targets.size,
    catalogComplete,
    policies,
    summary: [
      `backup-policies count=${policies.length}`,
      `targets=${targets.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}
