/**
 * Prisma Stability — main engine
 */

import { runSchemaGuard } from "./schema.guard";
import { registerSchemaModels, registerModelDefinition } from "./model.registry";
import { registerRelationsFromSchema } from "./relation.registry";
import { defaultSchemaPath, parsePrismaSchema, readSchemaFile } from "./schema.parser";
import { detectDuplicateModels } from "../validation/duplicate-model.checker";
import { detectDuplicateFields } from "../validation/duplicate-field.checker";
import { validateRelationConsistency } from "../validation/relation-consistency.checker";
import { validateNamingConsistency } from "../validation/naming-consistency.checker";
import { validateModelNamingPolicy as checkModelNamingPolicy } from "../conventions/naming.policy";
import { generateMigrationPlan } from "../migration/migration.safety.checker";
import { analyzeSchemaDiff } from "../migration/migration.diff.analyzer";
import { runPrismaPreflight } from "../ci/prisma.preflight";

export function runPrismaStabilityEngine() {
  const schemaPath = defaultSchemaPath();
  const source = readSchemaFile(schemaPath);
  const schema = parsePrismaSchema(source, schemaPath);
  registerSchemaModels(schema);
  registerRelationsFromSchema(schema);

  const guard = runSchemaGuard(schemaPath);
  const preflight = runPrismaPreflight();

  return {
    guard,
    preflight,
    duplicateModels: detectDuplicateModels(schema),
    duplicateFields: detectDuplicateFields(schema),
    relationIssues: validateRelationConsistency(schema),
    namingIssues: validateNamingConsistency(schema),
    migrationPlan: generateMigrationPlan(analyzeSchemaDiff(schema, schema)),
    modelCount: schema.models.length,
    relationCount: registerRelationsFromSchema(schema).length,
  };
}

export {
  registerModelDefinition,
  registerSchemaModels,
  detectDuplicateModels,
  detectDuplicateFields,
  validateRelationConsistency,
  validateNamingConsistency,
  checkModelNamingPolicy as validateModelNamingPolicy,
  generateMigrationPlan,
  analyzeSchemaDiff,
  runPrismaPreflight,
};

export { blockUnsafeDeploy } from "../ci/prisma.deploy.guard";
