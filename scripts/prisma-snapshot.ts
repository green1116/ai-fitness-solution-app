#!/usr/bin/env tsx
/**
 * Prisma Stability V3 — capture schema snapshot + audit
 */
import { runPrismaOpsSnapshot } from "../lib/prisma-stability/ops/prisma.ops.service";
import { checkSnapshotDrift } from "../lib/prisma-stability/snapshot/schema.snapshot.engine";
import { formatSchemaChangelog, generateSchemaChangelog } from "../lib/prisma-stability/changelog/schema.changelog.generator";

const kind = (process.argv[2] as "baseline" | "pre-migration" | "post-migration" | "production") ?? "pre-migration";

const before = checkSnapshotDrift();
const snapshot = runPrismaOpsSnapshot(kind);

console.log("Prisma Schema Snapshot\n");
console.log(`Kind:       ${snapshot.kind}`);
console.log(`ID:         ${snapshot.id}`);
console.log(`Hash:       ${snapshot.schemaHash}`);
console.log(`Models:     ${snapshot.models.length}`);
console.log(`Enums:      ${snapshot.enums.length}`);
console.log(`Relations:  ${snapshot.relations.length}`);
console.log(`Captured:   ${snapshot.capturedAt}`);
console.log(`By:         ${snapshot.capturedBy}`);

if (!before.ok) {
  console.log(`\nDrift resolved: ${before.message}`);
}

console.log("\n" + formatSchemaChangelog(generateSchemaChangelog()));
console.log("\n✅ Snapshot captured and audited");
