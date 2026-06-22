/**
 * Prisma Stability V3 — migration execution audit
 */

import fs from "node:fs";
import path from "node:path";

const AUDIT_DIR = path.resolve(__dirname, "../../../.prisma-stability/audit");
const LOG_FILE = path.join(AUDIT_DIR, "migration-audit.jsonl");

export type MigrationAuditEntry = {
  id: string;
  timestamp: string;
  author: string;
  migrationName: string;
  beforeHash: string;
  afterHash: string;
  riskLevel: string;
  rollbackAvailable: boolean;
  status: "planned" | "applied" | "failed" | "rolled_back";
  notes?: string;
};

function ensureAuditDir(): void {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

export function recordMigrationAudit(
  entry: Omit<MigrationAuditEntry, "id" | "timestamp">,
): MigrationAuditEntry {
  ensureAuditDir();
  const full: MigrationAuditEntry = {
    ...entry,
    id: `mig-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  fs.appendFileSync(LOG_FILE, `${JSON.stringify(full)}\n`, "utf8");
  return full;
}

export function readMigrationAudits(limit = 50): MigrationAuditEntry[] {
  if (!fs.existsSync(LOG_FILE)) return [];
  const lines = fs.readFileSync(LOG_FILE, "utf8").trim().split("\n").filter(Boolean);
  return lines.slice(-limit).map((l) => JSON.parse(l) as MigrationAuditEntry);
}
