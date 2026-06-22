/**
 * Prisma Stability V2 — model-level diff analyzer
 */

import type { ParsedField, ParsedModel, ParsedSchema } from "../core/schema.parser";
import { getModelMap } from "../core/schema.parser";

const SCALARS = new Set([
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

export type FieldChangeKind =
  | "field_added"
  | "field_removed"
  | "type_changed"
  | "optional_changed"
  | "list_changed"
  | "index_added"
  | "index_removed"
  | "map_changed"
  | "model_added"
  | "model_removed";

export type ModelFieldChange = {
  model: string;
  field: string;
  kind: FieldChangeKind;
  before?: string;
  after?: string;
  breaking: boolean;
  message: string;
  line?: number;
};

export type ModelDiffResult = {
  addedModels: string[];
  removedModels: string[];
  modifiedModels: string[];
  changes: ModelFieldChange[];
};

function fieldSignature(f: ParsedField): string {
  const opt = f.optional ? "?" : "";
  const list = f.isList ? "[]" : "";
  return `${f.type}${opt}${list}`;
}

function isRequiredScalar(f: ParsedField): boolean {
  return !f.isRelation && !f.optional && SCALARS.has(f.type);
}

function extractIndexes(model: ParsedModel, source: string): string[] {
  const lines = source.split(/\r?\n/).slice(model.startLine - 1, model.endLine);
  const indexes: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("@@index") || trimmed.startsWith("@@unique")) {
      indexes.push(trimmed);
    }
  }
  return indexes;
}

export function analyzeModelDiff(
  before: ParsedSchema,
  after: ParsedSchema,
  beforeSource: string,
  afterSource: string,
): ModelDiffResult {
  const beforeMap = getModelMap(before);
  const afterMap = getModelMap(after);
  const changes: ModelFieldChange[] = [];

  const addedModels: string[] = [];
  const removedModels: string[] = [];
  const modifiedModels = new Set<string>();

  for (const name of afterMap.keys()) {
    if (!beforeMap.has(name)) {
      addedModels.push(name);
      changes.push({
        model: name,
        field: "*",
        kind: "model_added",
        breaking: false,
        message: `Model ${name} added`,
        line: afterMap.get(name)?.startLine,
      });
    }
  }

  for (const name of beforeMap.keys()) {
    if (!afterMap.has(name)) {
      removedModels.push(name);
      changes.push({
        model: name,
        field: "*",
        kind: "model_removed",
        breaking: true,
        message: `Model ${name} removed`,
        line: beforeMap.get(name)?.startLine,
      });
    }
  }

  for (const [name, afterModel] of afterMap) {
    const beforeModel = beforeMap.get(name);
    if (!beforeModel) continue;

    const beforeFields = new Map(beforeModel.fields.map((f) => [f.name, f]));
    const afterFields = new Map(afterModel.fields.map((f) => [f.name, f]));

    for (const [fname, bf] of beforeFields) {
      const af = afterFields.get(fname);
      if (!af) {
        modifiedModels.add(name);
        const breaking = isRequiredScalar(bf) || bf.isRelation;
        changes.push({
          model: name,
          field: fname,
          kind: "field_removed",
          before: fieldSignature(bf),
          breaking,
          message: `${name}.${fname} removed (${fieldSignature(bf)})`,
          line: bf.line,
        });
        continue;
      }

      if (bf.type !== af.type) {
        modifiedModels.add(name);
        changes.push({
          model: name,
          field: fname,
          kind: "type_changed",
          before: fieldSignature(bf),
          after: fieldSignature(af),
          breaking: true,
          message: `${name}.${fname} type changed: ${fieldSignature(bf)} → ${fieldSignature(af)}`,
          line: af.line,
        });
      } else if (bf.optional !== af.optional) {
        modifiedModels.add(name);
        const breaking = !af.optional && bf.optional;
        changes.push({
          model: name,
          field: fname,
          kind: "optional_changed",
          before: fieldSignature(bf),
          after: fieldSignature(af),
          breaking,
          message: `${name}.${fname} optionality changed: ${fieldSignature(bf)} → ${fieldSignature(af)}`,
          line: af.line,
        });
      } else if (bf.isList !== af.isList) {
        modifiedModels.add(name);
        changes.push({
          model: name,
          field: fname,
          kind: "list_changed",
          before: fieldSignature(bf),
          after: fieldSignature(af),
          breaking: true,
          message: `${name}.${fname} cardinality changed: ${fieldSignature(bf)} → ${fieldSignature(af)}`,
          line: af.line,
        });
      }
    }

    for (const [fname, af] of afterFields) {
      if (!beforeFields.has(fname)) {
        modifiedModels.add(name);
        changes.push({
          model: name,
          field: fname,
          kind: "field_added",
          after: fieldSignature(af),
          breaking: isRequiredScalar(af),
          message: `${name}.${fname} added (${fieldSignature(af)})`,
          line: af.line,
        });
      }
    }

    if (beforeModel.mapName !== afterModel.mapName) {
      modifiedModels.add(name);
      changes.push({
        model: name,
        field: "@@map",
        kind: "map_changed",
        before: beforeModel.mapName,
        after: afterModel.mapName,
        breaking: true,
        message: `${name} table map changed: ${beforeModel.mapName ?? name} → ${afterModel.mapName ?? name}`,
        line: afterModel.startLine,
      });
    }

    const beforeIdx = extractIndexes(beforeModel, beforeSource);
    const afterIdx = extractIndexes(afterModel, afterSource);
    for (const idx of afterIdx) {
      if (!beforeIdx.includes(idx)) {
        modifiedModels.add(name);
        changes.push({
          model: name,
          field: idx,
          kind: "index_added",
          after: idx,
          breaking: false,
          message: `${name} → ${idx}`,
          line: afterModel.startLine,
        });
      }
    }
    for (const idx of beforeIdx) {
      if (!afterIdx.includes(idx)) {
        modifiedModels.add(name);
        changes.push({
          model: name,
          field: idx,
          kind: "index_removed",
          before: idx,
          breaking: true,
          message: `${name} → index removed: ${idx}`,
          line: beforeModel.startLine,
        });
      }
    }
  }

  return {
    addedModels,
    removedModels,
    modifiedModels: [...modifiedModels],
    changes,
  };
}
