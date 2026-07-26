/**
 * Product Routing — Fallback registry
 */

import { ROUTING_FALLBACK_MODES } from "../management/management.constants";
import { getRoute } from "../registry/route.registry";
import type {
  AttachRoutingFallbackInput,
  RoutingFallback,
} from "./fallback.types";

const fallbacks = new Map<string, RoutingFallback>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneFallback(fallback: RoutingFallback): RoutingFallback {
  return { ...fallback, metadata: { ...fallback.metadata } };
}

export function attachRoutingFallback(
  input: AttachRoutingFallbackInput,
): RoutingFallback {
  const routeId = input.routeId.trim();
  if (!routeId) throw new Error("fallback.routeId is required");
  if (!(ROUTING_FALLBACK_MODES as readonly string[]).includes(input.mode)) {
    throw new Error(`invalid fallback mode: ${input.mode}`);
  }
  if (!getRoute(routeId)) throw new Error(`route not found: ${routeId}`);

  const fallbackChannelKey = input.fallbackChannelKey?.trim().toUpperCase();
  if (input.mode !== "NONE" && !fallbackChannelKey) {
    throw new Error("fallback.fallbackChannelKey is required");
  }

  const duplicate = [...fallbacks.values()].find((f) => f.routeId === routeId);
  if (duplicate) throw new Error(`fallback already exists: ${routeId}`);

  const id = input.id?.trim() || createId("rtfb");
  if (fallbacks.has(id)) throw new Error(`fallback already exists: ${id}`);

  const fallback: RoutingFallback = {
    id,
    routeId,
    mode: input.mode,
    detail: `mode=${input.mode}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  if (fallbackChannelKey) fallback.fallbackChannelKey = fallbackChannelKey;
  fallbacks.set(id, fallback);
  return cloneFallback(fallback);
}

export function getRoutingFallback(id: string): RoutingFallback | undefined {
  const fallback = fallbacks.get(id.trim());
  return fallback ? cloneFallback(fallback) : undefined;
}

export function listRoutingFallbacks(filter?: {
  routeId?: string;
}): RoutingFallback[] {
  let result = [...fallbacks.values()];
  if (filter?.routeId) {
    const routeId = filter.routeId.trim();
    result = result.filter((f) => f.routeId === routeId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneFallback);
}

export function clearRoutingFallbacks(): void {
  fallbacks.clear();
}
