/**
 * Prisma Stability V3 — ops facade
 */

import { runPrismaPreflight } from "../ci/prisma.preflight";
import { runSchemaGuard } from "../core/schema.guard";
import { runSchemaDiffAgainstBaseline } from "../diff/schema.diff.engine";
import { assessMigrationSafety } from "../migration/migration.safety.engine";
import {
  captureSchemaSnapshot,
  ensureBaselineSnapshot,
  checkSnapshotDrift,
  getCurrentSchemaHash,
  compareSchemaSnapshots,
} from "../snapshot/schema.snapshot.engine";
import { loadLatestSnapshot, listSnapshots } from "../snapshot/schema.snapshot.store";
import { generateRollbackPlanV3 } from "../rollback/rollback.engine";
import { recoverPrismaState } from "../recovery/prisma.recovery.engine";
import { generateSchemaReleaseNotes } from "../changelog/schema.release.notes";
import { guardPrismaRuntime } from "../runtime/prisma.runtime.guard";
import { readSchemaChangeAudits } from "../audit/schema.change.log";
import { readMigrationAudits } from "../audit/migration.audit.log";
import { readDeploymentAudits } from "../audit/deployment.audit.log";
import {
  hasAuditForSchemaHash,
  recordSchemaChangeAudit,
} from "../audit/schema.change.log";

export type PrismaOpsStatus = {
  schemaHash: string;
  preflight: ReturnType<typeof runPrismaPreflight>;
  diff: ReturnType<typeof runSchemaDiffAgainstBaseline>;
  migrationSafety: ReturnType<typeof assessMigrationSafety>;
  snapshot: ReturnType<typeof checkSnapshotDrift>;
  runtimeGuard: ReturnType<typeof guardPrismaRuntime>;
  rollback: ReturnType<typeof generateRollbackPlanV3>["validation"];
  audited: boolean;
  snapshotCount: number;
};

export function getPrismaOpsStatus(): PrismaOpsStatus {
  const diff = runSchemaDiffAgainstBaseline();
  const rollback = generateRollbackPlanV3();
  const currentHash = getCurrentSchemaHash();

  return {
    schemaHash: currentHash,
    preflight: runPrismaPreflight(),
    diff,
    migrationSafety: assessMigrationSafety(diff),
    snapshot: checkSnapshotDrift(),
    runtimeGuard: guardPrismaRuntime(),
    rollback: rollback.validation,
    audited: hasAuditForSchemaHash(currentHash),
    snapshotCount: listSnapshots().length,
  };
}

export function runPrismaOpsValidate() {
  return runSchemaGuard();
}

export function runPrismaOpsSnapshot(kind: "baseline" | "pre-migration" | "post-migration" | "production" = "pre-migration") {
  ensureBaselineSnapshot();
  const latest = loadLatestSnapshot();
  const beforeHash = latest?.schemaHash ?? "none";
  const snapshot = captureSchemaSnapshot(kind);
  const diff = runSchemaDiffAgainstBaseline();
  const hashChanged = beforeHash !== snapshot.schemaHash;

  if (hashChanged) {
    recordSchemaChangeAudit({
      author: snapshot.capturedBy,
      beforeHash,
      afterHash: snapshot.schemaHash,
      affectedModels: diff.modelDiff.modifiedModels.length > 0
        ? diff.modelDiff.modifiedModels
        : diff.modelDiff.addedModels,
      affectedRelations: diff.relationChanges.map((r) => `${r.model}.${r.field}`),
      migrationName: kind,
      riskLevel: diff.riskLevel,
      rollbackAvailable: generateRollbackPlanV3().validation.feasible,
      snapshotId: snapshot.id,
      summary: `snapshot ${kind} captured`,
    });
  }

  if (latest && hashChanged) {
    compareSchemaSnapshots(latest, snapshot);
  }

  return snapshot;
}

export function getPrismaOpsDashboard() {
  return {
    status: getPrismaOpsStatus(),
    snapshots: listSnapshots(),
    latest: loadLatestSnapshot(),
    schemaAudits: readSchemaChangeAudits(20),
    migrationAudits: readMigrationAudits(20),
    deploymentAudits: readDeploymentAudits(10),
    releaseNotes: generateSchemaReleaseNotes(),
  };
}
