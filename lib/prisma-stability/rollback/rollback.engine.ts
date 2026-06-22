/**
 * Prisma Stability V3 — rollback engine
 */

import { runSchemaDiffAgainstBaseline } from "../diff/schema.diff.engine";
import { loadLatestSnapshot } from "../snapshot/schema.snapshot.store";
import { diffSchemaSnapshots } from "../snapshot/schema.snapshot.diff";
import { captureSchemaSnapshot } from "../snapshot/schema.snapshot.engine";
import { recordMigrationAudit } from "../audit/migration.audit.log";
import {
  formatRollbackPlan,
  generateRollbackPlan,
  type RollbackPlan,
} from "./rollback.plan";
import {
  blockUnsafeRollback,
  validateRollbackSafety,
  type RollbackValidation,
} from "./rollback.validator";

export type RollbackEngineResult = {
  validation: RollbackValidation;
  plan: RollbackPlan;
  formatted: string;
};

export function generateRollbackPlanV3(): RollbackEngineResult {
  const diffReport = runSchemaDiffAgainstBaseline();
  const validation = validateRollbackSafety(diffReport);
  return {
    validation,
    plan: validation.plan,
    formatted: formatRollbackPlan(validation.plan),
  };
}

export function generateRollbackPlanFromSnapshots(): RollbackEngineResult | null {
  const latest = loadLatestSnapshot();
  if (!latest) return null;

  const current = captureSchemaSnapshot("pre-migration");
  const { report } = diffSchemaSnapshots(latest, current);
  const validation = validateRollbackSafety(report);
  return {
    validation,
    plan: validation.plan,
    formatted: formatRollbackPlan(validation.plan),
  };
}

export function planAndAuditMigration(migrationName: string): RollbackEngineResult {
  const result = generateRollbackPlanV3();
  const diffReport = runSchemaDiffAgainstBaseline();

  recordMigrationAudit({
    author: process.env.PRISMA_SNAPSHOT_AUTHOR ?? "system",
    migrationName,
    beforeHash: loadLatestSnapshot()?.schemaHash ?? "unknown",
    afterHash: diffReport.afterLabel,
    riskLevel: diffReport.riskLevel,
    rollbackAvailable: result.validation.feasible,
    status: result.validation.ok ? "planned" : "failed",
    notes: result.validation.errors.join("; ") || undefined,
  });

  return result;
}

export { generateRollbackPlan, formatRollbackPlan, validateRollbackSafety, blockUnsafeRollback };
