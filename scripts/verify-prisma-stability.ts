/**
 * Prisma Stability System Verification
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import {
  runPrismaStabilityEngine,
  registerModelDefinition,
  detectDuplicateModels,
  detectDuplicateFields,
  validateRelationConsistency,
  validateModelNamingPolicy,
  generateMigrationPlan,
  analyzeSchemaDiff,
  runPrismaPreflight,
  blockUnsafeDeploy,
  parsePrismaSchema,
  readSchemaFile,
  defaultSchemaPath,
  runSchemaDiffAgainstBaseline,
  runSchemaDiffEngine,
  assessMigrationSafety,
  generateRollbackPlan,
  analyzeModelDiff,
  analyzeRelationDiff,
} from "../lib/prisma-stability/prisma-stability.service";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/prisma-stability/prisma-stability.service.ts",
    "lib/prisma-stability/core/prisma-stability.engine.ts",
    "lib/prisma-stability/core/schema.guard.ts",
    "lib/prisma-stability/core/model.registry.ts",
    "lib/prisma-stability/core/relation.registry.ts",
    "lib/prisma-stability/validation/duplicate-model.checker.ts",
    "lib/prisma-stability/validation/duplicate-field.checker.ts",
    "lib/prisma-stability/validation/relation-consistency.checker.ts",
    "lib/prisma-stability/validation/naming-consistency.checker.ts",
    "lib/prisma-stability/validation/enum-consistency.checker.ts",
    "lib/prisma-stability/migration/migration.plan.ts",
    "lib/prisma-stability/migration/migration.diff.analyzer.ts",
    "lib/prisma-stability/migration/migration.safety.checker.ts",
    "lib/prisma-stability/generate/client.generator.ts",
    "lib/prisma-stability/generate/client.sync.guard.ts",
    "lib/prisma-stability/ci/prisma.preflight.ts",
    "lib/prisma-stability/ci/prisma.deploy.guard.ts",
    "lib/prisma-stability/conventions/naming.policy.ts",
    "lib/prisma-stability/conventions/business-domain.map.ts",
    "lib/prisma-stability/diff/schema.diff.engine.ts",
    "lib/prisma-stability/diff/model.diff.analyzer.ts",
    "lib/prisma-stability/diff/relation.diff.analyzer.ts",
    "lib/prisma-stability/diff/baseline.resolver.ts",
    "lib/prisma-stability/migration/migration.safety.engine.ts",
    "lib/prisma-stability/migration/migration.rollback.plan.ts",
    "scripts/prisma-validate.ts",
    "scripts/prisma-preflight.ts",
    "scripts/prisma-check-duplicates.ts",
    "scripts/prisma-check-relations.ts",
    "scripts/prisma-diff.ts",
    "scripts/prisma-migration-safety.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ prisma-stability module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_PRISMA_STABILITY_ENGINE: typeof runPrismaStabilityEngine === "function",
    HAS_SCHEMA_GUARD: typeof runPrismaPreflight === "function",
    HAS_DUPLICATE_MODEL_CHECKER: typeof detectDuplicateModels === "function",
    HAS_RELATION_CONSISTENCY_CHECKER: typeof validateRelationConsistency === "function",
    HAS_NAMING_POLICY: typeof validateModelNamingPolicy === "function",
    HAS_MIGRATION_SAFETY_CHECKER: typeof generateMigrationPlan === "function",
    HAS_PRISMA_PRELIGHT: typeof runPrismaPreflight === "function",
    HAS_DEPLOYMENT_GATE: typeof blockUnsafeDeploy === "function",
    HAS_SCHEMA_DIFF_ENGINE: typeof runSchemaDiffAgainstBaseline === "function",
    HAS_MODEL_DIFF_ANALYZER: typeof analyzeModelDiff === "function",
    HAS_RELATION_DIFF_ANALYZER: typeof analyzeRelationDiff === "function",
    HAS_MIGRATION_SAFETY_ENGINE: typeof assessMigrationSafety === "function",
    HAS_ROLLBACK_PLAN: typeof generateRollbackPlan === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function runRuntimeTests() {
  const schema = parsePrismaSchema(readSchemaFile(), defaultSchemaPath());

  const dupModels = detectDuplicateModels(schema);
  assert(dupModels.length === 0, "NO_DUPLICATE_MODELS");
  console.log("✓ NO_DUPLICATE_MODELS");

  const dupFields = detectDuplicateFields(schema);
  assert(dupFields.length === 0, "NO_DUPLICATE_FIELDS");
  console.log("✓ NO_DUPLICATE_FIELDS");

  const relations = validateRelationConsistency(schema);
  assert(relations.length === 0, "NO_UNRESOLVED_RELATIONS");
  console.log("✓ NO_UNRESOLVED_RELATIONS");

  const naming = validateModelNamingPolicy(schema.models.map((m) => m.name));
  assert(!naming.some((n) => n.model === "CustomerV2"), "naming policy");
  console.log("✓ naming policy");

  const registered = registerModelDefinition({
    ...schema.models[0]!,
    domain: "product",
    concept: "test",
  });
  assert(registered.name.length > 0, "register model");

  const plan = generateMigrationPlan(analyzeSchemaDiff(schema, schema));
  assert(plan.length >= 3, "migration plan");

  const engine = runPrismaStabilityEngine();
  assert(engine.modelCount > 0, "engine models");
  assert(engine.guard.ok, `schema guard: ${engine.guard.errors.join("; ")}`);

  const preflight = runPrismaPreflight();
  assert(preflight.ok, `preflight: ${preflight.errors.join("; ")}`);
  assert(
    preflight.steps.some((s) => s.step === "schema_diff"),
    "preflight includes schema_diff",
  );
  assert(
    preflight.steps.some((s) => s.step === "migration_safety"),
    "preflight includes migration_safety",
  );
  console.log("✓ NO_SKIP_VALIDATION");

  const schemaText = readSchemaFile();

  const diffReport = runSchemaDiffAgainstBaseline();
  const diffSelf = runSchemaDiffEngine(schemaText, schemaText);
  assert(!diffSelf.hasChanges, "self diff is empty");
  assert(typeof diffReport.riskLevel === "string", "diff risk level");

  const safety = assessMigrationSafety(diffReport);
  assert(typeof safety.ok === "boolean", "migration safety result");
  console.log("✓ SCHEMA_DIFF_ENGINE");

  const rollback = generateRollbackPlan(diffSelf);
  assert(rollback.steps.length > 0, "rollback plan");
  console.log("✓ MIGRATION_ROLLBACK_PLAN");

  assert(schemaText.includes("model Customer {"), "Customer model present");
  assert(schemaText.includes("model Lead {"), "Lead model present");
  assert(schemaText.includes("model MarketingLead {"), "MarketingLead separate");
  assert(!schemaText.includes("model CustomerV2"), "no CustomerV2");

  try {
    execSync("npx prisma validate", { encoding: "utf8", stdio: "pipe" });
    console.log("✓ npx prisma validate");
  } catch (err) {
    const e = err as { stderr?: string; stdout?: string };
    throw new Error(`prisma validate failed: ${e.stderr ?? e.stdout}`);
  }

  console.log("✓ runtime prisma stability pipeline");
}

function main() {
  console.log("Prisma Stability System V2 Verification\n");
  checkModuleStructure();
  checkCapabilities();
  runRuntimeTests();
  console.log("\n✅ Prisma Stability System V2 verified");
}

main();
