/**
 * Operations O2 — Usage registry
 */

import { USAGE_STREAM_KINDS } from "./usage.constants";
import type {
  RegisterUsageStreamInput,
  UsageStream,
  UsageStreamKind,
} from "./usage.types";

const streams = new Map<string, UsageStream>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStream(stream: UsageStream): UsageStream {
  return { ...stream, metadata: { ...stream.metadata } };
}

export function registerUsageStream(
  input: RegisterUsageStreamInput,
): UsageStream {
  const name = input.name.trim();
  const accountRef = input.accountRef.trim();
  if (!name) throw new Error("usageStream.name is required");
  if (!accountRef) throw new Error("usageStream.accountRef is required");
  if (!(USAGE_STREAM_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid usage stream kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("o2usg");
  if (streams.has(id)) {
    throw new Error(`usage stream already exists: ${id}`);
  }

  const now = nowIso();
  const stream: UsageStream = {
    id,
    accountRef,
    name,
    kind: input.kind,
    detail: `kind=${input.kind} account=${accountRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  streams.set(id, stream);
  return cloneStream(stream);
}

export function getUsageStream(id: string): UsageStream | undefined {
  const stream = streams.get(id.trim());
  return stream ? cloneStream(stream) : undefined;
}

export function listUsageStreams(filter?: {
  accountRef?: string;
  kind?: UsageStreamKind;
}): UsageStream[] {
  let result = [...streams.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((s) => s.accountRef === aref);
  }
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneStream);
}

export function clearUsageStreams(): void {
  streams.clear();
}
