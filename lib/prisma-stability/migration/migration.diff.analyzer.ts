/**
 * Prisma Stability — migration diff analyzer
 */

import type { ParsedSchema } from "../core/schema.parser";

export type SchemaDiff = {
  addedModels: string[];
  removedModels: string[];
  renamedSuspects: { from: string; to: string; reason: string }[];
};

export function analyzeSchemaDiff(before: ParsedSchema, after: ParsedSchema): SchemaDiff {
  const beforeNames = new Set(before.models.map((m) => m.name));
  const afterNames = new Set(after.models.map((m) => m.name));

  const addedModels = [...afterNames].filter((n) => !beforeNames.has(n));
  const removedModels = [...beforeNames].filter((n) => !afterNames.has(n));

  const renamedSuspects: SchemaDiff["renamedSuspects"] = [];
  for (const removed of removedModels) {
    for (const added of addedModels) {
      const beforeModel = before.models.find((m) => m.name === removed);
      const afterModel = after.models.find((m) => m.name === added);
      if (!beforeModel || !afterModel) continue;
      const overlap = beforeModel.fields.filter((bf) =>
        afterModel.fields.some((af) => af.name === bf.name && af.type === bf.type),
      ).length;
      if (overlap >= Math.min(3, beforeModel.fields.length)) {
        renamedSuspects.push({
          from: removed,
          to: added,
          reason: `${overlap} overlapping fields`,
        });
      }
    }
  }

  return { addedModels, removedModels, renamedSuspects };
}
