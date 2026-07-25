/**
 * Product P8 — Export registry
 */

import { EXPORT_FORMATS } from "../tender/tender.constants";
import { getTender } from "../tender/tender.registry";
import type {
  CreateExportInput,
  ExportFormat,
  TenderExport,
} from "./export.types";

const exportsMap = new Map<string, TenderExport>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneExport(item: TenderExport): TenderExport {
  return {
    ...item,
    documentIds: [...item.documentIds],
    metadata: { ...item.metadata },
  };
}

export function createExport(input: CreateExportInput): TenderExport {
  const tenderId = input.tenderId.trim();
  if (!tenderId) throw new Error("export.tenderId is required");
  if (!(EXPORT_FORMATS as readonly string[]).includes(input.format)) {
    throw new Error(`invalid export format: ${input.format}`);
  }
  if (!getTender(tenderId)) {
    throw new Error(`tender not found: ${tenderId}`);
  }

  const documentIds = (input.documentIds ?? [])
    .map((d) => d.trim())
    .filter((d) => d.length > 0);
  if (documentIds.length < 1) {
    throw new Error("export.documentIds must include at least one document");
  }

  const id = input.id?.trim() || createId("p8exp");
  if (exportsMap.has(id)) {
    throw new Error(`export already exists: ${id}`);
  }

  const artifactPath =
    (input.artifactPath ?? "").trim() ||
    `/exports/${tenderId}/${id}.${input.format.toLowerCase()}`;
  const item: TenderExport = {
    id,
    tenderId,
    format: input.format,
    documentIds,
    artifactPath,
    detail: `format=${input.format} docs=${documentIds.length}`,
    metadata: { ...(input.metadata ?? {}) },
    exportedAt: nowIso(),
  };
  exportsMap.set(id, item);
  return cloneExport(item);
}

export function getExport(id: string): TenderExport | undefined {
  const item = exportsMap.get(id.trim());
  return item ? cloneExport(item) : undefined;
}

export function listExports(filter?: {
  tenderId?: string;
  format?: ExportFormat;
}): TenderExport[] {
  let result = [...exportsMap.values()];
  if (filter?.tenderId) {
    const tid = filter.tenderId.trim();
    result = result.filter((e) => e.tenderId === tid);
  }
  if (filter?.format) result = result.filter((e) => e.format === filter.format);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneExport);
}

export function clearExports(): void {
  exportsMap.clear();
}
