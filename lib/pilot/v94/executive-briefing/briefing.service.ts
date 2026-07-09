/**
 * V94 — Executive briefing content (read from V93 reporting + V92 governance)
 */

import { buildBoardGovernanceDashboard } from "@/lib/pilot/v92";
import { buildPortfolioDashboard } from "@/lib/pilot/v90";
import { buildExecutiveSummary } from "@/lib/pilot/v93";

import type {
  BriefingContent,
  BriefingPriority,
  KeyOpportunityItem,
  KeyRiskItem,
  PendingDecisionItem,
} from "./briefing.types";

function priorityFromRisk(riskScore: number, exposure: number): BriefingPriority {
  if (riskScore >= 65 || exposure >= 50_000) return "critical";
  if (riskScore >= 50 || exposure >= 25_000) return "high";
  return "medium";
}

function priorityFromRank(rankScore: number): BriefingPriority {
  if (rankScore >= 8000) return "critical";
  if (rankScore >= 5000) return "high";
  return "medium";
}

function defaultDueDate(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}

export function buildBriefingContent(organizationId: string): BriefingContent {
  const portfolio = buildPortfolioDashboard(organizationId);
  const governance = buildBoardGovernanceDashboard(organizationId);
  const summary = buildExecutiveSummary(organizationId);

  const keyRisks: KeyRiskItem[] = governance.allItems
    .filter(
      (i) =>
        i.executiveQueue === "rescue" ||
        i.executiveQueue === "at_risk" ||
        i.riskScore >= 55,
    )
    .slice(0, 8)
    .map((item) => ({
      sessionId: item.sessionId,
      label: item.projectName ?? item.sessionId.slice(0, 8),
      severity: priorityFromRisk(item.riskScore, item.expectedValue),
      exposure: item.opsItem.portfolioAccount.churnExposure,
      riskScore: item.riskScore,
      readOnly: true as const,
    }));

  const keyOpportunities: KeyOpportunityItem[] = portfolio.rankedAccounts
    .filter((a) => a.segments.includes("expansion_ready") || a.segments.includes("enterprise"))
    .slice(0, 8)
    .map((a) => ({
      sessionId: a.sessionId,
      label: a.projectName ?? a.sessionId.slice(0, 8),
      value: a.expectedValue,
      expansionPotential: a.expansionPotential,
      readOnly: true as const,
    }));

  const pendingDecisions: PendingDecisionItem[] = governance.allItems
    .slice(0, 10)
    .map((item) => {
      const priority = priorityFromRank(item.rankScore);
      const dueDays = priority === "critical" ? 3 : priority === "high" ? 7 : 14;
      return {
        sessionId: item.sessionId,
        label: item.projectName ?? item.sessionId.slice(0, 8),
        priority,
        ownerId: item.executiveOwnerId,
        ownerName: item.executiveOwnerName,
        dueDate: defaultDueDate(dueDays),
        recommendedAction: item.nextDecision,
        readOnly: true as const,
      };
    });

  const narrative = [
    `组合 ${summary.portfolio.totalAccounts} 个账户，预期价值 ¥${summary.value.totalExpectedValue.toLocaleString("zh-CN")}。`,
    `风险敞口 ¥${summary.risk.totalChurnExposure.toLocaleString("zh-CN")}，${keyRisks.length} 项需关注。`,
    `${keyOpportunities.length} 项扩展机会，${pendingDecisions.length} 项待决。`,
  ].join(" ");

  return {
    narrative,
    keyRisks,
    keyOpportunities,
    pendingDecisions,
    readOnly: true,
  };
}
