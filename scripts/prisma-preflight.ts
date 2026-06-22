#!/usr/bin/env tsx
import { runPrismaPreflight } from "../lib/prisma-stability/ci/prisma.preflight";

const result = runPrismaPreflight();

console.log("Prisma Preflight\n");
for (const step of result.steps) {
  console.log(`${step.ok ? "✓" : "✗"} ${step.step}${step.detail ? ` — ${step.detail}` : ""}`);
}

if (result.ok) {
  console.log("\n✅ Prisma preflight passed");
  if (result.warnings.length > 0) {
    console.log("\nWarnings:");
    for (const w of result.warnings) console.log(`  ⚠ ${w}`);
  }
  process.exit(0);
}

console.error("\n❌ Prisma preflight failed:\n");
for (const err of result.errors) console.error(`  - ${err}`);
process.exit(1);
