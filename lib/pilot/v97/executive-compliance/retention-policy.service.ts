/**
 * V97 — Retention policy (read from V96 archive + compliance cache)
 */

import type { ArchiveRecord } from "@/lib/pilot/v96";

import { getComplianceRecordByArchive } from "./compliance-cache";
import type {
  ComplianceDisposition,
  ComplianceStatus,
  RetentionPolicyView,
} from "./compliance.types";
import {
  DEFAULT_RETENTION_WINDOW_DAYS,
  DEFAULT_REVIEW_WINDOW_DAYS,
} from "./compliance.types";

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * 86400000).toISOString();
}

export function buildRetentionPolicyView(input: {
  organizationId: string;
  archiveRecord: ArchiveRecord;
  retentionWindowDays?: number;
  reviewWindowDays?: number;
}): RetentionPolicyView {
  const retentionWindowDays = input.retentionWindowDays ?? DEFAULT_RETENTION_WINDOW_DAYS;
  const reviewWindowDays = input.reviewWindowDays ?? DEFAULT_REVIEW_WINDOW_DAYS;
  const archivedAt = input.archiveRecord.archivedAt ?? input.archiveRecord.createdAt;
  const stored = getComplianceRecordByArchive(
    input.organizationId,
    input.archiveRecord.id,
  );

  const reviewDueDate = stored?.reviewDueDate ?? addDays(archivedAt, reviewWindowDays);
  const expiresAt = stored?.expiresAt ?? addDays(archivedAt, retentionWindowDays);
  const disposition = stored?.disposition ?? "keep";
  const complianceStatus = resolveComplianceStatus({
    disposition,
    expiresAt,
    reviewedAt: stored?.reviewedAt ?? input.archiveRecord.reviewedAt,
    holdAt: stored?.holdAt,
    purgeAt: stored?.purgeAt,
    exportRequestedAt: stored?.exportRequestedAt,
    storedStatus: stored?.complianceStatus,
  });

  return {
    retentionWindowDays,
    reviewWindowDays,
    disposition,
    complianceStatus,
    reviewDueDate,
    expiresAt,
    readOnly: true,
  };
}

export function resolveComplianceStatus(input: {
  disposition: ComplianceDisposition;
  expiresAt: string;
  reviewedAt?: string;
  holdAt?: string;
  purgeAt?: string;
  exportRequestedAt?: string;
  storedStatus?: ComplianceStatus;
}): ComplianceStatus {
  if (input.storedStatus === "on_hold" || input.holdAt) return "on_hold";
  if (input.storedStatus === "purge_scheduled" || input.purgeAt) return "purge_scheduled";
  if (new Date(input.expiresAt).getTime() < Date.now() && input.disposition !== "hold") {
    return "expired";
  }
  if (input.reviewedAt) return "compliant";
  if (input.exportRequestedAt && !input.reviewedAt) return "pending";
  return input.storedStatus ?? "pending";
}

export function isRetentionExpired(expiresAt: string, disposition: ComplianceDisposition): boolean {
  if (disposition === "hold") return false;
  return new Date(expiresAt).getTime() < Date.now();
}
