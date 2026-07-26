/**
 * Product Routing — Resolution registry (deterministic plan only)
 */

import { listRoutingFallbacks } from "../fallback/fallback.registry";
import { getRoute } from "../registry/route.registry";
import { listRoutingRules } from "../rule/rule.registry";
import { listRoutingStrategies } from "../strategy/strategy.registry";
import type {
  ResolveRouteInput,
  RoutingResolution,
  RoutingResolutionVerdict,
} from "./resolution.types";

const resolutions = new Map<string, RoutingResolution>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneResolution(
  resolution: RoutingResolution,
): RoutingResolution {
  return { ...resolution, metadata: { ...resolution.metadata } };
}

export function resolveRoute(input: ResolveRouteInput): RoutingResolution {
  const routeId = input.routeId.trim();
  if (!routeId) throw new Error("resolution.routeId is required");
  if (!getRoute(routeId)) throw new Error(`route not found: ${routeId}`);

  const rules = listRoutingRules({ routeId }).filter((r) => r.enabled);
  const strategies = listRoutingStrategies({ routeId });
  const fallbacks = listRoutingFallbacks({ routeId });

  let selectedChannelKey = "";
  let verdict: RoutingResolutionVerdict = "UNROUTEABLE";
  let usedFallback = false;

  if (rules.length >= 1 && strategies.length >= 1) {
    const ordered = rules
      .slice()
      .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
    selectedChannelKey = ordered[0].channelKey;
    verdict = "ROUTED";
  } else if (fallbacks.length >= 1 && fallbacks[0].mode !== "NONE") {
    selectedChannelKey = fallbacks[0].fallbackChannelKey ?? "";
    if (selectedChannelKey) {
      verdict = "FALLBACK";
      usedFallback = true;
    }
  }

  const id = input.id?.trim() || createId("rtres");
  if (resolutions.has(id)) throw new Error(`resolution already exists: ${id}`);

  const resolution: RoutingResolution = {
    id,
    routeId,
    selectedChannelKey,
    verdict,
    usedFallback,
    detail: `verdict=${verdict} channel=${selectedChannelKey || "NONE"}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  resolutions.set(id, resolution);
  return cloneResolution(resolution);
}

export function getRoutingResolution(
  id: string,
): RoutingResolution | undefined {
  const resolution = resolutions.get(id.trim());
  return resolution ? cloneResolution(resolution) : undefined;
}

export function listRoutingResolutions(filter?: {
  routeId?: string;
}): RoutingResolution[] {
  let result = [...resolutions.values()];
  if (filter?.routeId) {
    const routeId = filter.routeId.trim();
    result = result.filter((r) => r.routeId === routeId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneResolution);
}

export function clearRoutingResolutions(): void {
  resolutions.clear();
}
