/**
 * V94 — Decision support recommendations (read from governance + portfolio)
 */

import { buildBoardGovernanceDashboard } from "@/lib/pilot/v92";
import { getGovernanceRecord } from "@/lib/pilot/v92";

import { buildBriefingContent } from "./briefing.service";
import type { BriefingPriority, DecisionSupportItem } from "./briefing.types";

function dueDateForPriority(priority: BriefingPriority): string {
  const days = priority === "critical" ? 3 : priority === "high" ? 7 : 14;
  return new Date(Date.now() + days * 86400000).toISOString();
}

function mapPriority(rankScore: number, riskScore: number): BriefingPriority {
  if (rankScore >= 8000 || riskScore >= 65) return "critical";
  if (rankScore >= 5000 || riskScore >= 50) return "high";
  return "medium";
}

export function buildDecisionSupportList(organizationId: string): DecisionSupportItem[] {
  const governance = buildBoardGovernanceDashboard(organizationId);
  const briefing = buildBriefingContent(organizationId);

  const items: DecisionSupportItem[] = governance.allItems.map((item) => {
    const govRecord = getGovernanceRecord(item.sessionId, organizationId);
    const priority = mapPriority(item.rankScore, item.riskScore);
    const pending = briefing.pendingDecisions.find((p) => p.sessionId === item.sessionId);

    return {
      sessionId: item.sessionId,
      projectName: item.projectName,
      recommendedAction: pending?.recommendedAction ?? item.nextDecision,
      priorityDecision: priority,
      ownerId: govRecord?.executiveOwnerId ?? item.executiveOwnerId,
      ownerName: govRecord?.executiveOwnerName ?? item.executiveOwnerName,
      dueDate: pending?.dueDate ?? dueDateForPriority(priority),
      rankScore: item.rankScore,
      expectedValue: item.expectedValue,
      readOnly: true,
    };
  });

  return items.sort((a, b) => {
    const prio = { critical: 0, high: 1, medium: 2 };
    if (prio[a.priorityDecision] !== prio[b.priorityDecision]) {
      return prio[a.priorityDecision] - prio[b.priorityDecision];
    }
    return b.rankScore - a.rankScore;
  });
}
