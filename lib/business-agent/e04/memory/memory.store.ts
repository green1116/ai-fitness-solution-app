/**
 * E04-P5 — Business Memory Store (in-memory, additive foundation)
 */

import {
  E04_MEMORY_BASE,
  E04_MEMORY_FREEZE_VERSION,
  E04_MEMORY_RUNTIME_ID,
  E04_MEMORY_VERSION,
  MEMORY_KINDS,
  MEMORY_SCOPES,
} from "./memory.constants";
import type {
  MemoryRecord,
  MemoryRuntimeManifest,
  MemoryWriteInput,
} from "./memory.types";

const records = new Map<string, MemoryRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function resetBusinessMemoryStore(): void {
  records.clear();
}

export function getMemoryRecordCount(): number {
  return records.size;
}

export function getMemoryRecordById(id: string): MemoryRecord | undefined {
  return records.get(id);
}

export function listMemoryRecords(): MemoryRecord[] {
  return [...records.values()];
}

export function writeMemoryRecord(input: MemoryWriteInput): MemoryRecord {
  if (!(MEMORY_SCOPES as readonly string[]).includes(input.scope)) {
    throw new Error(`invalid memory scope: ${input.scope}`);
  }
  if (!(MEMORY_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid memory kind: ${input.kind}`);
  }
  if (!input.ownerId.trim()) throw new Error("ownerId is required");
  if (!input.title.trim()) throw new Error("title is required");
  if (!input.content.trim()) throw new Error("content is required");

  const id = input.id?.trim() || createId("mem");
  if (records.has(id)) {
    throw new Error(`memory id already exists: ${id}`);
  }

  const record: MemoryRecord = {
    id,
    scope: input.scope,
    kind: input.kind,
    ownerId: input.ownerId.trim(),
    title: input.title.trim(),
    content: input.content.trim(),
    tags: Object.freeze(
      [...new Set((input.tags ?? []).map((t) => t.trim()).filter(Boolean))],
    ) as string[],
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    createdAt: nowIso(),
    readOnly: true,
  };

  records.set(id, record);
  return record;
}

export function buildMemoryRuntimeManifest(): MemoryRuntimeManifest {
  return {
    runtimeId: E04_MEMORY_RUNTIME_ID,
    version: E04_MEMORY_VERSION,
    freezeVersion: E04_MEMORY_FREEZE_VERSION,
    base: E04_MEMORY_BASE,
    scopes: [...MEMORY_SCOPES],
    kinds: [...MEMORY_KINDS],
    ready: true,
    readOnly: true,
  };
}
