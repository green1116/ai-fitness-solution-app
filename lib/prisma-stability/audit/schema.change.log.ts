/**
 * Prisma Stability V3 — schema change audit log
 */

import fs from "node:fs";
import path from "node:path";
import type { RiskLevel } from "../diff/schema.diff.engine";

const AUDIT_DIR = path.resolve(__dirname, "../../../.prisma-stability/audit");
const LOG_FILE = path.join(AUDIT_DIR, "schema-change.jsonl");

export type SchemaChangeAuditEntry = {
  id: string;
  timestamp: string;
  author: string;
  beforeHash: string;
  afterHash: string;
  affectedModels: string[];
  affectedRelations: string[];
  migrationName?: string;
  riskLevel: RiskLevel;
  rollbackAvailable: boolean;
  snapshotId?: string;
  summary: string;
};

function ensureAuditDir(): void {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

export function recordSchemaChangeAudit(
  entry: Omit<SchemaChangeAuditEntry, "id" | "timestamp">,
): SchemaChangeAuditEntry {
  ensureAuditDir();
  const full: SchemaChangeAuditEntry = {
    ...entry,
    id: `sca-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  fs.appendFileSync(LOG_FILE, `${JSON.stringify(full)}\n`, "utf8");
  return full;
}

export function readSchemaChangeAudits(limit = 50): SchemaChangeAuditEntry[] {
  if (!fs.existsSync(LOG_FILE)) return [];
  const lines = fs.readFileSync(LOG_FILE, "utf8").trim().split("\n").filter(Boolean);
  return lines.slice(-limit).map((l) => JSON.parse(l) as SchemaChangeAuditEntry);
}

export function hasAuditForSchemaHash(afterHash: string): boolean {
  return readSchemaChangeAudits(500).some((e) => e.afterHash === afterHash);
}

export function checkUnauditedSchemaChange(currentHash: string): boolean {
  return hasAuditForSchemaHash(currentHash);
}
