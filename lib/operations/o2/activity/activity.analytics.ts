/**
 * Operations O2 — Activity analytics
 */

import { listActivityEvents } from "./activity.event";
import type {
  ActivityAnalytics,
  AnalyzeActivityInput,
} from "./activity.types";

const analytics = new Map<string, ActivityAnalytics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAnalytics(entry: ActivityAnalytics): ActivityAnalytics {
  return { ...entry };
}

export function analyzeActivity(
  input: AnalyzeActivityInput,
): ActivityAnalytics {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("activityAnalytics.accountRef is required");

  const events = listActivityEvents({ accountRef });
  if (events.length < 1) {
    throw new Error(`no activity events for account: ${accountRef}`);
  }

  const eventCount = events.length;
  const loginCount = events.filter((e) => e.kind === "LOGIN").length;
  const featureUseCount = events.filter(
    (e) => e.kind === "FEATURE_USE",
  ).length;
  const intensityScore = Math.max(
    0,
    Math.min(100, Math.round(loginCount * 10 + featureUseCount * 15)),
  );

  const id = input.id?.trim() || createId("o2aan");
  if (analytics.has(id)) {
    throw new Error(`activity analytics already exists: ${id}`);
  }

  const entry: ActivityAnalytics = {
    id,
    accountRef,
    eventCount,
    loginCount,
    featureUseCount,
    intensityScore,
    detail: `events=${eventCount} intensity=${intensityScore}`,
    analyzedAt: nowIso(),
  };
  analytics.set(id, entry);
  return cloneAnalytics(entry);
}

export function getActivityAnalytics(
  id: string,
): ActivityAnalytics | undefined {
  const entry = analytics.get(id.trim());
  return entry ? cloneAnalytics(entry) : undefined;
}

export function listActivityAnalytics(filter?: {
  accountRef?: string;
}): ActivityAnalytics[] {
  let result = [...analytics.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((a) => a.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAnalytics);
}

export function clearActivityAnalytics(): void {
  analytics.clear();
}
