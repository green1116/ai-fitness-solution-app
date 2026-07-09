/**
 * V66 P7 — Deployment automation catalog (declarative inventory)
 */
import type { AutomationCatalogEntry, AutomationCatalogManifest } from "./ops.types";
import { V66_DEPLOYMENT_OPS_VERSION } from "./ops.types";

export const DEPLOYMENT_AUTOMATION_CATALOG: AutomationCatalogEntry[] = [
  {
    id: "DA-001",
    label: "V66 full deployment verify chain",
    kind: "verify",
    command: "npm run verify:v66-deployment",
    required: true,
    phase: "pre-deploy",
    description: "P1–P6 declarative verify gates",
  },
  {
    id: "DA-002",
    label: "Prisma preflight gate",
    kind: "prisma",
    command: "npm run prisma:preflight",
    required: true,
    phase: "pre-deploy",
    description: "Schema drift and migration safety",
  },
  {
    id: "DA-003",
    label: "Production build pipeline",
    kind: "build",
    command: "npm run build",
    required: true,
    phase: "deploy",
    description: "Build with prisma gates and heap config",
  },
  {
    id: "DA-004",
    label: "Prisma migrate deploy",
    kind: "prisma",
    command: "npm run prisma:migrate:deploy",
    required: true,
    phase: "deploy",
    description: "Apply pending migrations — operator-triggered only",
  },
  {
    id: "DA-005",
    label: "V65 upstream production gate",
    kind: "verify",
    command: "npm run verify:v65-production",
    required: true,
    phase: "pre-deploy",
    description: "Frozen upstream production readiness",
  },
  {
    id: "DA-006",
    label: "Production env audit",
    kind: "env-audit",
    command: "npm run v92:env-audit",
    required: false,
    phase: "pre-deploy",
    description: "Optional live env validation",
  },
  {
    id: "DA-007",
    label: "P7 ops automation verify",
    kind: "verify",
    command: "npm run verify:v66-p7-deployment-ops",
    required: true,
    phase: "post-deploy",
    description: "Ops runbook layer verify gate",
  },
  {
    id: "DA-008",
    label: "TypeScript clean check",
    kind: "verify",
    command: "npx tsc --noEmit",
    required: true,
    phase: "pre-deploy",
    description: "Type safety gate before deploy",
  },
  {
    id: "DA-009",
    label: "Rollback guard reference",
    kind: "declarative",
    command: "lib/deployment/v66/rollback.guard.ts",
    required: true,
    phase: "rollback",
    description: "P4 rollback policy catalog — no auto-execution",
  },
  {
    id: "DA-010",
    label: "DR restore checklist reference",
    kind: "declarative",
    command: "lib/deployment/v66/restore.checklist.ts",
    required: true,
    phase: "incident",
    description: "P6 restore runbook — operator manual only",
  },
  {
    id: "DA-011",
    label: "Prisma snapshot baseline",
    kind: "prisma",
    command: "npm run prisma:snapshot",
    required: false,
    phase: "post-deploy",
    description: "Capture schema snapshot after deploy",
  },
  {
    id: "DA-012",
    label: "Application start",
    kind: "declarative",
    command: "npm run start",
    required: true,
    phase: "deploy",
    description: "Start Next.js — operator-triggered only",
  },
];

export function buildAutomationCatalogManifest(): AutomationCatalogManifest {
  const entries = DEPLOYMENT_AUTOMATION_CATALOG;
  const kinds = new Set(entries.map((e) => e.kind));
  const catalogComplete = entries.length >= 10 && kinds.size >= 4;

  return {
    version: V66_DEPLOYMENT_OPS_VERSION,
    entryCount: entries.length,
    kindCount: kinds.size,
    catalogComplete,
    entries,
    summary: [
      `automation-catalog entries=${entries.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAutomationByPhase(
  phase: AutomationCatalogEntry["phase"],
): AutomationCatalogEntry[] {
  return DEPLOYMENT_AUTOMATION_CATALOG.filter((e) => e.phase === phase);
}
