/**
 * V90 — Optional portfolio cache (snapshots only, not source of truth)
 */

import type { PortfolioDashboard } from "./portfolio.types";

export type PortfolioPriorityAction = {
  id: string;
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: "record_priority";
  timestamp: string;
  note?: string;
};

type PortfolioCacheEntry = {
  organizationId: string;
  dashboard: PortfolioDashboard | null;
  priorityActions: PortfolioPriorityAction[];
  cachedAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __v90PortfolioCache: Map<string, PortfolioCacheEntry> | undefined;
}

function cache(): Map<string, PortfolioCacheEntry> {
  globalThis.__v90PortfolioCache ||= new Map();
  return globalThis.__v90PortfolioCache;
}

export function getCachedPortfolioDashboard(
  organizationId: string,
): PortfolioCacheEntry | null {
  const entry = cache().get(organizationId);
  if (!entry?.dashboard) return null;
  return entry;
}

export function setCachedPortfolioDashboard(
  organizationId: string,
  dashboard: PortfolioDashboard,
): void {
  const existing = cache().get(organizationId);
  cache().set(organizationId, {
    organizationId,
    dashboard,
    priorityActions: existing?.priorityActions ?? [],
    cachedAt: new Date().toISOString(),
  });
}

export function recordPortfolioPriorityAction(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): PortfolioPriorityAction {
  const entry: PortfolioPriorityAction = {
    id: `prio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "record_priority",
    timestamp: new Date().toISOString(),
    note: input.note,
  };

  const existing = cache().get(input.organizationId);
  if (existing) {
    existing.priorityActions.push(entry);
    cache().set(input.organizationId, existing);
  } else {
    cache().set(input.organizationId, {
      organizationId: input.organizationId,
      dashboard: null,
      priorityActions: [entry],
      cachedAt: new Date().toISOString(),
    });
  }

  return entry;
}

export function listPortfolioPriorityActions(
  sessionId: string,
  organizationId: string,
): PortfolioPriorityAction[] {
  const entry = cache().get(organizationId);
  if (!entry) return [];
  return entry.priorityActions.filter((a) => a.sessionId === sessionId);
}

export function clearPortfolioCacheForTests(): void {
  globalThis.__v90PortfolioCache = new Map();
}
