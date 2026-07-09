/**
 * V97 — Compliance queue (read from V96 archive + compliance cache)
 */

import { buildArchiveQueue, listArchiveRecords } from "@/lib/pilot/v96";

import { getComplianceRecordByArchive } from "./compliance-cache";
import { buildRetentionPolicyView, isRetentionExpired } from "./retention-policy.service";
import type { ComplianceQueue, ComplianceQueueItem } from "./compliance.types";

export function classifyComplianceQueue(input: {
  archiveStatus: string;
  complianceStatus: string;
  exportRequestedAt?: string;
  reviewedAt?: string;
  expiresAt: string;
  disposition: string;
}): ComplianceQueue | null {
  if (input.archiveStatus !== "archived" && input.archiveStatus !== "reviewed") {
    return null;
  }

  if (input.exportRequestedAt) return "export_requested";
  if (
    isRetentionExpired(input.expiresAt, input.disposition as "keep" | "purge" | "hold")
  ) {
    return "expired";
  }
  if (input.reviewedAt || input.complianceStatus === "compliant") return "reviewed";
  if (!input.reviewedAt && input.complianceStatus === "pending") return "pending_review";
  if (input.disposition === "keep" || input.disposition === "hold") return "retention_required";
  return "pending_review";
}

export function buildComplianceQueue(organizationId: string): {
  reviewed: ComplianceQueueItem[];
  pendingReview: ComplianceQueueItem[];
  retentionRequired: ComplianceQueueItem[];
  exportRequested: ComplianceQueueItem[];
  expired: ComplianceQueueItem[];
  allItems: ComplianceQueueItem[];
} {
  const archiveQueue = buildArchiveQueue(organizationId);
  const archivedRecords = listArchiveRecords(organizationId).filter(
    (r) => r.status === "archived" || r.status === "reviewed",
  );

  const seenArchiveIds = new Set(archivedRecords.map((r) => r.id));
  const items: ComplianceQueueItem[] = [];

  for (const archiveItem of archiveQueue.allItems) {
    if (!archiveItem.archiveRecordId) continue;
    seenArchiveIds.delete(archiveItem.archiveRecordId);
    const record = archivedRecords.find((r) => r.id === archiveItem.archiveRecordId);
    if (!record) continue;
    const item = buildComplianceQueueItem(organizationId, record);
    if (item) items.push(item);
  }

  for (const record of archivedRecords) {
    if (!seenArchiveIds.has(record.id)) continue;
    const item = buildComplianceQueueItem(organizationId, record);
    if (item) items.push(item);
  }

  const reviewed: ComplianceQueueItem[] = [];
  const pendingReview: ComplianceQueueItem[] = [];
  const retentionRequired: ComplianceQueueItem[] = [];
  const exportRequested: ComplianceQueueItem[] = [];
  const expired: ComplianceQueueItem[] = [];

  for (const item of items) {
    switch (item.complianceQueue) {
      case "reviewed":
        reviewed.push(item);
        break;
      case "pending_review":
        pendingReview.push(item);
        break;
      case "retention_required":
        retentionRequired.push(item);
        break;
      case "export_requested":
        exportRequested.push(item);
        break;
      case "expired":
        expired.push(item);
        break;
    }
  }

  const allItems = [
    ...exportRequested,
    ...expired,
    ...pendingReview,
    ...retentionRequired,
    ...reviewed,
  ];

  return { reviewed, pendingReview, retentionRequired, exportRequested, expired, allItems };
}

function buildComplianceQueueItem(
  organizationId: string,
  archiveRecord: Parameters<typeof buildRetentionPolicyView>[0]["archiveRecord"],
): ComplianceQueueItem | null {
  const policy = buildRetentionPolicyView({ organizationId, archiveRecord });
  const stored = getComplianceRecordByArchive(organizationId, archiveRecord.id);

  const complianceQueue = classifyComplianceQueue({
    archiveStatus: archiveRecord.status,
    complianceStatus: policy.complianceStatus,
    exportRequestedAt: stored?.exportRequestedAt,
    reviewedAt: stored?.reviewedAt ?? archiveRecord.reviewedAt,
    expiresAt: policy.expiresAt,
    disposition: policy.disposition,
  });

  if (!complianceQueue) return null;

  return {
    sessionId: archiveRecord.sessionId,
    archiveRecordId: archiveRecord.id,
    complianceRecordId: stored?.id,
    projectName: archiveRecord.projectName,
    complianceQueue,
    complianceStatus: policy.complianceStatus,
    disposition: policy.disposition,
    reviewDueDate: policy.reviewDueDate,
    expiresAt: policy.expiresAt,
    reviewerName: stored?.reviewerName,
    isExpired: isRetentionExpired(policy.expiresAt, policy.disposition),
    retentionPolicy: policy,
    readOnly: true,
  };
}
