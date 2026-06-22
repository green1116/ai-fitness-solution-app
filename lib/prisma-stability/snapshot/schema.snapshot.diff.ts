/**
 * Prisma Stability V3 — snapshot diff wrapper
 */

import { runSchemaDiffEngine, type SchemaDiffReport } from "../diff/schema.diff.engine";
import { compareSchemaSnapshots, type SnapshotComparison } from "./schema.snapshot.engine";
import type { SchemaSnapshot } from "./schema.snapshot.store";

export function diffSchemaSnapshots(
  before: SchemaSnapshot,
  after: SchemaSnapshot,
): { comparison: SnapshotComparison; report: SchemaDiffReport } {
  const comparison = compareSchemaSnapshots(before, after);
  const report = runSchemaDiffEngine(before.raw, after.raw, {
    beforeLabel: `${before.kind}:${before.id}`,
    afterLabel: `${after.kind}:${after.id}`,
  });
  return { comparison, report };
}
