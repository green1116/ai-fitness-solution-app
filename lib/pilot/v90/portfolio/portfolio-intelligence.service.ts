/**
 * V90 — Portfolio intelligence metrics (derived from segmented accounts)
 */

import type { PortfolioAccountRow, PortfolioSegment, SegmentIntelligence } from "./portfolio.types";
import { SEGMENT_LABELS } from "./portfolio.types";

function avg(vals: number[]): number {
  return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

export function computeChurnExposure(row: PortfolioAccountRow): number {
  if (row.segments.includes("churn_rescue") || row.segments.includes("at_risk")) {
    return row.expectedValue;
  }
  return Math.round(row.expectedValue * (row.riskScore / 200));
}

export function computeRankScore(row: PortfolioAccountRow): number {
  let score = row.expectedValue * 0.4;
  score += row.expansionPotential * 0.3;
  score += row.segmentHealthScore * 100;
  if (row.segments.includes("churn_rescue")) score += 5000;
  if (row.segments.includes("expansion_ready")) score += 3000;
  if (row.segments.includes("enterprise")) score += 2000;
  score -= row.riskScore * 20;
  return Math.round(score);
}

export function buildSegmentIntelligence(
  accounts: PortfolioAccountRow[],
): SegmentIntelligence[] {
  const allSegments = new Set<PortfolioSegment>();
  for (const row of accounts) {
    for (const seg of row.segments) allSegments.add(seg);
  }

  const cards: SegmentIntelligence[] = [];

  for (const segment of allSegments) {
    const inSegment = accounts.filter((a) => a.segments.includes(segment));
    cards.push({
      segment,
      label: SEGMENT_LABELS[segment],
      accountCount: inSegment.length,
      segmentHealthScore: avg(inSegment.map((a) => a.segmentHealthScore)),
      expansionPotential: inSegment.reduce((s, a) => s + a.expansionPotential, 0),
      churnExposure: inSegment.reduce((s, a) => s + a.churnExposure, 0),
      expectedValue: inSegment.reduce((s, a) => s + a.expectedValue, 0),
      readOnly: true,
    });
  }

  return cards.sort((a, b) => b.expectedValue - a.expectedValue);
}
