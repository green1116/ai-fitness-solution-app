#!/usr/bin/env tsx
import { defaultSchemaPath, parsePrismaSchema, readSchemaFile } from "../lib/prisma-stability/core/schema.parser";
import { detectDuplicateModels } from "../lib/prisma-stability/validation/duplicate-model.checker";
import { detectDuplicateFields } from "../lib/prisma-stability/validation/duplicate-field.checker";

const schema = parsePrismaSchema(readSchemaFile(), defaultSchemaPath());
const modelDupes = detectDuplicateModels(schema);
const fieldDupes = detectDuplicateFields(schema);

let failed = false;

if (modelDupes.length === 0) {
  console.log("✓ NO_DUPLICATE_MODELS");
} else {
  failed = true;
  for (const d of modelDupes) console.error(`✗ ${d.message}`);
}

if (fieldDupes.length === 0) {
  console.log("✓ NO_DUPLICATE_FIELDS");
} else {
  failed = true;
  for (const d of fieldDupes) console.error(`✗ ${d.message}`);
}

process.exit(failed ? 1 : 0);
