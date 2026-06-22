/**
 * Prisma Stability — duplicate field checker
 */

import type { ParsedSchema } from "../core/schema.parser";

export type DuplicateFieldIssue = {
  model: string;
  field: string;
  lines: number[];
  message: string;
};

export function detectDuplicateFields(schema: ParsedSchema): DuplicateFieldIssue[] {
  const issues: DuplicateFieldIssue[] = [];

  for (const model of schema.models) {
    const map = new Map<string, number[]>();
    for (const field of model.fields) {
      const lines = map.get(field.name) ?? [];
      lines.push(field.line);
      map.set(field.name, lines);
    }
    for (const [field, lines] of map) {
      if (lines.length > 1) {
        issues.push({
          model: model.name,
          field,
          lines,
          message: `Duplicate field "${field}" in model ${model.name} at lines ${lines.join(", ")}`,
        });
      }
    }
  }

  return issues;
}
