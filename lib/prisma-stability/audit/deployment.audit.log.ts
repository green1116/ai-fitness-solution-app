/**
 * Prisma Stability V3 — deployment audit log
 */

import fs from "node:fs";
import path from "node:path";

const AUDIT_DIR = path.resolve(__dirname, "../../../.prisma-stability/audit");
const LOG_FILE = path.join(AUDIT_DIR, "deployment-audit.jsonl");

export type DeploymentAuditEntry = {
  id: string;
  timestamp: string;
  environment: string;
  schemaHash: string;
  preflightOk: boolean;
  snapshotOk: boolean;
  rollbackOk: boolean;
  runtimeGuardOk: boolean;
  buildOk: boolean;
  blocked: boolean;
  reason?: string;
};

function ensureAuditDir(): void {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

export function recordDeploymentAudit(
  entry: Omit<DeploymentAuditEntry, "id" | "timestamp">,
): DeploymentAuditEntry {
  ensureAuditDir();
  const full: DeploymentAuditEntry = {
    ...entry,
    id: `dep-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  fs.appendFileSync(LOG_FILE, `${JSON.stringify(full)}\n`, "utf8");
  return full;
}

export function readDeploymentAudits(limit = 30): DeploymentAuditEntry[] {
  if (!fs.existsSync(LOG_FILE)) return [];
  const lines = fs.readFileSync(LOG_FILE, "utf8").trim().split("\n").filter(Boolean);
  return lines.slice(-limit).map((l) => JSON.parse(l) as DeploymentAuditEntry);
}
