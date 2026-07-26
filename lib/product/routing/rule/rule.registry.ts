/**
 * Product Routing — Rule registry
 */

import { getRoute } from "../registry/route.registry";
import type { DefineRoutingRuleInput, RoutingRule } from "./rule.types";

const rules = new Map<string, RoutingRule>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRule(rule: RoutingRule): RoutingRule {
  return { ...rule, metadata: { ...rule.metadata } };
}

export function defineRoutingRule(input: DefineRoutingRuleInput): RoutingRule {
  const routeId = input.routeId.trim();
  const channelKey = input.channelKey.trim().toUpperCase();
  if (!routeId) throw new Error("rule.routeId is required");
  if (!channelKey) throw new Error("rule.channelKey is required");
  if (!Number.isFinite(input.priority) || input.priority < 1) {
    throw new Error("rule.priority must be >= 1");
  }
  if (!getRoute(routeId)) throw new Error(`route not found: ${routeId}`);

  const duplicate = [...rules.values()].find(
    (r) => r.routeId === routeId && r.channelKey === channelKey,
  );
  if (duplicate) {
    throw new Error(`rule already exists: ${channelKey}`);
  }

  const id = input.id?.trim() || createId("rtrule");
  if (rules.has(id)) throw new Error(`rule already exists: ${id}`);

  const rule: RoutingRule = {
    id,
    routeId,
    channelKey,
    priority: Math.floor(input.priority),
    enabled: input.enabled !== false,
    detail: `channel=${channelKey} priority=${Math.floor(input.priority)}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  rules.set(id, rule);
  return cloneRule(rule);
}

export function getRoutingRule(id: string): RoutingRule | undefined {
  const rule = rules.get(id.trim());
  return rule ? cloneRule(rule) : undefined;
}

export function listRoutingRules(filter?: {
  routeId?: string;
}): RoutingRule[] {
  let result = [...rules.values()];
  if (filter?.routeId) {
    const routeId = filter.routeId.trim();
    result = result.filter((r) => r.routeId === routeId);
  }
  return result
    .slice()
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))
    .map(cloneRule);
}

export function clearRoutingRules(): void {
  rules.clear();
}
