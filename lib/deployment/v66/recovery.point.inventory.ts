/**
 * V66 P6 — Recovery point inventory (declarative catalog)
 */
import type { RecoveryPointEntry, RecoveryPointManifest } from "./dr.types";
import { V66_DEPLOYMENT_DR_VERSION } from "./dr.types";

export const RECOVERY_POINT_INVENTORY: RecoveryPointEntry[] = [
  {
    id: "RPI-001",
    label: "Database provider backup point",
    kind: "full",
    source: "PostgreSQL/Supabase automated backup",
    required: true,
    description: "Full database recovery point — operator-managed",
  },
  {
    id: "RPI-002",
    label: "Prisma baseline snapshot",
    kind: "snapshot",
    source: ".prisma-stability/snapshots/baseline.json",
    required: true,
    description: "Schema snapshot for drift recovery",
  },
  {
    id: "RPI-003",
    label: "Prisma migration history",
    kind: "incremental",
    source: "prisma/migrations/",
    required: true,
    description: "Migration chain for incremental schema recovery",
  },
  {
    id: "RPI-004",
    label: "Env contract catalog",
    kind: "config",
    source: "lib/deployment/v66/env.contract.ts",
    required: true,
    description: "P1 env variable contract",
  },
  {
    id: "RPI-005",
    label: "Release manifest layers",
    kind: "declarative",
    source: "lib/deployment/v66/release.manifest.ts",
    required: true,
    description: "P4 release layer catalog",
  },
  {
    id: "RPI-006",
    label: "Rollback guard rules",
    kind: "declarative",
    source: "lib/deployment/v66/rollback.guard.ts",
    required: true,
    description: "P4 rollback policy reference",
  },
  {
    id: "RPI-007",
    label: "Security policy catalog",
    kind: "declarative",
    source: "lib/deployment/v66/security.policy.catalog.ts",
    required: true,
    description: "P5 security policies",
  },
  {
    id: "RPI-008",
    label: "Dependency lockfile",
    kind: "config",
    source: "package-lock.json",
    required: true,
    description: "Reproducible dependency state",
  },
  {
    id: "RPI-009",
    label: "Prisma recovery instructions",
    kind: "declarative",
    source: "lib/prisma-stability/recovery/recovery.instructions.ts",
    required: true,
    description: "Frozen recovery runbook reference",
  },
  {
    id: "RPI-010",
    label: "V66 DR module catalog",
    kind: "declarative",
    source: "lib/deployment/v66/dr.ts",
    required: true,
    description: "P6 disaster recovery foundation",
  },
];

export function buildRecoveryPointManifest(): RecoveryPointManifest {
  const entries = RECOVERY_POINT_INVENTORY;
  const requiredCount = entries.filter((e) => e.required).length;
  const inventoryComplete = entries.length >= 8 && requiredCount >= 7;

  return {
    version: V66_DEPLOYMENT_DR_VERSION,
    pointCount: entries.length,
    requiredCount,
    inventoryComplete,
    entries,
    summary: [
      `recovery-points count=${entries.length}`,
      `required=${requiredCount}`,
      `complete=${inventoryComplete}`,
    ].join(" "),
  };
}

export function getRecoveryPointsByKind(
  kind: RecoveryPointEntry["kind"],
): RecoveryPointEntry[] {
  return RECOVERY_POINT_INVENTORY.filter((e) => e.kind === kind);
}
