/**
 * V90 — Portfolio prioritization (ranked accounts by segment)
 */

import type {
  PortfolioAccountRow,
  PortfolioPrioritization,
  PortfolioSegment,
} from "./portfolio.types";
import { SEGMENT_NEXT_ACTIONS } from "./portfolio.types";
import { computeRankScore } from "./portfolio-intelligence.service";

export function rankPortfolioAccounts(
  accounts: PortfolioAccountRow[],
): PortfolioAccountRow[] {
  const scored = accounts.map((row) => ({
    ...row,
    rankScore: computeRankScore(row),
  }));

  scored.sort((a, b) => b.rankScore - a.rankScore);
  scored.forEach((row, i) => {
    row.rankPosition = i + 1;
  });

  return scored;
}

export function buildPortfolioPrioritization(
  rankedAccounts: PortfolioAccountRow[],
): PortfolioPrioritization {
  const topAccounts = rankedAccounts.slice(0, 10);

  const topExpansionTargets = rankedAccounts
    .filter((a) => a.segments.includes("expansion_ready"))
    .slice(0, 10);

  const topRescueAccounts = rankedAccounts
    .filter((a) => a.segments.includes("churn_rescue") || a.segments.includes("at_risk"))
    .slice(0, 10);

  const nextActionBySegment = { ...SEGMENT_NEXT_ACTIONS } as Record<
    PortfolioSegment,
    string
  >;

  return {
    topAccounts,
    topExpansionTargets,
    topRescueAccounts,
    nextActionBySegment,
    readOnly: true,
  };
}
