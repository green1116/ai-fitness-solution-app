#!/usr/bin/env tsx
import { defaultSchemaPath, parsePrismaSchema, readSchemaFile } from "../lib/prisma-stability/core/schema.parser";
import { validateRelationConsistency } from "../lib/prisma-stability/validation/relation-consistency.checker";
import { registerRelationsFromSchema } from "../lib/prisma-stability/core/relation.registry";

const schema = parsePrismaSchema(readSchemaFile(), defaultSchemaPath());
registerRelationsFromSchema(schema);
const issues = validateRelationConsistency(schema);

if (issues.length === 0) {
  console.log("✓ NO_UNRESOLVED_RELATIONS");
  process.exit(0);
}

console.error("❌ Relation consistency issues:\n");
for (const issue of issues) {
  console.error(`  ${issue.model}.${issue.field} (line ${issue.line}): ${issue.message}`);
  if (issue.suggestion) console.error(`    → ${issue.suggestion}`);
}
process.exit(1);
