/**
 * V98 — Enforcement view (read from policy engine + enforcement cache)
 */

import { listEnforcementActions } from "./enforcement-cache";
import { buildPolicyQueue } from "./policy-engine.service";
import type { EnforcementView, PolicyQueueItem } from "./enforcement.types";

export function buildEnforcementView(organizationId: string): EnforcementView {
  const queue = buildPolicyQueue(organizationId);
  const actions = listEnforcementActions(organizationId);
  const blockedItems = queue.allItems.filter((i) => i.isBlocked);
  const pending = queue.allItems.filter((i) => i.policyStatus === "pending");

  const nextStep =
    pending[0]?.nextStep ??
    blockedItems[0]?.nextStep ??
    (queue.allItems.length > 0 ? "所有策略已执行" : "无待执行项");

  const policyStatus =
    blockedItems.length > 0
      ? "blocked"
      : pending.length > 0
        ? "pending"
        : queue.allItems.some((i) => i.policyStatus === "enforced")
          ? "enforced"
          : "completed";

  return {
    policyStatus,
    dueDates: collectDueDates(queue.allItems),
    blockedItems,
    nextStep,
    actionHistory: actions,
    readOnly: true,
  };
}

function collectDueDates(items: PolicyQueueItem[]): EnforcementView["dueDates"] {
  const dueDates: EnforcementView["dueDates"] = {};

  for (const item of items) {
    switch (item.policyDue) {
      case "review_due":
        if (!dueDates.reviewDue || item.dueDate < dueDates.reviewDue) {
          dueDates.reviewDue = item.dueDate;
        }
        break;
      case "retention_due":
        if (!dueDates.retentionDue || item.dueDate < dueDates.retentionDue) {
          dueDates.retentionDue = item.dueDate;
        }
        break;
      case "purge_due":
        if (!dueDates.purgeDue || item.dueDate < dueDates.purgeDue) {
          dueDates.purgeDue = item.dueDate;
        }
        break;
      case "export_due":
        if (!dueDates.exportDue || item.dueDate < dueDates.exportDue) {
          dueDates.exportDue = item.dueDate;
        }
        break;
    }
  }

  return dueDates;
}
