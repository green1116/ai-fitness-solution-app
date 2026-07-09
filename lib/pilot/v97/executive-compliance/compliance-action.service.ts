/**
 * V97 — Compliance actions (minimal write to compliance cache only)
 */

import { randomUUID } from "node:crypto";

import { getArchiveRecord, retrieveAuditTrail } from "@/lib/pilot/v96";

import {
  appendComplianceAction,
  getComplianceRecord,
  getComplianceRecordByArchive,
  incrementComplianceExportsRequested,
  saveComplianceRecord,
} from "./compliance-cache";
import { buildRetentionPolicyView } from "./retention-policy.service";
import type { ComplianceExportResult, ComplianceRecord } from "./compliance.types";
import {
  DEFAULT_RETENTION_WINDOW_DAYS,
  DEFAULT_REVIEW_WINDOW_DAYS,
} from "./compliance.types";

function requireArchive(organizationId: string, archiveRecordId: string) {
  const archive = getArchiveRecord(organizationId, archiveRecordId);
  if (!archive) throw new Error("ARCHIVE_NOT_FOUND");
  return archive;
}

function ensureComplianceRecord(input: {
  organizationId: string;
  archiveRecordId: string;
}): ComplianceRecord {
  const existing = getComplianceRecordByArchive(input.organizationId, input.archiveRecordId);
  if (existing) return existing;

  const archive = requireArchive(input.organizationId, input.archiveRecordId);
  const policy = buildRetentionPolicyView({
    organizationId: input.organizationId,
    archiveRecord: archive,
  });
  const now = new Date().toISOString();

  const record: ComplianceRecord = {
    id: `cmp-${randomUUID()}`,
    organizationId: input.organizationId,
    sessionId: archive.sessionId,
    archiveRecordId: archive.id,
    projectName: archive.projectName,
    disposition: policy.disposition,
    complianceStatus: policy.complianceStatus,
    retentionWindowDays: policy.retentionWindowDays,
    archivedAt: archive.archivedAt ?? archive.createdAt,
    reviewDueDate: policy.reviewDueDate,
    expiresAt: policy.expiresAt,
    createdAt: now,
    updatedAt: now,
  };

  return saveComplianceRecord(record);
}

export function assignComplianceReviewer(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  reviewerId: string;
  reviewerName?: string;
  note?: string;
}): ComplianceRecord {
  const record = ensureComplianceRecord({
    organizationId: input.organizationId,
    archiveRecordId: input.archiveRecordId,
  });

  const updated = saveComplianceRecord({
    ...record,
    reviewerId: input.reviewerId,
    reviewerName: input.reviewerName ?? input.reviewerId,
    updatedAt: new Date().toISOString(),
  });

  appendComplianceAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "assign_reviewer",
    complianceRecordId: updated.id,
    archiveRecordId: updated.archiveRecordId,
    sessionId: updated.sessionId,
    note: input.note ?? `合规审阅人: ${updated.reviewerName}`,
    meta: { reviewerId: input.reviewerId },
  });

  return updated;
}

export function markComplianceReviewed(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  note?: string;
}): ComplianceRecord {
  const record = ensureComplianceRecord({
    organizationId: input.organizationId,
    archiveRecordId: input.archiveRecordId,
  });
  const now = new Date().toISOString();

  const updated = saveComplianceRecord({
    ...record,
    complianceStatus: "compliant",
    reviewedAt: now,
    updatedAt: now,
  });

  appendComplianceAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_reviewed",
    complianceRecordId: updated.id,
    archiveRecordId: updated.archiveRecordId,
    sessionId: updated.sessionId,
    note: input.note ?? "合规审阅已完成",
    meta: { reviewedAt: now },
  });

  return updated;
}

export function markComplianceHold(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  note?: string;
}): ComplianceRecord {
  const record = ensureComplianceRecord({
    organizationId: input.organizationId,
    archiveRecordId: input.archiveRecordId,
  });
  const now = new Date().toISOString();

  const updated = saveComplianceRecord({
    ...record,
    disposition: "hold",
    complianceStatus: "on_hold",
    holdAt: now,
    updatedAt: now,
  });

  appendComplianceAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_hold",
    complianceRecordId: updated.id,
    archiveRecordId: updated.archiveRecordId,
    sessionId: updated.sessionId,
    note: input.note ?? "记录已保留（hold）",
    meta: { holdAt: now },
  });

  return updated;
}

export function markCompliancePurge(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  note?: string;
}): ComplianceRecord {
  const record = ensureComplianceRecord({
    organizationId: input.organizationId,
    archiveRecordId: input.archiveRecordId,
  });
  const now = new Date().toISOString();

  const updated = saveComplianceRecord({
    ...record,
    disposition: "purge",
    complianceStatus: "purge_scheduled",
    purgeAt: now,
    updatedAt: now,
  });

  appendComplianceAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_purge",
    complianceRecordId: updated.id,
    archiveRecordId: updated.archiveRecordId,
    sessionId: updated.sessionId,
    note: input.note ?? "记录已标记清除",
    meta: { purgeAt: now },
  });

  return updated;
}

export function requestComplianceExport(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  note?: string;
}): ComplianceExportResult {
  const record = ensureComplianceRecord({
    organizationId: input.organizationId,
    archiveRecordId: input.archiveRecordId,
  });
  const now = new Date().toISOString();
  const trail = retrieveAuditTrail(input.organizationId, record.sessionId);

  saveComplianceRecord({
    ...record,
    exportRequestedAt: now,
    updatedAt: now,
  });

  incrementComplianceExportsRequested(input.organizationId);

  appendComplianceAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "request_export",
    complianceRecordId: record.id,
    archiveRecordId: record.archiveRecordId,
    sessionId: record.sessionId,
    note: input.note ?? "合规导出已请求",
    meta: { format: "json" },
  });

  return {
    organizationId: input.organizationId,
    exportedAt: now,
    format: "json",
    sessionId: record.sessionId,
    archiveRecordId: record.archiveRecordId,
    complianceRecordId: record.id,
    payload: {
      trail,
      complianceRecord: getComplianceRecord(input.organizationId, record.id),
      retentionWindowDays: record.retentionWindowDays ?? DEFAULT_RETENTION_WINDOW_DAYS,
      reviewWindowDays: DEFAULT_REVIEW_WINDOW_DAYS,
    },
    readOnly: true,
  };
}
