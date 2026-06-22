#!/usr/bin/env tsx
/**
 * Prisma Stability V2 — schema diff audit
 */
import {
  runSchemaDiffAgainstBaseline,
  formatSchemaDiffReport,
} from "../lib/prisma-stability/diff/schema.diff.engine";

const report = runSchemaDiffAgainstBaseline();
console.log(formatSchemaDiffReport(report));
console.log("");

if (!report.hasChanges) {
  console.log("✅ No schema diff — baseline matches current");
  process.exit(0);
}

const strict = process.env.PRISMA_DIFF_STRICT === "1";
if (strict && report.breakingChanges.length > 0) {
  console.error(`❌ Breaking changes detected (${report.riskLevel}) — set PRISMA_DIFF_STRICT=0 to audit only`);
  process.exit(1);
}

console.log(`✅ Schema diff audit complete — ${report.summary}`);
process.exit(0);
