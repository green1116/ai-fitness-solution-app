/**
 * E11-P1 — Cloud Execution Context
 * Open / activate / close contexts bound to registered runtimes
 */

import { CLOUD_CONTEXT_STATUSES } from "../core/cloud.constants";
import { getRuntime } from "../registry/cloud.registry";
import type {
  CloudContextStatus,
  CloudExecutionContext,
  OpenCloudContextInput,
} from "../types/cloud.types";

const contexts = new Map<string, CloudExecutionContext>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContext(ctx: CloudExecutionContext): CloudExecutionContext {
  return {
    ...ctx,
    attributes: { ...ctx.attributes },
  };
}

export function openContext(
  input: OpenCloudContextInput,
): CloudExecutionContext {
  const runtimeId = input.runtimeId.trim();
  if (!runtimeId) throw new Error("context.runtimeId is required");

  const runtime = getRuntime(runtimeId);
  if (!runtime) throw new Error(`cloud runtime not found: ${runtimeId}`);
  if (runtime.status !== "ACTIVE" && runtime.status !== "REGISTERED") {
    throw new Error(
      `openContext requires ACTIVE or REGISTERED runtime (current=${runtime.status})`,
    );
  }

  const contextId = input.contextId?.trim() || createId("ctx");
  if (contexts.has(contextId)) {
    throw new Error(`context already exists: ${contextId}`);
  }

  const ctx: CloudExecutionContext = {
    contextId,
    runtimeId,
    status: "OPEN",
    correlationId: input.correlationId?.trim() || undefined,
    attributes: { ...(input.attributes ?? {}) },
    openedAt: nowIso(),
  };
  contexts.set(contextId, ctx);
  return cloneContext(ctx);
}

export function activateContext(contextId: string): CloudExecutionContext {
  const ctx = contexts.get(contextId.trim());
  if (!ctx) throw new Error(`context not found: ${contextId}`);
  if (ctx.status !== "OPEN") {
    throw new Error(`activate requires OPEN (current=${ctx.status})`);
  }
  ctx.status = "ACTIVE";
  contexts.set(ctx.contextId, ctx);
  return cloneContext(ctx);
}

export function closeContext(contextId: string): CloudExecutionContext {
  const ctx = contexts.get(contextId.trim());
  if (!ctx) throw new Error(`context not found: ${contextId}`);
  if (ctx.status === "CLOSED") {
    throw new Error(`context already closed: ${contextId}`);
  }
  ctx.status = "CLOSED";
  ctx.closedAt = nowIso();
  contexts.set(ctx.contextId, ctx);
  return cloneContext(ctx);
}

export function getContext(
  contextId: string,
): CloudExecutionContext | undefined {
  const ctx = contexts.get(contextId.trim());
  return ctx ? cloneContext(ctx) : undefined;
}

export function listContexts(filter?: {
  runtimeId?: string;
  status?: CloudContextStatus;
}): CloudExecutionContext[] {
  let result = [...contexts.values()];
  if (filter?.runtimeId) {
    const runtimeId = filter.runtimeId.trim();
    result = result.filter((c) => c.runtimeId === runtimeId);
  }
  if (filter?.status) {
    if (!(CLOUD_CONTEXT_STATUSES as readonly string[]).includes(filter.status)) {
      throw new Error(`invalid context status: ${filter.status}`);
    }
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.contextId.localeCompare(b.contextId))
    .map(cloneContext);
}

export function clearContexts(): void {
  contexts.clear();
}
