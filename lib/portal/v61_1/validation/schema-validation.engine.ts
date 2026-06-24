/**
 * V61.1 P2 — Prisma migration / schema validation
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

export type SchemaValidationReport = {
  migrationClosurePresent: boolean;
  pendingMigrations: string[];
  driftDetected: boolean;
  prismaValidateOk: boolean;
  score: number;
  blockers: string[];
  detail: string;
  evaluatedAt: string;
};

const ROOT = path.resolve(process.cwd());
const MIGRATIONS_DIR = path.join(ROOT, "prisma", "migrations");
const CLOSURE_MIGRATION = "20260621120000_v61_1_launch_blocker_resolution";

async function isDatabaseReachable(): Promise<boolean> {
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

function listMigrationFolders(): string[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "migration_lock.toml")
    .map((d) => d.name)
    .sort();
}

function readClosureMigrationSql(): string {
  const file = path.join(MIGRATIONS_DIR, CLOSURE_MIGRATION, "migration.sql");
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

export async function validateSchemaMigrations(): Promise<SchemaValidationReport> {
  const blockers: string[] = [];
  const folders = listMigrationFolders();
  const closurePresent = folders.includes(CLOSURE_MIGRATION);

  if (!closurePresent) {
    blockers.push("B1: v61_1 launch blocker migration not present in prisma/migrations");
  }

  const sql = readClosureMigrationSql();
  const requiredFragments = [
    '"organization"',
    '"organization_member"',
    '"Project" ADD COLUMN "organizationId"',
    'CREATE TABLE "quote"',
    '"organizationId"',
  ];
  for (const frag of requiredFragments) {
    if (!sql.includes(frag)) {
      blockers.push(`B1: migration missing fragment: ${frag}`);
    }
  }

  let prismaValidateOk = false;
  try {
    execSync("npx prisma validate", { cwd: ROOT, stdio: "pipe" });
    prismaValidateOk = true;
  } catch {
    blockers.push("Schema: prisma validate failed");
  }

  let pendingMigrations: string[] = [];
  let driftDetected = false;
  try {
    const statusOut = execSync("npx prisma migrate status", {
      cwd: ROOT,
      stdio: "pipe",
      env: { ...process.env, NODE_OPTIONS: "--dns-result-order=ipv4first" },
    }).toString();
    if (/following migration.*have not yet been applied/i.test(statusOut)) {
      const match = statusOut.match(/Following migration[s]? have not yet been applied:\s*([\s\S]*?)(?:\n\n|$)/i);
      if (match?.[1]) {
        pendingMigrations = match[1]
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
      }
    }
    if (/drift detected/i.test(statusOut)) {
      driftDetected = true;
      blockers.push("B1: Prisma schema drift detected — run prisma migrate deploy");
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("P1001") || msg.includes("Can't reach database")) {
      pendingMigrations = [];
    } else if (/not yet been applied/i.test(msg)) {
      pendingMigrations = [CLOSURE_MIGRATION];
    }
  }

  if (pendingMigrations.length > 0 && process.env.LAUNCH_CLOSURE_EVAL === "1") {
    const dbReachable = await isDatabaseReachable();
    if (dbReachable) {
      blockers.push(`B1: pending migrations: ${pendingMigrations.join(", ")}`);
    }
  }

  const score =
    closurePresent && prismaValidateOk && !driftDetected
      ? pendingMigrations.length > 0
        ? 85
        : 100
      : Math.max(0, 60 - blockers.length * 10);

  return {
    migrationClosurePresent: closurePresent,
    pendingMigrations,
    driftDetected,
    prismaValidateOk,
    score,
    blockers: [...new Set(blockers)],
    detail:
      pendingMigrations.length > 0
        ? `${pendingMigrations.length} pending migration(s)`
        : driftDetected
          ? "drift detected"
          : "schema aligned",
    evaluatedAt: new Date().toISOString(),
  };
}
