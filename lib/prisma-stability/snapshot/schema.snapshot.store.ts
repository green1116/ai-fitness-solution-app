/**
 * Prisma Stability V3 — schema snapshot persistence
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(__dirname, "../../..");
export const SNAPSHOT_ROOT = path.join(ROOT, ".prisma-stability", "snapshots");

export type SnapshotKind =
  | "baseline"
  | "pre-migration"
  | "post-migration"
  | "production";

export type SnapshotModel = {
  name: string;
  mapName?: string;
  fields: { name: string; type: string; optional: boolean; isList: boolean; isRelation: boolean }[];
  indexes: string[];
};

export type SnapshotEnum = {
  name: string;
  values: string[];
};

export type SchemaSnapshot = {
  id: string;
  kind: SnapshotKind;
  capturedAt: string;
  capturedBy: string;
  schemaHash: string;
  schemaPath: string;
  models: SnapshotModel[];
  enums: SnapshotEnum[];
  relations: { model: string; field: string; target: string }[];
  datasource: string;
  generator: string;
  raw: string;
};

export function hashSchema(source: string): string {
  return crypto.createHash("sha256").update(source.replace(/\r\n/g, "\n").trim()).digest("hex");
}

export function ensureSnapshotDir(): void {
  fs.mkdirSync(SNAPSHOT_ROOT, { recursive: true });
}

export function snapshotFileName(kind: SnapshotKind, id?: string): string {
  if (kind === "baseline") return "baseline.json";
  if (kind === "production") return "production.json";
  const suffix = id ?? Date.now().toString();
  return `${kind}-${suffix}.json`;
}

export function saveSnapshot(snapshot: SchemaSnapshot): string {
  ensureSnapshotDir();
  const file =
    snapshot.kind === "baseline" || snapshot.kind === "production"
      ? path.join(SNAPSHOT_ROOT, snapshotFileName(snapshot.kind))
      : path.join(SNAPSHOT_ROOT, snapshotFileName(snapshot.kind, snapshot.id));

  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2), "utf8");

  const latestPath = path.join(SNAPSHOT_ROOT, "latest.json");
  fs.writeFileSync(latestPath, JSON.stringify(snapshot, null, 2), "utf8");

  return file;
}

export function loadSnapshot(kind: SnapshotKind): SchemaSnapshot | null {
  ensureSnapshotDir();
  const file = path.join(SNAPSHOT_ROOT, snapshotFileName(kind));
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as SchemaSnapshot;
}

export function loadLatestSnapshot(): SchemaSnapshot | null {
  ensureSnapshotDir();
  const file = path.join(SNAPSHOT_ROOT, "latest.json");
  if (!fs.existsSync(file)) return loadSnapshot("baseline");
  return JSON.parse(fs.readFileSync(file, "utf8")) as SchemaSnapshot;
}

export function listSnapshots(): string[] {
  ensureSnapshotDir();
  return fs.readdirSync(SNAPSHOT_ROOT).filter((f) => f.endsWith(".json"));
}
