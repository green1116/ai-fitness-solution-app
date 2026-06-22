#!/usr/bin/env tsx
/**
 * Prisma Stability V3 — rollback plan gate
 */
import { generateRollbackPlanV3 } from "../lib/prisma-stability/rollback/rollback.engine";
import { blockUnsafeRollback } from "../lib/prisma-stability/rollback/rollback.validator";

const result = generateRollbackPlanV3();

console.log(result.formatted);
console.log("");

if (result.validation.warnings.length > 0) {
  console.log("Warnings:");
  for (const w of result.validation.warnings) console.log(`  ⚠ ${w}`);
  console.log("");
}

if (!result.validation.ok) {
  console.error("Blocked:");
  for (const e of result.validation.errors) console.error(`  ✗ ${e}`);
  console.log("");
  try {
    blockUnsafeRollback(result.validation);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

console.log("✅ Rollback plan check passed");
process.exit(0);
