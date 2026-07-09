/**
 * V93 — Executive reporting summaries (read from V92 governance + V90 portfolio)
 */

import { buildPortfolioDashboard } from "@/lib/pilot/v90";
import {
  buildBoardGovernanceDashboard,
  listGovernanceActions,
  listGovernanceRecordsForOrg,
} from "@/lib/pilot/v92";
import type { GovernanceActionEntry } from "@/lib/pilot/v92";

import { getExportsCount, listBoardPackets } from "./report-cache";
import type {
  DecisionSummary,
  DrilldownLink,
  ExecutiveMetrics,
  ExecutiveSummary,
  PortfolioSummary,
  RiskSummary,
  ValueSummary,
} from "./reporting.types";

function avg(vals: number[]): number {
  return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

export function buildPortfolioSummary(organizationId: string): PortfolioSummary {
  const portfolio = buildPortfolioDashboard(organizationId);
  const governance = buildBoardGovernanceDashboard(organizationId);

  return {
    totalAccounts: portfolio.summary.totalAccounts,
    enterprise: portfolio.summary.enterprise,
    expansionReady: portfolio.summary.expansionReady,
    activeGovernance: governance.summary.total,
    avgHealthScore: portfolio.summary.avgHealthScore,
    readOnly: true,
  };
}

export function buildRiskSummary(organizationId: string): RiskSummary {
  const portfolio = buildPortfolioDashboard(organizationId);
  const governance = buildBoardGovernanceDashboard(organizationId);
  const accounts = portfolio.rankedAccounts;

  return {
    atRisk: governance.summary.atRisk,
    rescue: governance.summary.rescue,
    blocked: governance.summary.blocked,
    totalChurnExposure: accounts.reduce((s, a) => s + a.churnExposure, 0),
    avgRiskScore: avg(accounts.map((a) => a.riskScore)),
    readOnly: true,
  };
}

export function buildValueSummary(organizationId: string): ValueSummary {
  const portfolio = buildPortfolioDashboard(organizationId);
  const accounts = portfolio.rankedAccounts;

  return {
    totalExpectedValue: portfolio.summary.totalExpectedValue,
    totalExpansionPotential: accounts.reduce((s, a) => s + a.expansionPotential, 0),
    topAccountValue: accounts[0]?.expectedValue ?? 0,
    readOnly: true,
  };
}

export function buildDecisionSummary(organizationId: string): DecisionSummary {
  const governance = buildBoardGovernanceDashboard(organizationId);
  const records = listGovernanceRecordsForOrg(organizationId);
  const allActions = records.flatMap((r) => listGovernanceActions(r.sessionId));
  const decisions = allActions.filter(
    (a) =>
      a.action === "record_decision" ||
      a.action === "mark_approved" ||
      a.action === "mark_deferred" ||
      a.action === "mark_blocked",
  );

  return {
    approved: governance.summary.approved,
    deferred: governance.summary.deferred,
    blocked: governance.summary.blocked,
    pending: governance.summary.total,
    totalDecisions: decisions.length,
    readOnly: true,
  };
}

export function buildExecutiveSummary(organizationId: string): ExecutiveSummary {
  return {
    portfolio: buildPortfolioSummary(organizationId),
    risk: buildRiskSummary(organizationId),
    value: buildValueSummary(organizationId),
    decisions: buildDecisionSummary(organizationId),
    readOnly: true,
  };
}

export function buildExecutiveMetrics(organizationId: string): ExecutiveMetrics {
  const governance = buildBoardGovernanceDashboard(organizationId);
  const packets = listBoardPackets(organizationId);
  const records = listGovernanceRecordsForOrg(organizationId);
  const decisionCount = records.reduce(
    (s, r) => s + listGovernanceActions(r.sessionId).length,
    0,
  );

  return {
    governanceQueueSize: governance.summary.total,
    decisionsRecorded: decisionCount,
    packetsGenerated: packets.length,
    exportsCount: getExportsCount(organizationId),
    reviewedPackets: packets.filter((p) => p.status === "reviewed" || p.status === "exported")
      .length,
    readOnly: true,
  };
}

export function buildDrilldownLinks(organizationId: string): DrilldownLink[] {
  const governance = buildBoardGovernanceDashboard(organizationId);

  return governance.allItems.slice(0, 10).map((item) => ({
    sessionId: item.sessionId,
    label: item.projectName ?? item.sessionId.slice(0, 8),
    href: `/pilot/board-governance?session=${item.sessionId}`,
    readOnly: true,
  }));
}

export function collectRecentDecisions(
  organizationId: string,
  limit = 20,
): GovernanceActionEntry[] {
  const records = listGovernanceRecordsForOrg(organizationId);
  const all = records.flatMap((r) => listGovernanceActions(r.sessionId));
  return all.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
}
