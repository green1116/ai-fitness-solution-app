/**
 * Prisma Stability — duplicate model checker
 */

import type { ParsedSchema } from "../core/schema.parser";

export type DuplicateModelIssue = {
  model: string;
  lines: number[];
  message: string;
};

export function detectDuplicateModels(schema: ParsedSchema): DuplicateModelIssue[] {
  const map = new Map<string, number[]>();
  for (const model of schema.models) {
    const lines = map.get(model.name) ?? [];
    lines.push(model.startLine);
    map.set(model.name, lines);
  }

  const issues: DuplicateModelIssue[] = [];
  for (const [model, lines] of map) {
    if (lines.length > 1) {
      issues.push({
        model,
        lines,
        message: `Duplicate model "${model}" declared at lines ${lines.join(", ")}`,
      });
    }
  }
  return issues;
}
