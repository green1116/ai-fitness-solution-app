#!/usr/bin/env tsx
import { runSchemaGuard } from "../lib/prisma-stability/core/schema.guard";

const result = runSchemaGuard();

if (result.ok) {
  console.log(`✅ Prisma schema valid (${result.modelCount} models)`);
  process.exit(0);
}

console.error("❌ Prisma schema validation failed:\n");
for (const err of result.errors) console.error(`  - ${err}`);
process.exit(1);
