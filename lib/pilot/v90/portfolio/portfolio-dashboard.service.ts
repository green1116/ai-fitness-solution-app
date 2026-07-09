/**
 * V90 — Portfolio dashboard (read expansion / growth / revenue / health)
 */

import { buildAccountHealthDashboard, buildAccountHealthDetail } from "@/lib/pilot/v85";
import { buildGrowthPlanningDashboard } from "@/lib/pilot/v88";
import { buildExpansionOpsDashboard, listExpansionOpsActions } from "@/lib/pilot/v89";
import { buildRevenueOpsDashboard } from "@/lib/pilot/v87";
import { listGrowthOpsActions } from "@/lib/pilot/v88";

import { buildPortfolioAccountRow } from "./portfolio-account.service";
import { buildSegmentIntelligence } from "./portfolio-intelligence.service";
import {
  getCachedPortfolioDashboard,
  listPortfolioPriorityActions,
  setCachedPortfolioDashboard,
} from "./portfolio.cache";
import {
  buildPortfolioPrioritization,
  rankPortfolioAccounts,
} from "./prioritization.service";
import type { PortfolioAccountDetail, PortfolioDashboard } from "./portfolio.types";
import { V90_PORTFOLIO_VERSION } from "./portfolio.types";

export function buildPortfolioDashboard(
  organizationId: string,
  options?: { useCache?: boolean },
): PortfolioDashboard {
  if (options?.useCache) {
    const cached = getCachedPortfolioDashboard(organizationId);
    if (cached?.dashboard) return cached.dashboard;
  }

  const health = buildAccountHealthDashboard(organizationId);
  const expansion = buildExpansionOpsDashboard(organizationId);
  const growth = buildGrowthPlanningDashboard(organizationId);
  const revenue = buildRevenueOpsDashboard(organizationId);

  const accounts = health.accounts.map((account) =>
    buildPortfolioAccountRow({
      account,
      expansionItem:
        expansion.allItems.find((i) => i.sessionId === account.sessionId) ?? null,
      growthItem: growth.allItems.find((i) => i.sessionId === account.sessionId) ?? null,
      revenueItem: revenue.allItems.find((i) => i.sessionId === account.sessionId) ?? null,
    }),
  );

  const rankedAccounts = rankPortfolioAccounts(accounts);
  const segmentCards = buildSegmentIntelligence(rankedAccounts);
  const prioritization = buildPortfolioPrioritization(rankedAccounts);

  const avg = (vals: number[]) =>
    vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;

  const dashboard: PortfolioDashboard = {
    version: V90_PORTFOLIO_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    segmentCards,
    prioritization,
    rankedAccounts,
    summary: {
      totalAccounts: rankedAccounts.length,
      enterprise: rankedAccounts.filter((a) => a.segments.includes("enterprise")).length,
      highValue: rankedAccounts.filter((a) => a.segments.includes("high_value")).length,
      atRisk: rankedAccounts.filter((a) => a.segments.includes("at_risk")).length,
      expansionReady: rankedAccounts.filter((a) => a.segments.includes("expansion_ready"))
        .length,
      churnRescue: rankedAccounts.filter((a) => a.segments.includes("churn_rescue")).length,
      avgHealthScore: avg(rankedAccounts.map((a) => a.segmentHealthScore)),
      totalExpectedValue: rankedAccounts.reduce((s, a) => s + a.expectedValue, 0),
    },
    readOnly: true,
  };

  if (options?.useCache) {
    setCachedPortfolioDashboard(organizationId, dashboard);
  }

  return dashboard;
}

export function buildPortfolioAccountDetail(
  sessionId: string,
  organizationId: string,
): PortfolioAccountDetail {
  const dashboard = buildPortfolioDashboard(organizationId);
  const account = dashboard.rankedAccounts.find((a) => a.sessionId === sessionId);
  if (!account) throw new Error("NOT_RELEASED");

  void buildAccountHealthDetail(sessionId, organizationId);

  const expansionActions = listExpansionOpsActions(sessionId).map((a) => ({
    id: a.id,
    action: a.action,
    timestamp: a.timestamp,
    note: a.note,
    source: "expansion" as const,
  }));

  const growthActions = listGrowthOpsActions(sessionId).map((a) => ({
    id: a.id,
    action: a.action,
    timestamp: a.timestamp,
    note: a.note,
    source: "growth" as const,
  }));

  const portfolioActions = listPortfolioPriorityActions(sessionId, organizationId).map(
    (a) => ({
      id: a.id,
      action: a.action,
      timestamp: a.timestamp,
      note: a.note,
      source: "portfolio" as const,
    }),
  );

  const actionHistory = [...expansionActions, ...growthActions, ...portfolioActions].sort(
    (a, b) => b.timestamp.localeCompare(a.timestamp),
  );

  return {
    sessionId,
    account,
    actionHistory,
    readOnly: true,
  };
}
