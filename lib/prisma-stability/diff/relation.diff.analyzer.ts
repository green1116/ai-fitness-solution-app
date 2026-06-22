/**
 * Prisma Stability V2 — relation diff analyzer
 */

import type { ParsedSchema } from "../core/schema.parser";
import { getModelMap } from "../core/schema.parser";

export type RelationChangeKind =
  | "relation_added"
  | "relation_removed"
  | "relation_target_changed"
  | "relation_cardinality_changed";

export type RelationChange = {
  model: string;
  field: string;
  kind: RelationChangeKind;
  before?: string;
  after?: string;
  breaking: boolean;
  message: string;
  line?: number;
};

function relationSig(type: string, isList: boolean, optional: boolean): string {
  const list = isList ? "[]" : "";
  const opt = optional ? "?" : "";
  return `${type}${opt}${list}`;
}

export function analyzeRelationDiff(before: ParsedSchema, after: ParsedSchema): RelationChange[] {
  const beforeMap = getModelMap(before);
  const afterMap = getModelMap(after);
  const changes: RelationChange[] = [];

  for (const [name, afterModel] of afterMap) {
    const beforeModel = beforeMap.get(name);
    if (!beforeModel) continue;

    const beforeRelations = beforeModel.fields.filter((f) => f.isRelation);
    const afterRelations = afterModel.fields.filter((f) => f.isRelation);
    const beforeByName = new Map(beforeRelations.map((f) => [f.name, f]));
    const afterByName = new Map(afterRelations.map((f) => [f.name, f]));

    for (const [fname, bf] of beforeByName) {
      const af = afterByName.get(fname);
      if (!af) {
        changes.push({
          model: name,
          field: fname,
          kind: "relation_removed",
          before: relationSig(bf.type, bf.isList, bf.optional),
          breaking: true,
          message: `${name}.${fname} relation removed (was → ${bf.type})`,
          line: bf.line,
        });
        continue;
      }

      if (bf.type !== af.type) {
        changes.push({
          model: name,
          field: fname,
          kind: "relation_target_changed",
          before: bf.type,
          after: af.type,
          breaking: true,
          message: `${name}.${fname} relation target changed: ${bf.type} → ${af.type}`,
          line: af.line,
        });
      } else if (bf.isList !== af.isList || bf.optional !== af.optional) {
        changes.push({
          model: name,
          field: fname,
          kind: "relation_cardinality_changed",
          before: relationSig(bf.type, bf.isList, bf.optional),
          after: relationSig(af.type, af.isList, af.optional),
          breaking: true,
          message: `${name}.${fname} relation cardinality changed`,
          line: af.line,
        });
      }
    }

    for (const [fname, af] of afterByName) {
      if (!beforeByName.has(fname)) {
        changes.push({
          model: name,
          field: fname,
          kind: "relation_added",
          after: relationSig(af.type, af.isList, af.optional),
          breaking: false,
          message: `${name}.${fname} relation added (→ ${af.type})`,
          line: af.line,
        });
      }
    }
  }

  return changes;
}
