/**
 * V98 — Policy engine (read from V97 compliance / V96 archive)
 */

import { buildComplianceQueue, type ComplianceQueueItem } from "@/lib/pilot/v97";

import { getEnforcementRecordByArchive } from "./enforcement-cache";
import type { PolicyDueType, PolicyQueueItem } from "./enforcement.types";

const RETENTION_WARNING_DAYS = 30;

function isPastDue(iso: string): boolean {
  return new Date(iso).getTime() <= Date.now();
}

function isWithinDays(iso: string, days: number): boolean {
  const diff = new Date(iso).getTime() - Date.now();
  return diff >= 0 && diff <= days * 86400000;
}

export function classifyPolicyDue(
  organizationId: string,
  item: ComplianceQueueItem,
): PolicyDueType {
  if (
    item.isExpired &&
    item.disposition !== "hold" &&
    item.complianceStatus !== "on_hold"
  ) {
    return "hold_required";
  }

  if (item.complianceStatus === "purge_scheduled" || item.disposition === "purge") {
    return "purge_due";
  }

  if (item.complianceQueue === "export_requested") return "export_due";

  if (
    !item.reviewerName &&
    (isPastDue(item.reviewDueDate) || item.complianceQueue === "pending_review")
  ) {
    return "review_due";
  }

  if (
    item.complianceQueue === "retention_required" ||
    isWithinDays(item.expiresAt, RETENTION_WARNING_DAYS) ||
    isPastDue(item.expiresAt)
  ) {
    return "retention_due";
  }

  if (isPastDue(item.reviewDueDate)) return "review_due";

  return "retention_due";
}

function deriveNextStep(policyDue: PolicyDueType, item: ComplianceQueueItem): string {
  switch (policyDue) {
    case "review_due":
      return item.reviewerName ? "完成合规审阅" : "自动分配审阅人";
    case "retention_due":
      return "确认保留策略";
    case "purge_due":
      return "执行清除策略";
    case "export_due":
      return "自动请求合规导出";
    case "hold_required":
      return "应用法律保留 Hold";
  }
}

function deriveDueDate(policyDue: PolicyDueType, item: ComplianceQueueItem): string {
  switch (policyDue) {
    case "review_due":
      return item.reviewDueDate;
    case "retention_due":
      return item.expiresAt;
    case "purge_due":
      return item.expiresAt;
    case "export_due":
      return item.reviewDueDate;
    case "hold_required":
      return item.expiresAt;
  }
}

export function buildPolicyQueue(organizationId: string): {
  reviewDue: PolicyQueueItem[];
  retentionDue: PolicyQueueItem[];
  purgeDue: PolicyQueueItem[];
  exportDue: PolicyQueueItem[];
  holdRequired: PolicyQueueItem[];
  allItems: PolicyQueueItem[];
} {
  const compliance = buildComplianceQueue(organizationId);

  const items: PolicyQueueItem[] = compliance.allItems.map((item) => {
    const policyDue = classifyPolicyDue(organizationId, item);
    const stored = getEnforcementRecordByArchive(organizationId, item.archiveRecordId);
    const isBlocked = stored?.policyStatus === "blocked";

    return {
      sessionId: item.sessionId,
      archiveRecordId: item.archiveRecordId,
      complianceRecordId: item.complianceRecordId,
      projectName: item.projectName,
      policyDue,
      policyStatus: stored?.policyStatus ?? "pending",
      dueDate: deriveDueDate(policyDue, item),
      nextStep: stored?.nextStep ?? deriveNextStep(policyDue, item),
      isBlocked,
      blockedReason: stored?.blockedReason,
      enforcementRecordId: stored?.id,
      readOnly: true,
    };
  });

  const reviewDue: PolicyQueueItem[] = [];
  const retentionDue: PolicyQueueItem[] = [];
  const purgeDue: PolicyQueueItem[] = [];
  const exportDue: PolicyQueueItem[] = [];
  const holdRequired: PolicyQueueItem[] = [];

  for (const item of items) {
    if (item.policyStatus === "completed") continue;
    switch (item.policyDue) {
      case "review_due":
        reviewDue.push(item);
        break;
      case "retention_due":
        retentionDue.push(item);
        break;
      case "purge_due":
        purgeDue.push(item);
        break;
      case "export_due":
        exportDue.push(item);
        break;
      case "hold_required":
        holdRequired.push(item);
        break;
    }
  }

  const allItems = [
    ...holdRequired,
    ...purgeDue,
    ...exportDue,
    ...reviewDue,
    ...retentionDue,
  ];

  return { reviewDue, retentionDue, purgeDue, exportDue, holdRequired, allItems };
}
