/**
 * Prisma Stability — schema parser utilities
 */

import fs from "node:fs";
import path from "node:path";

export type ParsedField = {
  name: string;
  type: string;
  optional: boolean;
  isList: boolean;
  isRelation: boolean;
  relationModel?: string;
  line: number;
  raw: string;
};

export type ParsedModel = {
  name: string;
  startLine: number;
  endLine: number;
  fields: ParsedField[];
  mapName?: string;
};

export type ParsedEnum = {
  name: string;
  values: string[];
  startLine: number;
};

export type ParsedSchema = {
  path: string;
  models: ParsedModel[];
  enums: ParsedEnum[];
};

const ROOT = path.resolve(__dirname, "../../..");

export function defaultSchemaPath(): string {
  return path.join(ROOT, "prisma", "schema.prisma");
}

export function readSchemaFile(schemaPath = defaultSchemaPath()): string {
  return fs.readFileSync(schemaPath, "utf8");
}

export function parsePrismaSchema(source: string, schemaPath = defaultSchemaPath()): ParsedSchema {
  const lines = source.split(/\r?\n/);
  const models: ParsedModel[] = [];
  const enums: ParsedEnum[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    const modelMatch = line.match(/^model\s+(\w+)\s*\{/);
    const enumMatch = line.match(/^enum\s+(\w+)\s*\{/);

    if (modelMatch) {
      const name = modelMatch[1]!;
      const startLine = i + 1;
      i += 1;
      const body: string[] = [];
      let depth = 1;
      while (i < lines.length && depth > 0) {
        const l = lines[i]!;
        if (l.includes("{")) depth += (l.match(/\{/g) ?? []).length;
        if (l.includes("}")) depth -= (l.match(/\}/g) ?? []).length;
        if (depth > 0) body.push(l);
        i += 1;
      }
      const endLine = i;
      const fields: ParsedField[] = [];
      let mapName: string | undefined;
      for (let j = 0; j < body.length; j++) {
        const fl = body[j]!.trim();
        if (!fl || fl.startsWith("///") || fl.startsWith("//") || fl.startsWith("@@")) {
          const mapMatch = fl.match(/@@map\("([^"]+)"\)/);
          if (mapMatch) mapName = mapMatch[1];
          continue;
        }
        const fieldMatch = fl.match(/^(\w+)\s+([A-Za-z_][\w\[\]?]*)/);
        if (!fieldMatch) continue;
        const fname = fieldMatch[1]!;
        let ftype = fieldMatch[2]!;
        const optional = ftype.endsWith("?");
        const isList = ftype.endsWith("[]");
        ftype = ftype.replace(/\?|\[\]/g, "");
        const isRelation = /^[A-Z]/.test(ftype) && !["String", "Int", "Float", "Boolean", "DateTime", "Json", "Bytes", "BigInt", "Decimal"].includes(ftype);
        fields.push({
          name: fname,
          type: ftype,
          optional,
          isList,
          isRelation,
          relationModel: isRelation ? ftype : undefined,
          line: startLine + j + 1,
          raw: fl,
        });
      }
      models.push({ name, startLine, endLine, fields, mapName });
      continue;
    }

    if (enumMatch) {
      const name = enumMatch[1]!;
      const startLine = i + 1;
      i += 1;
      const values: string[] = [];
      while (i < lines.length && !lines[i]!.trim().startsWith("}")) {
        const v = lines[i]!.trim();
        if (v && !v.startsWith("//")) values.push(v);
        i += 1;
      }
      enums.push({ name, values, startLine });
      i += 1;
      continue;
    }

    i += 1;
  }

  return { path: schemaPath, models, enums };
}

export function getModelMap(schema: ParsedSchema): Map<string, ParsedModel> {
  return new Map(schema.models.map((m) => [m.name, m]));
}

export function getEnumNames(schema: ParsedSchema): Set<string> {
  return new Set(schema.enums.map((e) => e.name));
}
