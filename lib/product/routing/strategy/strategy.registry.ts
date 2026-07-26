/**
 * Product Routing — Strategy registry (declarative, no runtime execution)
 */

import { ROUTING_STRATEGIES } from "../management/management.constants";
import { getRoute } from "../registry/route.registry";
import type {
  AttachRoutingStrategyInput,
  RoutingStrategy,
} from "./strategy.types";

const strategies = new Map<string, RoutingStrategy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStrategy(strategy: RoutingStrategy): RoutingStrategy {
  return { ...strategy, metadata: { ...strategy.metadata } };
}

export function attachRoutingStrategy(
  input: AttachRoutingStrategyInput,
): RoutingStrategy {
  const routeId = input.routeId.trim();
  if (!routeId) throw new Error("strategy.routeId is required");
  if (!(ROUTING_STRATEGIES as readonly string[]).includes(input.strategy)) {
    throw new Error(`invalid routing strategy: ${input.strategy}`);
  }
  if (!getRoute(routeId)) throw new Error(`route not found: ${routeId}`);

  const duplicate = [...strategies.values()].find(
    (s) => s.routeId === routeId,
  );
  if (duplicate) throw new Error(`strategy already exists: ${routeId}`);

  const id = input.id?.trim() || createId("rtstrat");
  if (strategies.has(id)) throw new Error(`strategy already exists: ${id}`);

  const strategy: RoutingStrategy = {
    id,
    routeId,
    strategy: input.strategy,
    detail: `strategy=${input.strategy}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  strategies.set(id, strategy);
  return cloneStrategy(strategy);
}

export function getRoutingStrategy(id: string): RoutingStrategy | undefined {
  const strategy = strategies.get(id.trim());
  return strategy ? cloneStrategy(strategy) : undefined;
}

export function listRoutingStrategies(filter?: {
  routeId?: string;
}): RoutingStrategy[] {
  let result = [...strategies.values()];
  if (filter?.routeId) {
    const routeId = filter.routeId.trim();
    result = result.filter((s) => s.routeId === routeId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneStrategy);
}

export function clearRoutingStrategies(): void {
  strategies.clear();
}
