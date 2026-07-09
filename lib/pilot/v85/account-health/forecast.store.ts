/**
 * V85 — Optional forecast cache (snapshots only, not source of truth)
 */

import type { AccountHealthRow, RenewalForecast } from "./account.types";

type ForecastCacheEntry = {
  organizationId: string;
  sessionId: string;
  forecast: RenewalForecast;
  scores: AccountHealthRow["scores"];
  cachedAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __v85ForecastCache: Map<string, ForecastCacheEntry> | undefined;
}

function cache(): Map<string, ForecastCacheEntry> {
  globalThis.__v85ForecastCache ||= new Map();
  return globalThis.__v85ForecastCache;
}

function cacheKey(organizationId: string, sessionId: string): string {
  return `${organizationId}:${sessionId}`;
}

export function getCachedForecast(
  organizationId: string,
  sessionId: string,
): ForecastCacheEntry | null {
  return cache().get(cacheKey(organizationId, sessionId)) ?? null;
}

export function setCachedForecast(entry: ForecastCacheEntry): void {
  cache().set(cacheKey(entry.organizationId, entry.sessionId), entry);
}

export function clearForecastCacheForTests(): void {
  globalThis.__v85ForecastCache = new Map();
}

export type { ForecastCacheEntry };
