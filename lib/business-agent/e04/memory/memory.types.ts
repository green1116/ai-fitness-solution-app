/**
 * E04-P5 — Business Memory Runtime types
 * Memory layer for agents, workflows, processes and decisions
 */

import {
  E04_MEMORY_BASE,
  E04_MEMORY_FREEZE_VERSION,
  E04_MEMORY_RUNTIME_ID,
  E04_MEMORY_VERSION,
  MEMORY_KINDS,
  MEMORY_SCOPES,
  MEMORY_TRACE_EVENT_KINDS,
} from "./memory.constants";

export type MemoryScope = (typeof MEMORY_SCOPES)[number];
export type MemoryKind = (typeof MEMORY_KINDS)[number];
export type MemoryTraceEventKind = (typeof MEMORY_TRACE_EVENT_KINDS)[number];

export type MemoryRecord = {
  id: string;
  scope: MemoryScope;
  kind: MemoryKind;
  ownerId: string;
  title: string;
  content: string;
  tags: string[];
  payload: Readonly<Record<string, unknown>>;
  createdAt: string;
  readOnly: true;
};

export type MemoryWriteInput = {
  scope: MemoryScope;
  kind: MemoryKind;
  ownerId: string;
  title: string;
  content: string;
  tags?: string[];
  payload?: Readonly<Record<string, unknown>>;
  id?: string;
};

export type MemoryQuery = {
  scope?: MemoryScope;
  kind?: MemoryKind;
  ownerId?: string;
  tags?: string[];
  text?: string;
  limit?: number;
};

export type MemoryHit = {
  record: MemoryRecord;
  score: number;
  reasons: string[];
  readOnly: true;
};

export type MemoryRetrieveResult = {
  query: MemoryQuery;
  hits: MemoryHit[];
  hitCount: number;
  readOnly: true;
};

export type MemoryIndexSnapshot = {
  recordCount: number;
  byScope: Readonly<Record<string, number>>;
  byTag: Readonly<Record<string, number>>;
  byOwner: Readonly<Record<string, number>>;
  readOnly: true;
};

export type MemoryRuntimeManifest = {
  runtimeId: typeof E04_MEMORY_RUNTIME_ID;
  version: typeof E04_MEMORY_VERSION;
  freezeVersion: typeof E04_MEMORY_FREEZE_VERSION;
  base: typeof E04_MEMORY_BASE;
  scopes: MemoryScope[];
  kinds: MemoryKind[];
  ready: boolean;
  readOnly: true;
};
