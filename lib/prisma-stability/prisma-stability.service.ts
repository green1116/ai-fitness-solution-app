/**
 * Prisma Stability System — public API
 */

export { runPrismaStabilityEngine, registerModelDefinition, registerSchemaModels, detectDuplicateModels, detectDuplicateFields, validateRelationConsistency, validateNamingConsistency, validateModelNamingPolicy, generateMigrationPlan, analyzeSchemaDiff, runPrismaPreflight, blockUnsafeDeploy } from "./core/prisma-stability.engine";

export { runSchemaGuard } from "./core/schema.guard";
export { enforceDeployGate } from "./ci/prisma.deploy.guard";
export { parsePrismaSchema, readSchemaFile, defaultSchemaPath } from "./core/schema.parser";
export { describeNamingPolicy } from "./conventions/naming.policy";
export { BUSINESS_DOMAIN_MAP } from "./conventions/business-domain.map";
export { runPrismaGenerate } from "./generate/client.generator";
export { assertClientInSync, isClientGenerated } from "./generate/client.sync.guard";

export {
  runSchemaDiffEngine,
  runSchemaDiffAgainstBaseline,
  formatSchemaDiffReport,
  type SchemaDiffReport,
  type RiskLevel,
} from "./diff/schema.diff.engine";
export { analyzeModelDiff } from "./diff/model.diff.analyzer";
export { analyzeRelationDiff } from "./diff/relation.diff.analyzer";
export { resolveSchemaDiffPair } from "./diff/baseline.resolver";

export {
  assessMigrationSafety,
  blockUnsafeMigration,
  type MigrationSafetyResult,
} from "./migration/migration.safety.engine";
export {
  generateRollbackPlan,
  formatRollbackPlan,
  type RollbackPlan,
} from "./migration/migration.rollback.plan";

export { captureSchemaSnapshot, compareSchemaSnapshots, ensureBaselineSnapshot, checkSnapshotDrift, getCurrentSchemaHash, buildSnapshotFromSource } from "./snapshot/schema.snapshot.engine";
export { hashSchema, loadLatestSnapshot, loadSnapshot, type SchemaSnapshot, type SnapshotKind } from "./snapshot/schema.snapshot.store";
export { diffSchemaSnapshots } from "./snapshot/schema.snapshot.diff";

export { generateRollbackPlanV3, planAndAuditMigration } from "./rollback/rollback.engine";
export { validateRollbackSafety, blockUnsafeRollback, type RollbackValidation } from "./rollback/rollback.validator";

export { recordSchemaChangeAudit, readSchemaChangeAudits, hasAuditForSchemaHash } from "./audit/schema.change.log";
export { recordMigrationAudit, readMigrationAudits } from "./audit/migration.audit.log";
export { recordDeploymentAudit, readDeploymentAudits } from "./audit/deployment.audit.log";

export { recoverPrismaState } from "./recovery/prisma.recovery.engine";
export { checkRecoverySafety } from "./recovery/recovery.safety.checker";
export { buildRecoveryInstructions, formatRecoveryInstructions } from "./recovery/recovery.instructions";

export { generateSchemaChangelog, formatSchemaChangelog } from "./changelog/schema.changelog.generator";
export { generateSchemaReleaseNotes } from "./changelog/schema.release.notes";

export { guardPrismaRuntime, guardPrismaRuntimeWithPing, installPrismaRuntimeGuard } from "./runtime/prisma.runtime.guard";
export { guardPrismaClient, pingPrismaClient } from "./runtime/prisma.client.guard";
export { interceptPrismaErrors, classifyPrismaError, withPrismaErrorIsolation } from "./runtime/prisma.error.interceptor";

export { getPrismaOpsStatus, runPrismaOpsValidate, runPrismaOpsSnapshot, getPrismaOpsDashboard } from "./ops/prisma.ops.service";
export { formatOpsDashboard } from "./ops/prisma.ops.dashboard";
