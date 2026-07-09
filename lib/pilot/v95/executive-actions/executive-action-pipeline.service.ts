/**
 * V95 — Executive action queue (read from V94 briefing / decision support)
 */

import { getIntakeSession } from "@/lib/pilot/v80";
import { buildBoardGovernanceDashboard } from "@/lib/pilot/v92";
import {
  buildBriefingContent,
  buildDecisionSupportList,
  type BriefingPriority,
} from "@/lib/pilot/v94";

import { getExecutiveActionRecord } from "./executive-action.store";
import type {
  ExecutiveActionOutcome,
  ExecutiveActionQueue,
  ExecutiveActionQueueItem,
  ExecutiveActionRecord,
} from "./executive-action.types";

function defaultRecord(
  sessionId: string,
  organizationId: string,
  priority: BriefingPriority,
  recommendedAction: string,
  dueDate: string,
): ExecutiveActionRecord {
  const now = new Date().toISOString();
  return {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    priority,
    recommendedAction,
    dueDate,
    actionCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function resolveRecord(
  sessionId: string,
  organizationId: string,
  priority: BriefingPriority,
  recommendedAction: string,
  dueDate: string,
): ExecutiveActionRecord {
  return (
    getExecutiveActionRecord(sessionId, organizationId) ??
    defaultRecord(sessionId, organizationId, priority, recommendedAction, dueDate)
  );
}

function isOverdue(dueDate: string, outcome: ExecutiveActionOutcome): boolean {
  if (outcome !== "open") return false;
  return new Date(dueDate).getTime() < Date.now();
}

export function classifyExecutiveActionQueue(input: {
  sessionId: string;
  outcome: ExecutiveActionOutcome;
  dueDate: string;
  priority: BriefingPriority;
  isRisk: boolean;
  isOpportunity: boolean;
}): ExecutiveActionQueue | null {
  const { outcome, dueDate, isRisk, isOpportunity } = input;

  if (outcome === "acted" || outcome === "deferred" || outcome === "closed") {
    return null;
  }

  if (isOverdue(dueDate, outcome)) return "overdue_action";
  if (isRisk) return "risk_mitigation";
  if (isOpportunity) return "opportunity_capture";
  return "priority_decision";
}

function deriveRecommendedAction(
  record: ExecutiveActionRecord,
  queue: ExecutiveActionQueue,
): string {
  if (record.outcome === "acted") return "已执行";
  if (record.outcome === "deferred") return "已延期";
  if (record.outcome === "closed") return "已关闭";
  if (!record.executiveOwnerId) return "分配高管负责人";

  switch (queue) {
    case "overdue_action":
      return "紧急处理逾期决策";
    case "risk_mitigation":
      return "风险缓解行动";
    case "opportunity_capture":
      return "推进机会捕获";
    case "priority_decision":
      return record.recommendedAction;
  }
}

export function buildExecutiveActionQueueItem(
  input: {
    sessionId: string;
    organizationId: string;
    projectName?: string;
    releasePackageId?: string;
    priority: BriefingPriority;
    recommendedAction: string;
    dueDate: string;
    rankScore: number;
    expectedValue: number;
    riskScore: number;
    isRisk: boolean;
    isOpportunity: boolean;
  },
  actionQueue: ExecutiveActionQueue,
  queuePosition: number,
): ExecutiveActionQueueItem {
  const record = resolveRecord(
    input.sessionId,
    input.organizationId,
    input.priority,
    input.recommendedAction,
    input.dueDate,
  );

  const session = getIntakeSession(input.sessionId);

  return {
    sessionId: input.sessionId,
    releasePackageId: input.releasePackageId ?? session?.releasePackageId,
    projectName: input.projectName,
    actionQueue,
    queuePosition,
    priority: input.priority,
    recommendedAction: deriveRecommendedAction(record, actionQueue),
    dueDate: record.dueDate,
    executiveOwnerId: record.executiveOwnerId,
    executiveOwnerName: record.executiveOwnerName,
    status: record.status,
    outcome: record.outcome,
    isOverdue: isOverdue(record.dueDate, record.outcome),
    rankScore: input.rankScore,
    expectedValue: input.expectedValue,
    riskScore: input.riskScore,
    actionRecord: record,
    readOnly: true,
  };
}

export function buildExecutiveActionPipeline(organizationId: string): {
  priorityDecision: ExecutiveActionQueueItem[];
  riskMitigation: ExecutiveActionQueueItem[];
  opportunityCapture: ExecutiveActionQueueItem[];
  overdueAction: ExecutiveActionQueueItem[];
  allItems: ExecutiveActionQueueItem[];
} {
  const decisionSupport = buildDecisionSupportList(organizationId);
  const briefing = buildBriefingContent(organizationId);
  const governance = buildBoardGovernanceDashboard(organizationId);

  const riskSessionIds = new Set(briefing.keyRisks.map((r) => r.sessionId));
  const opportunitySessionIds = new Set(briefing.keyOpportunities.map((o) => o.sessionId));

  const govBySession = new Map(governance.allItems.map((i) => [i.sessionId, i]));

  const items: ExecutiveActionQueueItem[] = [];

  for (const decision of decisionSupport) {
    const gov = govBySession.get(decision.sessionId);
    const stored = getExecutiveActionRecord(decision.sessionId, organizationId);
    const isRisk =
      riskSessionIds.has(decision.sessionId) ||
      gov?.executiveQueue === "rescue" ||
      gov?.executiveQueue === "at_risk";
    const isOpportunity = opportunitySessionIds.has(decision.sessionId);

    const queue = classifyExecutiveActionQueue({
      sessionId: decision.sessionId,
      outcome: stored?.outcome ?? "open",
      dueDate: stored?.dueDate ?? decision.dueDate,
      priority: decision.priorityDecision,
      isRisk,
      isOpportunity,
    });

    if (!queue) continue;

    items.push(
      buildExecutiveActionQueueItem(
        {
          sessionId: decision.sessionId,
          organizationId,
          projectName: decision.projectName,
          priority: decision.priorityDecision,
          recommendedAction: decision.recommendedAction,
          dueDate: decision.dueDate,
          rankScore: decision.rankScore,
          expectedValue: decision.expectedValue,
          riskScore: gov?.riskScore ?? 0,
          isRisk,
          isOpportunity,
        },
        queue,
        0,
      ),
    );
  }

  const priorityDecision: ExecutiveActionQueueItem[] = [];
  const riskMitigation: ExecutiveActionQueueItem[] = [];
  const opportunityCapture: ExecutiveActionQueueItem[] = [];
  const overdueAction: ExecutiveActionQueueItem[] = [];

  for (const item of items.sort((a, b) => b.rankScore - a.rankScore)) {
    switch (item.actionQueue) {
      case "priority_decision":
        priorityDecision.push({ ...item, queuePosition: priorityDecision.length + 1 });
        break;
      case "risk_mitigation":
        riskMitigation.push({ ...item, queuePosition: riskMitigation.length + 1 });
        break;
      case "opportunity_capture":
        opportunityCapture.push({ ...item, queuePosition: opportunityCapture.length + 1 });
        break;
      case "overdue_action":
        overdueAction.push({ ...item, queuePosition: overdueAction.length + 1 });
        break;
    }
  }

  const allItems = [
    ...overdueAction,
    ...priorityDecision,
    ...riskMitigation,
    ...opportunityCapture,
  ].map((item, idx) => ({ ...item, queuePosition: idx + 1 }));

  return {
    priorityDecision,
    riskMitigation,
    opportunityCapture,
    overdueAction,
    allItems,
  };
}
