/**
 * Product Routing — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listRoutingFallbacks } from "../fallback/fallback.registry";
import { getRoute } from "../registry/route.registry";
import { listRoutingResolutions } from "../resolution/resolution.registry";
import { listRoutingRules } from "../rule/rule.registry";
import { listRoutingStrategies } from "../strategy/strategy.registry";

export type RoutingReleaseManifest = {
  id: string;
  routeId: string;
  routingKey: string;
  checksum: string;
  ruleId: string;
  strategyId: string;
  fallbackId: string;
  resolutionId: string;
  createdAt: string;
};

const releases = new Map<string, RoutingReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(release: RoutingReleaseManifest): RoutingReleaseManifest {
  return { ...release };
}

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function createRoutingReleaseManifest(input: {
  id?: string;
  routeId: string;
}): RoutingReleaseManifest {
  const routeId = input.routeId.trim();
  if (!routeId) throw new Error("manifest.routeId is required");

  const route = getRoute(routeId);
  if (!route) throw new Error(`route not found: ${routeId}`);

  const rules = listRoutingRules({ routeId });
  if (rules.length < 1) throw new Error("rule missing");
  const strategies = listRoutingStrategies({ routeId });
  if (strategies.length < 1) throw new Error("strategy missing");
  const fallbacks = listRoutingFallbacks({ routeId });
  if (fallbacks.length < 1) throw new Error("fallback missing");
  const resolutions = listRoutingResolutions({ routeId });
  const routed = resolutions.find(
    (r) => r.verdict === "ROUTED" || r.verdict === "FALLBACK",
  );
  if (!routed) throw new Error("resolution missing");

  const payload = {
    routingKey: route.routingKey,
    kind: route.kind,
    preferenceKey: route.preferenceKey,
    templateKey: route.templateKey,
    rules: rules
      .map((r) => ({
        channelKey: r.channelKey,
        priority: r.priority,
        enabled: r.enabled,
      }))
      .sort((a, b) => a.priority - b.priority),
    strategy: strategies[0].strategy,
    fallback: {
      mode: fallbacks[0].mode,
      fallbackChannelKey: fallbacks[0].fallbackChannelKey ?? "",
    },
    resolution: {
      verdict: routed.verdict,
      selectedChannelKey: routed.selectedChannelKey,
      usedFallback: routed.usedFallback,
    },
  };

  const id = input.id?.trim() || createId("rtrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: RoutingReleaseManifest = {
    id,
    routeId,
    routingKey: route.routingKey,
    checksum: checksumPayload(payload),
    ruleId: rules[0].id,
    strategyId: strategies[0].id,
    fallbackId: fallbacks[0].id,
    resolutionId: routed.id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getRoutingReleaseManifest(
  id: string,
): RoutingReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listRoutingReleaseManifests(): RoutingReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearRoutingReleaseManifests(): void {
  releases.clear();
}
