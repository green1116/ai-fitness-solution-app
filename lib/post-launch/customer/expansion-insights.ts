/**
 * FEAT-43 — Expansion Insights
 * Insight snapshot built on RetentionDashboard + ExpansionQueue.
 */
import {
  buildRetentionDashboard,
  getRetentionDashboard,
} from "./retention-dashboard";
import { listExpansions } from "./expansion-queue";

export const FEAT_43_ID = "FEAT-43" as const;
export const EXPANSION_INSIGHTS_CAPABILITY = "ExpansionInsights" as const;

export type ExpansionInsights = Readonly<{
  wonExpansions: number;
  lostExpansions: number;
  expansionRate: number;
  openExpansions: number;
  updatedAt: string;
}>;

let cachedInsights: ExpansionInsights | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function cloneInsights(row: ExpansionInsights): ExpansionInsights {
  return { ...row };
}

/**
 * Build (and cache) expansion insights from retention dashboard + expansions.
 */
export function buildExpansionInsights(): ExpansionInsights {
  const retention = buildRetentionDashboard();
  const expansions = listExpansions();

  // Ensure get path is reused as well.
  const cachedRetention = getRetentionDashboard();
  void cachedRetention.wonExpansions;

  const wonExpansions = retention.wonExpansions;
  const openExpansions = retention.openExpansions;
  const lostExpansions = expansions.filter(
    (e) => e.expansionStatus === "LOST",
  ).length;
  const closed = wonExpansions + lostExpansions;
  const expansionRate = closed === 0 ? 0 : wonExpansions / closed;

  const insights: ExpansionInsights = {
    wonExpansions,
    lostExpansions,
    expansionRate,
    openExpansions,
    updatedAt: nowIso(),
  };
  cachedInsights = insights;
  return cloneInsights(insights);
}

/**
 * Get the last built expansion insights, or build one if none cached.
 */
export function getExpansionInsights(): ExpansionInsights {
  if (!cachedInsights) {
    return buildExpansionInsights();
  }
  return cloneInsights(cachedInsights);
}

/** Test helper — clears cached expansion insights. */
export function clearExpansionInsights(): void {
  cachedInsights = null;
}
