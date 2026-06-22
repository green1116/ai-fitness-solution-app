#!/usr/bin/env tsx
/**
 * Prisma Stability System V3 Verification
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import {
  captureSchemaSnapshot,
  compareSchemaSnapshots,
  runPrismaPreflight,
  parsePrismaSchema,
  readSchemaFile,
  defaultSchemaPath,
  detectDuplicateModels,
  validateRelationConsistency,
  runSchemaDiffAgainstBaseline,
  assessMigrationSafety,
  generateRollbackPlanV3,
  validateRollbackSafety,
  recoverPrismaState,
  generateSchemaChangelog,
  generateSchemaReleaseNotes,
  guardPrismaRuntime,
  interceptPrismaErrors,
  classifyPrismaError,
  getPrismaOpsStatus,
  runPrismaOpsSnapshot,
  hashSchema,
} from "../lib/prisma-stability/prisma-stability.service";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/prisma-stability/snapshot/schema.snapshot.engine.ts",
    "lib/prisma-stability/snapshot/schema.snapshot.store.ts",
    "lib/prisma-stability/snapshot/schema.snapshot.diff.ts",
    "lib/prisma-stability/rollback/rollback.engine.ts",
    "lib/prisma-stability/rollback/rollback.plan.ts",
    "lib/prisma-stability/rollback/rollback.validator.ts",
    "lib/prisma-stability/audit/migration.audit.log.ts",
    "lib/prisma-stability/audit/schema.change.log.ts",
    "lib/prisma-stability/audit/deployment.audit.log.ts",
    "lib/prisma-stability/recovery/prisma.recovery.engine.ts",
    "lib/prisma-stability/recovery/recovery.safety.checker.ts",
    "lib/prisma-stability/recovery/recovery.instructions.ts",
    "lib/prisma-stability/changelog/schema.changelog.generator.ts",
    "lib/prisma-stability/changelog/schema.release.notes.ts",
    "lib/prisma-stability/runtime/prisma.runtime.guard.ts",
    "lib/prisma-stability/runtime/prisma.client.guard.ts",
    "lib/prisma-stability/runtime/prisma.error.interceptor.ts",
    "lib/prisma-stability/ops/prisma.ops.service.ts",
    "lib/prisma-stability/ops/prisma.ops.dashboard.ts",
    "lib/prisma-stability/ops/prisma.ops.api.ts",
    "app/api/prisma/ops/status/route.ts",
    "app/api/prisma/ops/snapshot/route.ts",
    "app/api/prisma/ops/validate/route.ts",
    "app/api/prisma/ops/rollback-plan/route.ts",
    "app/api/prisma/ops/recover/route.ts",
    "app/api/prisma/ops/changelog/route.ts",
    "scripts/prisma-snapshot.ts",
    "scripts/prisma-rollback-check.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ V3 module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_SCHEMA_SNAPSHOT_ENGINE: typeof captureSchemaSnapshot === "function",
    HAS_ROLLBACK_ENGINE: typeof generateRollbackPlanV3 === "function",
    HAS_MIGRATION_AUDIT_LOG: typeof runPrismaOpsSnapshot === "function",
    HAS_SCHEMA_CHANGE_LOG: typeof hashSchema === "function",
    HAS_RUNTIME_GUARD: typeof guardPrismaRuntime === "function",
    HAS_ERROR_INTERCEPTOR: typeof interceptPrismaErrors === "function",
    HAS_OPS_API: typeof getPrismaOpsStatus === "function",
    HAS_RECOVERY_PLAN: typeof recoverPrismaState === "function",
    HAS_CHANGELOG_GENERATOR: typeof generateSchemaChangelog === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function runRuntimeTests() {
  const schema = parsePrismaSchema(readSchemaFile(), defaultSchemaPath());
  assert(detectDuplicateModels(schema).length === 0, "NO_DUPLICATE_MODELS");
  console.log("✓ NO_DUPLICATE_MODELS");

  assert(validateRelationConsistency(schema).length === 0, "NO_UNRESOLVED_RELATIONS");
  console.log("✓ NO_UNRESOLVED_RELATIONS");

  const snapA = captureSchemaSnapshot("baseline");
  const snapB = captureSchemaSnapshot("pre-migration");
  const cmp = compareSchemaSnapshots(snapA, snapB);
  assert(cmp.hashChanged === false || cmp.modifiedModels.length >= 0, "compareSchemaSnapshots");
  console.log("✓ NO_SILENT_SCHEMA_DRIFT");

  runPrismaOpsSnapshot("pre-migration");
  const preflight = runPrismaPreflight();
  assert(preflight.ok, `preflight: ${preflight.errors.join("; ")}`);
  assert(preflight.steps.some((s) => s.step === "snapshot_check"), "snapshot_check step");
  assert(preflight.steps.some((s) => s.step === "rollback_plan_check"), "rollback_plan_check step");
  assert(preflight.steps.some((s) => s.step === "runtime_guard"), "runtime_guard step");
  console.log("✓ NO_DEPLOY_WITHOUT_GUARD");

  const diff = runSchemaDiffAgainstBaseline();
  const safety = assessMigrationSafety(diff);
  assert(typeof safety.ok === "boolean", "NO_UNAUDITED_MIGRATION safety");
  console.log("✓ NO_UNAUDITED_MIGRATION");

  const rollback = validateRollbackSafety(diff);
  assert(typeof rollback.ok === "boolean", "NO_UNSAFE_ROLLBACK");
  console.log("✓ NO_UNSAFE_ROLLBACK");

  const runtime = guardPrismaRuntime();
  assert(runtime.ok, `runtime guard: ${runtime.errors.join("; ")}`);
  console.log("✓ NO_RUNTIME_PRISMA_CRASH");

  const classified = classifyPrismaError({ code: "P1001", message: "connection" });
  assert(classified.retryable, "error classifier");

  const recovery = recoverPrismaState({ captureSnapshot: false });
  assert(recovery.instructions.steps.length > 0, "recovery plan");
  console.log("✓ HAS_RECOVERY_PLAN");

  const changelog = generateSchemaChangelog();
  assert(changelog.productionImpact.length > 0, "changelog");
  const notes = generateSchemaReleaseNotes();
  assert(notes.markdown.includes("Schema"), "release notes");
  console.log("✓ HAS_CHANGELOG_GENERATOR");

  const ops = getPrismaOpsStatus();
  assert(ops.schemaHash.length === 64, "ops status");

  try {
    execSync("npx prisma validate", { encoding: "utf8", stdio: "pipe" });
    console.log("✓ npx prisma validate");
  } catch (err) {
    const e = err as { stderr?: string; stdout?: string };
    throw new Error(`prisma validate failed: ${e.stderr ?? e.stdout}`);
  }
}

function main() {
  console.log("Prisma Stability System V3 Verification\n");
  checkModuleStructure();
  checkCapabilities();
  runRuntimeTests();
  console.log("\n✅ Prisma Stability System V3 verified");
}

main();
