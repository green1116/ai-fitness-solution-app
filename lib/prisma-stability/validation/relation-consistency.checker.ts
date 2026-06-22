/**
 * Prisma Stability — relation consistency checker
 */

import type { ParsedSchema } from "../core/schema.parser";
import { getEnumNames, getModelMap } from "../core/schema.parser";

export type RelationIssue = {
  model: string;
  field: string;
  line: number;
  message: string;
  suggestion?: string;
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

export function validateRelationConsistency(schema: ParsedSchema): RelationIssue[] {
  const modelMap = getModelMap(schema);
  const enumNames = getEnumNames(schema);
  const issues: RelationIssue[] = [];

  for (const model of schema.models) {
    for (const field of model.fields) {
      if (SCALAR_TYPES.has(field.type) || enumNames.has(field.type)) continue;

      const target = modelMap.get(field.type);
      if (!target) {
        issues.push({
          model: model.name,
          field: field.name,
          line: field.line,
          message: `Unresolved type "${field.type}" on field ${model.name}.${field.name}`,
          suggestion: `Define model ${field.type} or fix typo`,
        });
        continue;
      }

      if (field.isRelation) {
        const backRef = target.fields.find(
          (f) => f.isRelation && (f.type === model.name || f.relationModel === model.name),
        );
        if (!backRef && !field.raw.includes("@relation")) {
          issues.push({
            model: model.name,
            field: field.name,
            line: field.line,
            message: `Relation ${model.name}.${field.name} → ${field.type} missing inverse field`,
            suggestion: `Add ${model.name}[] or ${model.name}? on ${field.type}`,
          });
        }
      }

      const relationMatch = field.raw.match(/@relation\([^)]*fields:\s*\[(\w+)\][^)]*references:\s*\[(\w+)\]/);
      if (relationMatch) {
        const localField = relationMatch[1]!;
        const remoteField = relationMatch[2]!;
        const localExists = model.fields.some((f) => f.name === localField);
        const remoteExists = target.fields.some((f) => f.name === remoteField);
        if (!localExists) {
          issues.push({
            model: model.name,
            field: field.name,
            line: field.line,
            message: `@relation fields [${localField}] not found on ${model.name}`,
          });
        }
        if (!remoteExists) {
          issues.push({
            model: model.name,
            field: field.name,
            line: field.line,
            message: `@relation references [${remoteField}] not found on ${field.type}`,
          });
        }
      }
    }
  }

  return issues;
}
