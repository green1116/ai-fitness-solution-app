/**
 * Prisma Stability V3 — ops dashboard formatter
 */

import { getPrismaOpsDashboard } from "./prisma.ops.service";

export function formatOpsDashboard(): string {
  const dash = getPrismaOpsDashboard();
  const s = dash.status;

  const lines = [
    "Prisma Ops Dashboard",
    "====================",
    `Schema Hash: ${s.schemaHash.slice(0, 16)}...`,
    `Preflight: ${s.preflight.ok ? "OK" : "FAIL"}`,
    `Snapshot: ${s.snapshot.ok ? "OK" : "DRIFT"} — ${s.snapshot.message}`,
    `Audited: ${s.audited ? "yes" : "no"}`,
    `Risk: ${s.diff.riskLevel}`,
    `Rollback Feasible: ${s.rollback.feasible ? "yes" : "no"}`,
    `Runtime Guard: ${s.runtimeGuard.ok ? "OK" : "FAIL"}`,
    `Snapshots: ${s.snapshotCount}`,
    `Recent Schema Audits: ${dash.schemaAudits.length}`,
    `Recent Migrations: ${dash.migrationAudits.length}`,
  ];

  return lines.join("\n");
}

export { getPrismaOpsDashboard };
