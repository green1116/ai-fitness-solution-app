/**
 * Prisma Stability — enum consistency checker
 */

import type { ParsedSchema } from "../core/schema.parser";
import { getEnumNames } from "../core/schema.parser";

export type EnumIssue = {
  model: string;
  field: string;
  line: number;
  message: string;
};

const SCALAR_TYPES = new Set([
  "String",
  "Int",
  "Float",
  "Boolean",
  "DateTime",
  "Json",
  "Bytes",
  "BigInt",
  "Decimal",
]);

export function validateEnumConsistency(schema: ParsedSchema): EnumIssue[] {
  const enumNames = getEnumNames(schema);
  const issues: EnumIssue[] = [];

  for (const model of schema.models) {
    for (const field of model.fields) {
      if (SCALAR_TYPES.has(field.type)) continue;
      if (field.isRelation) continue;
      if (!enumNames.has(field.type)) {
        issues.push({
          model: model.name,
          field: field.name,
          line: field.line,
          message: `Field ${model.name}.${field.name} uses unknown enum/type "${field.type}"`,
        });
      }
    }
  }

  return issues;
}
