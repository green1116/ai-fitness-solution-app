/**
 * V65 — Traffic source engine
 */

import { analyzeTrafficSources, analyzeTrafficQuality } from "./traffic.analyzer";

export function optimizeChannelAllocation(): Record<string, number> {
  const reports = analyzeTrafficSources();
  const allocation: Record<string, number> = {};
  let totalScore = 0;

  for (const r of reports) {
    const score = r.quality === "high" ? 3 : r.quality === "medium" ? 2 : 1;
    allocation[r.source] = score;
    totalScore += score;
  }

  for (const key of Object.keys(allocation)) {
    allocation[key] = totalScore > 0 ? Math.round((allocation[key] / totalScore) * 100) : 0;
  }

  return allocation;
}

export function recommendTrafficSources(): string[] {
  const { overall, reports } = analyzeTrafficQuality();
  const actions: string[] = [];

  for (const r of reports) {
    if (r.quality === "low") actions.push(`Reduce spend on low-quality source: ${r.source}`);
    if (r.quality === "high") actions.push(`Scale high-quality source: ${r.source} (${r.conversionRate}% conv)`);
  }

  if (overall === "low") actions.push("Shift budget from ads to SEO content cluster");
  return actions;
}
