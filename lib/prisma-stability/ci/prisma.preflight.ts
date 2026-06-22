/**
 * Prisma Stability — preflight & deploy guard (V2)
 */

import fs from "node:fs";
import { defaultSchemaPath } from "../core/schema.parser";
import { runSchemaGuard } from "../core/schema.guard";
import { assertClientInSync, isClientGenerated } from "../generate/client.sync.guard";
import { runSchemaDiffAgainstBaseline } from "../diff/schema.diff.engine";
import { assessMigrationSafety } from "../migration/migration.safety.engine";
import { checkSnapshotDrift } from "../snapshot/schema.snapshot.engine";
import { hasAuditForSchemaHash } from "../audit/schema.change.log";
import { validateRollbackSafety } from "../rollback/rollback.validator";
import { guardPrismaRuntime } from "../runtime/prisma.runtime.guard";

export type PreflightResult = {
  ok: boolean;
  steps: { step: string; ok: boolean; detail?: string }[];
  errors: string[];
  warnings: string[];
};

export function runPrismaPreflight(): PreflightResult {
  const steps: PreflightResult["steps"] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const guard = runSchemaGuard();
  steps.push({
    step: "schema_guard",
    ok: guard.ok,
    detail: `${guard.modelCount} models`,
  });
  if (!guard.ok) errors.push(...guard.errors);

  const diffReport = runSchemaDiffAgainstBaseline();
  const diffOk = diffReport.riskLevel !== "CRITICAL";
  steps.push({
    step: "schema_diff",
    ok: diffOk,
    detail: diffReport.hasChanges ? diffReport.summary : "no changes",
  });
  if (diffReport.breakingChanges.length > 0) {
    for (const b of diffReport.breakingChanges) warnings.push(`diff: ${b}`);
  }
  if (!diffOk) {
    errors.push(`Schema diff risk CRITICAL — ${diffReport.breakingChanges.length} breaking changes`);
  }

  const migrationSafety = assessMigrationSafety(diffReport);
  const migrationStrict = process.env.PRISMA_MIGRATION_STRICT !== "0";
  steps.push({
    step: "migration_safety",
    ok: migrationSafety.ok || !migrationStrict,
    detail: migrationSafety.ok
      ? "safe"
      : `${migrationSafety.errors.length} blocked operation(s)`,
  });
  if (migrationSafety.warnings.length > 0) {
    warnings.push(...migrationSafety.warnings.map((w) => `migration: ${w}`));
  }
  if (migrationStrict && migrationSafety.blocked) {
    errors.push(...migrationSafety.errors.map((e) => `migration blocked: ${e}`));
  }

  const schemaPath = defaultSchemaPath();
  const schemaMtime = fs.statSync(schemaPath).mtimeMs;
  const sync = assertClientInSync(schemaMtime);
  const strictSync = process.env.STRICT_CLIENT_SYNC === "1";
  steps.push({
    step: "client_sync",
    ok: sync.ok || !isClientGenerated(),
    detail: sync.message,
  });
  if (!sync.ok && isClientGenerated()) {
    const msg = sync.message ?? "client out of sync";
    if (strictSync) errors.push(msg);
    else warnings.push(msg);
  }

  const drift = checkSnapshotDrift();
  const snapshotStrict = process.env.PRISMA_SNAPSHOT_STRICT !== "0";
  const audited = hasAuditForSchemaHash(drift.currentHash);
  const snapshotOk = drift.ok || audited || !snapshotStrict;
  steps.push({
    step: "snapshot_check",
    ok: snapshotOk,
    detail: drift.message,
  });
  if (!drift.ok && !audited && snapshotStrict) {
    errors.push(`NO_SILENT_SCHEMA_DRIFT: ${drift.message} — run npm run prisma:snapshot`);
  }

  const rollbackValidation = validateRollbackSafety(diffReport);
  const rollbackStrict = process.env.PRISMA_ROLLBACK_STRICT !== "0";
  steps.push({
    step: "rollback_plan_check",
    ok: rollbackValidation.ok || !rollbackStrict,
    detail: rollbackValidation.feasible ? "feasible" : "manual required",
  });
  if (rollbackStrict && rollbackValidation.blocked) {
    errors.push(...rollbackValidation.errors.map((e) => `rollback: ${e}`));
  }
  if (rollbackValidation.warnings.length > 0) {
    warnings.push(...rollbackValidation.warnings.map((w) => `rollback: ${w}`));
  }

  const runtimeGuard = guardPrismaRuntime();
  steps.push({
    step: "runtime_guard",
    ok: runtimeGuard.ok,
    detail: runtimeGuard.checks.map((c) => c.name).join(", "),
  });
  if (!runtimeGuard.ok) {
    errors.push(...runtimeGuard.errors.map((e) => `runtime: ${e}`));
  }

  return { ok: errors.length === 0, steps, errors, warnings };
}

export function blockUnsafeDeploy(preflight: PreflightResult): void {
  if (!preflight.ok) {
    const msg = preflight.errors.join("\n");
    throw new Error(`Unsafe deploy blocked — Prisma preflight failed:\n${msg}`);
  }
}
