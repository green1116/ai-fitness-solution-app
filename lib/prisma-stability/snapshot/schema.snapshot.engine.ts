/**
 * Prisma Stability V3 — schema snapshot engine
 */

import { execSync } from "node:child_process";
import {
  defaultSchemaPath,
  parsePrismaSchema,
  readSchemaFile,
} from "../core/schema.parser";
import {
  hashSchema,
  loadLatestSnapshot,
  loadSnapshot,
  saveSnapshot,
  type SchemaSnapshot,
  type SnapshotKind,
  type SnapshotModel,
} from "./schema.snapshot.store";

function extractBlock(source: string, block: "datasource" | "generator"): string {
  const re = new RegExp(`${block}\\s+\\w+\\s*\\{[\\s\\S]*?\\}`, "m");
  return source.match(re)?.[0] ?? "";
}

function extractIndexes(modelName: string, source: string, startLine: number, endLine: number): string[] {
  const lines = source.split(/\r?\n/).slice(startLine - 1, endLine);
  return lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith("@@index") || l.startsWith("@@unique"));
}

function resolveCapturedBy(): string {
  if (process.env.PRISMA_SNAPSHOT_AUTHOR) return process.env.PRISMA_SNAPSHOT_AUTHOR;
  try {
    return execSync("git config user.email", { encoding: "utf8", stdio: "pipe" }).trim() || "system";
  } catch {
    return "system";
  }
}

export function buildSnapshotFromSource(
  source: string,
  kind: SnapshotKind,
  schemaPath = defaultSchemaPath(),
): SchemaSnapshot {
  const parsed = parsePrismaSchema(source, schemaPath);
  const models: SnapshotModel[] = parsed.models.map((m) => ({
    name: m.name,
    mapName: m.mapName,
    fields: m.fields.map((f) => ({
      name: f.name,
      type: f.type,
      optional: f.optional,
      isList: f.isList,
      isRelation: f.isRelation,
    })),
    indexes: extractIndexes(m.name, source, m.startLine, m.endLine),
  }));

  const relations = parsed.models.flatMap((m) =>
    m.fields
      .filter((f) => f.isRelation && f.relationModel)
      .map((f) => ({ model: m.name, field: f.name, target: f.relationModel! })),
  );

  const id = `${kind}-${Date.now()}`;

  return {
    id,
    kind,
    capturedAt: new Date().toISOString(),
    capturedBy: resolveCapturedBy(),
    schemaHash: hashSchema(source),
    schemaPath,
    models,
    enums: parsed.enums.map((e) => ({ name: e.name, values: [...e.values] })),
    relations,
    datasource: extractBlock(source, "datasource"),
    generator: extractBlock(source, "generator"),
    raw: source,
  };
}

export function captureSchemaSnapshot(kind: SnapshotKind = "pre-migration"): SchemaSnapshot {
  const source = readSchemaFile();
  const snapshot = buildSnapshotFromSource(source, kind);
  saveSnapshot(snapshot);
  return snapshot;
}

export function ensureBaselineSnapshot(): SchemaSnapshot {
  const existing = loadSnapshot("baseline");
  if (existing) return existing;
  return captureSchemaSnapshot("baseline");
}

export type SnapshotComparison = {
  before: SchemaSnapshot;
  after: SchemaSnapshot;
  hashChanged: boolean;
  addedModels: string[];
  removedModels: string[];
  modifiedModels: string[];
  relationDelta: number;
};

export function compareSchemaSnapshots(
  before: SchemaSnapshot,
  after: SchemaSnapshot,
): SnapshotComparison {
  const beforeNames = new Set(before.models.map((m) => m.name));
  const afterNames = new Set(after.models.map((m) => m.name));

  const addedModels = [...afterNames].filter((n) => !beforeNames.has(n));
  const removedModels = [...beforeNames].filter((n) => !afterNames.has(n));
  const modifiedModels = [...afterNames].filter((n) => {
    if (!beforeNames.has(n)) return false;
    const b = before.models.find((m) => m.name === n)!;
    const a = after.models.find((m) => m.name === n)!;
    return JSON.stringify(b) !== JSON.stringify(a);
  });

  return {
    before,
    after,
    hashChanged: before.schemaHash !== after.schemaHash,
    addedModels,
    removedModels,
    modifiedModels,
    relationDelta: after.relations.length - before.relations.length,
  };
}

export function getCurrentSchemaHash(): string {
  return hashSchema(readSchemaFile());
}

export function checkSnapshotDrift(): {
  ok: boolean;
  currentHash: string;
  latestHash: string | null;
  message: string;
} {
  const currentHash = getCurrentSchemaHash();
  const latest = loadLatestSnapshot();

  if (!latest) {
    return {
      ok: true,
      currentHash,
      latestHash: null,
      message: "no snapshot yet — run npm run prisma:snapshot",
    };
  }

  if (latest.schemaHash === currentHash) {
    return { ok: true, currentHash, latestHash: latest.schemaHash, message: "schema matches latest snapshot" };
  }

  return {
    ok: false,
    currentHash,
    latestHash: latest.schemaHash,
    message: `schema drift detected: current ${currentHash.slice(0, 12)} ≠ latest ${latest.schemaHash.slice(0, 12)}`,
  };
}
