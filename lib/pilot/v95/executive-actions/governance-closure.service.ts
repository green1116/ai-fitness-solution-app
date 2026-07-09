/**
 * V95 — Governance closure view (read from executive action pipeline + cache)
 */

import { listExecutiveActionsForOrg } from "./executive-action.store";
import { buildExecutiveActionPipeline } from "./executive-action-pipeline.service";
import type {
  ExecutiveActionQueueItem,
  GovernanceClosureView,
} from "./executive-action.types";

function isCompleted(item: ExecutiveActionQueueItem): boolean {
  return (
    item.outcome === "acted" || item.outcome === "deferred" || item.outcome === "closed"
  );
}

function isPending(item: ExecutiveActionQueueItem): boolean {
  return item.outcome === "open";
}

export function buildGovernanceClosureView(organizationId: string): GovernanceClosureView {
  const pipeline = buildExecutiveActionPipeline(organizationId);
  const allStored = [
    ...pipeline.allItems,
    ...buildClosedItemsFromStore(organizationId, pipeline.allItems),
  ];

  const seen = new Set<string>();
  const unique: ExecutiveActionQueueItem[] = [];
  for (const item of allStored) {
    if (seen.has(item.sessionId)) continue;
    seen.add(item.sessionId);
    unique.push(item);
  }

  const pendingDecisions = unique.filter(isPending);
  const completedDecisions = unique.filter(isCompleted);
  const overdueItems = unique.filter((i) => i.isOverdue && isPending(i));

  return {
    pendingDecisions,
    completedDecisions,
    overdueItems,
    actionHistory: listExecutiveActionsForOrg(organizationId),
    readOnly: true,
  };
}

function buildClosedItemsFromStore(
  organizationId: string,
  activeItems: ExecutiveActionQueueItem[],
): ExecutiveActionQueueItem[] {
  const activeIds = new Set(activeItems.map((i) => i.sessionId));
  const history = listExecutiveActionsForOrg(organizationId);
  const closedSessionIds = new Set(
    history
      .filter(
        (a) =>
          a.action === "mark_acted" ||
          a.action === "mark_deferred" ||
          a.action === "mark_closed",
      )
      .map((a) => a.sessionId),
  );

  const result: ExecutiveActionQueueItem[] = [];
  for (const sessionId of closedSessionIds) {
    if (activeIds.has(sessionId)) continue;
    const lastAction = history.find((a) => a.sessionId === sessionId);
    if (!lastAction) continue;

    const outcome =
      lastAction.action === "mark_acted"
        ? "acted"
        : lastAction.action === "mark_deferred"
          ? "deferred"
          : "closed";

    result.push({
      sessionId,
      projectName: sessionId.slice(0, 8),
      actionQueue: "priority_decision",
      queuePosition: 0,
      priority: "medium",
      recommendedAction:
        outcome === "acted" ? "已执行" : outcome === "deferred" ? "已延期" : "已关闭",
      dueDate: lastAction.timestamp,
      status:
        outcome === "acted" ? "acted" : outcome === "deferred" ? "deferred" : "closed",
      outcome,
      isOverdue: false,
      rankScore: 0,
      expectedValue: 0,
      riskScore: 0,
      actionRecord: {
        sessionId,
        organizationId,
        status:
          outcome === "acted" ? "acted" : outcome === "deferred" ? "deferred" : "closed",
        outcome,
        priority: "medium",
        recommendedAction: "",
        dueDate: lastAction.timestamp,
        actionCount: 1,
        createdAt: lastAction.timestamp,
        updatedAt: lastAction.timestamp,
      },
      readOnly: true,
    });
  }

  return result;
}
