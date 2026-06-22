#!/usr/bin/env tsx
/**
 * Prisma Stability V2 — migration safety gate
 */
import { runSchemaDiffAgainstBaseline } from "../lib/prisma-stability/diff/schema.diff.engine";
import {
  assessMigrationSafety,
  blockUnsafeMigration,
} from "../lib/prisma-stability/migration/migration.safety.engine";
import {
  generateRollbackPlan,
  formatRollbackPlan,
} from "../lib/prisma-stability/migration/migration.rollback.plan";

const report = runSchemaDiffAgainstBaseline();
const safety = assessMigrationSafety(report);

console.log("Migration Safety Check\n");
console.log(`Baseline: ${report.beforeLabel}`);
console.log(`Risk Level: ${report.riskLevel}`);
console.log(`Changes: ${report.hasChanges ? "yes" : "none"}\n`);

if (safety.warnings.length > 0) {
  console.log("Warnings:");
  for (const w of safety.warnings) console.log(`  ⚠ ${w}`);
  console.log("");
}

if (safety.errors.length > 0) {
  console.log("Blocked operations:");
  for (const e of safety.errors) console.log(`  ✗ ${e}`);
  console.log("");

  const plan = generateRollbackPlan(report);
  console.log(formatRollbackPlan(plan));
  console.log("");

  try {
    blockUnsafeMigration(safety);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

if (!report.hasChanges) {
  console.log("✅ No schema changes — migration safety passed");
} else if (safety.ok) {
  console.log("✅ Migration safety passed");
} else {
  console.log("✅ Migration safety passed (warnings only)");
}

process.exit(0);
