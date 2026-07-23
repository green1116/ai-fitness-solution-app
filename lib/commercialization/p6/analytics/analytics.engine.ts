/**
 * Commercialization P6 — Analytics engine
 */

import { listRevenueStreams } from "../revenue/revenue.registry";
import type {
  AnalyticsSnapshot,
  RunAnalyticsInput,
} from "./analytics.types";

const snapshots = new Map<string, AnalyticsSnapshot>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSnapshot(snapshot: AnalyticsSnapshot): AnalyticsSnapshot {
  return {
    ...snapshot,
    insights: [...snapshot.insights],
  };
}

export function runRevenueAnalytics(
  input: RunAnalyticsInput = {},
): AnalyticsSnapshot {
  const streams = listRevenueStreams(
    input.accountRef ? { accountRef: input.accountRef } : undefined,
  );
  const revenueTotal = streams.reduce((sum, s) => sum + s.amount, 0);
  const subscription = streams
    .filter((s) => s.kind === "SUBSCRIPTION")
    .reduce((sum, s) => sum + s.amount, 0);
  const services = streams
    .filter((s) => s.kind === "SERVICES")
    .reduce((sum, s) => sum + s.amount, 0);

  const growthRate =
    revenueTotal === 0
      ? 0
      : Math.round((subscription / Math.max(1, revenueTotal)) * 100);
  const churnRiskIndex = Math.max(
    5,
    Math.min(95, 60 - Math.round(subscription / Math.max(1, revenueTotal / 2))),
  );
  const expansionIndex = Math.min(
    100,
    Math.round((services / Math.max(1, revenueTotal)) * 100) +
      Math.round(streams.length * 5),
  );

  const insights: string[] = [];
  if (growthRate >= 50) insights.push("subscription-weighted-growth");
  if (churnRiskIndex >= 50) insights.push("watch-churn-risk");
  if (expansionIndex >= 40) insights.push("expansion-opportunity");
  if (insights.length === 0) insights.push("baseline-stable");

  const id = input.id?.trim() || createId("ranl");
  if (snapshots.has(id)) {
    throw new Error(`analytics snapshot already exists: ${id}`);
  }

  const snapshot: AnalyticsSnapshot = {
    id,
    accountRef: input.accountRef?.trim() || undefined,
    revenueTotal,
    growthRate,
    churnRiskIndex,
    expansionIndex,
    insights,
    detail: `growth=${growthRate} churnRisk=${churnRiskIndex} expansion=${expansionIndex}`,
    analyzedAt: nowIso(),
  };
  snapshots.set(id, snapshot);
  return cloneSnapshot(snapshot);
}

export function getAnalyticsSnapshot(
  id: string,
): AnalyticsSnapshot | undefined {
  const snapshot = snapshots.get(id.trim());
  return snapshot ? cloneSnapshot(snapshot) : undefined;
}

export function listAnalyticsSnapshots(filter?: {
  accountRef?: string;
}): AnalyticsSnapshot[] {
  let result = [...snapshots.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((s) => s.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSnapshot);
}

export function clearAnalyticsSnapshots(): void {
  snapshots.clear();
}
