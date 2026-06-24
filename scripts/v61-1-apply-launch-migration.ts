/**
 * V61.1 — Apply launch blocker migration via pooler (when DIRECT_URL migrate deploy unavailable)
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";

const MIGRATION_NAME = "20260621120000_v61_1_launch_blocker_resolution";
const MIGRATION = path.join(process.cwd(), `prisma/migrations/${MIGRATION_NAME}/migration.sql`);

function splitStatements(sql: string): string[] {
  const cleaned = sql.replace(/\r\n/g, "\n").replace(/--[^\n]*/g, "");
  return cleaned
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function execStatement(stmt: string): Promise<"ok" | "skip"> {
  try {
    await prisma.$executeRawUnsafe(stmt);
    return "ok";
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      /already exists/i.test(msg) ||
      /duplicate/i.test(msg) ||
      /IF NOT EXISTS/i.test(stmt)
    ) {
      return "skip";
    }
    throw e;
  }
}

async function main() {
  const sql = fs.readFileSync(MIGRATION, "utf8");
  const statements = splitStatements(sql);
  let applied = 0;
  let skipped = 0;

  for (const stmt of statements) {
    const result = await execStatement(stmt);
    if (result === "ok") applied++;
    else skipped++;
    console.log(result === "ok" ? "✓" : "○", stmt.slice(0, 72).replace(/\s+/g, " "));
  }

  console.log(`\nDone: ${applied} applied, ${skipped} skipped/already present`);

  const migrationSql = fs.readFileSync(MIGRATION, "utf8");
  const checksum = crypto.createHash("sha256").update(migrationSql).digest("hex");
  await prisma.$executeRawUnsafe(
    `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
     SELECT $1::text, $2::text, NOW(), $3::text, NULL, NULL, NOW(), 1
     WHERE NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = $3::text)`,
    crypto.randomUUID(),
    checksum,
    MIGRATION_NAME,
  );
  console.log("✓ migration history recorded");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
