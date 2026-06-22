/**
 * Prisma Stability — schema guard
 */

import fs from "node:fs";
import { execSync } from "node:child_process";
import { defaultSchemaPath, parsePrismaSchema, readSchemaFile } from "./schema.parser";
import { registerSchemaModels } from "./model.registry";
import { registerRelationsFromSchema } from "./relation.registry";
import { detectDuplicateModels } from "../validation/duplicate-model.checker";
import { detectDuplicateFields } from "../validation/duplicate-field.checker";
import { validateRelationConsistency } from "../validation/relation-consistency.checker";
import { validateEnumConsistency } from "../validation/enum-consistency.checker";
import { validateNamingConsistency } from "../validation/naming-consistency.checker";

export type SchemaGuardResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  modelCount: number;
};

export function runSchemaGuard(schemaPath = defaultSchemaPath()): SchemaGuardResult {
  const source = readSchemaFile(schemaPath);
  const schema = parsePrismaSchema(source, schemaPath);
  registerSchemaModels(schema);
  registerRelationsFromSchema(schema);

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const issue of detectDuplicateModels(schema)) errors.push(issue.message);
  for (const issue of detectDuplicateFields(schema)) errors.push(issue.message);
  for (const issue of validateRelationConsistency(schema)) errors.push(issue.message);
  for (const issue of validateEnumConsistency(schema)) errors.push(issue.message);
  for (const issue of validateNamingConsistency(schema)) errors.push(issue.message);

  if (schema.models.length === 0) errors.push("No models found in schema.prisma");

  try {
    execSync("npx prisma validate", { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string };
    errors.push(`prisma validate failed:\n${e.stderr ?? e.stdout ?? ""}`.trim());
  }

  const schemaStat = fs.statSync(schemaPath);
  if (source.includes("model Customer {\n\n") || source.match(/model Customer \{\s*\n\s*\/\/\//)) {
    errors.push("Customer model appears incomplete — body missing before next model");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    modelCount: schema.models.length,
  };
}
