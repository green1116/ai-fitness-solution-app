/**
 * V65 — Traffic analyzer
 */

import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import type { TrafficQuality, TrafficSourceReport } from "../growth-marketing.types";

function scoreQuality(conversionRate: number): TrafficQuality {
  if (conversionRate >= 8) return "high";
  if (conversionRate >= 4) return "medium";
  return "low";
}

export function analyzeTrafficSources(): TrafficSourceReport[] {
  const events = getGrowthEventsSnapshot();
  const metrics = aggregateGrowthMetrics();
  const bySource = new Map<string, { visits: number; signups: number }>();

  for (const e of events) {
    const source = e.utmSource ?? e.source ?? "direct";
    const entry = bySource.get(source) ?? { visits: 0, signups: 0 };
    if (e.event === "visitor.landing" || e.event === "visitor.utm") entry.visits += 1;
    if (e.event === "user.signup") entry.signups += 1;
    bySource.set(source, entry);
  }

  if (bySource.size === 0) {
    bySource.set("organic", { visits: metrics.visitors, signups: metrics.signups });
  }

  return [...bySource.entries()].map(([source, data]) => {
    const conversionRate = data.visits > 0 ? Math.round((data.signups / data.visits) * 100) : 0;
    return {
      source,
      visits: data.visits,
      signups: data.signups,
      conversionRate,
      quality: scoreQuality(conversionRate),
    };
  });
}

export function analyzeTrafficQuality(): { overall: TrafficQuality; reports: TrafficSourceReport[] } {
  const reports = analyzeTrafficSources();
  const high = reports.filter((r) => r.quality === "high").length;
  const overall: TrafficQuality = high >= reports.length / 2 ? "high" : high > 0 ? "medium" : "low";
  return { overall, reports };
}
