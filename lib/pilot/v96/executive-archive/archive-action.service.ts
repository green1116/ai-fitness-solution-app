/**
 * V96 — Archive actions (minimal write to archive cache only)
 */

import { randomUUID } from "node:crypto";

import { getExecutiveActionRecord } from "@/lib/pilot/v95";

import {
  appendArchiveAction,
  getArchiveRecord,
  getArchiveRecordBySession,
  incrementExportsCount,
  saveArchiveRecord,
} from "./archive-cache";
import { buildLinkedIds, retrieveAuditTrail } from "./audit-retrieval.service";
import { classifyArchiveQueue, buildArchiveQueue } from "./archive.service";
import type { ArchiveRecord, AuditBundleExport } from "./archive.types";

export function archiveRecord(input: {
  organizationId: string;
  actorId: string;
  sessionId: string;
  projectName?: string;
  note?: string;
}): ArchiveRecord {
  const existing = getArchiveRecordBySession(input.organizationId, input.sessionId);
  if (existing?.status === "archived" || existing?.status === "reviewed") {
    return existing;
  }

  const actionRecord = getExecutiveActionRecord(input.sessionId, input.organizationId);
  const outcome = actionRecord?.outcome ?? "closed";
  const linkedIds = buildLinkedIds(input.organizationId, input.sessionId);
  const overdueResolved =
    actionRecord != null &&
    (actionRecord.actedAt ?? actionRecord.deferredAt ?? actionRecord.closedAt) != null &&
    new Date(actionRecord.dueDate).getTime() <
      new Date(
        actionRecord.actedAt ?? actionRecord.deferredAt ?? actionRecord.closedAt ?? "",
      ).getTime();

  const now = new Date().toISOString();
  const record: ArchiveRecord = {
    id: existing?.id ?? `arc-${randomUUID()}`,
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    projectName: input.projectName,
    archiveQueue: classifyArchiveQueue({
      outcome:
        outcome === "acted" || outcome === "deferred" || outcome === "closed"
          ? outcome
          : "closed",
      archiveStatus: "archived",
      overdueResolved,
    }),
    outcome:
      outcome === "acted" || outcome === "deferred" || outcome === "closed"
        ? outcome
        : "closed",
    linkedIds,
    status: "archived",
    archivedAt: now,
    reviewedAt: existing?.reviewedAt,
    restoredAt: existing?.restoredAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  saveArchiveRecord(record);

  appendArchiveAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "archive_record",
    archiveRecordId: record.id,
    sessionId: input.sessionId,
    note: input.note ?? "记录已归档",
  });

  return record;
}

export function restoreArchiveView(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  note?: string;
}): ArchiveRecord {
  const record = requireArchiveRecord(input.organizationId, input.archiveRecordId);
  const now = new Date().toISOString();

  const updated = saveArchiveRecord({
    ...record,
    status: "active",
    restoredAt: now,
    updatedAt: now,
  });

  appendArchiveAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "restore_view",
    archiveRecordId: record.id,
    sessionId: record.sessionId,
    note: input.note ?? "恢复归档视图",
    meta: { restoredAt: now },
  });

  return updated;
}

export function markArchiveReviewed(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  note?: string;
}): ArchiveRecord {
  const record = requireArchiveRecord(input.organizationId, input.archiveRecordId);
  const now = new Date().toISOString();

  const updated = saveArchiveRecord({
    ...record,
    status: "reviewed",
    reviewedAt: now,
    updatedAt: now,
  });

  appendArchiveAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_reviewed",
    archiveRecordId: record.id,
    sessionId: record.sessionId,
    note: input.note ?? "归档已审阅",
    meta: { reviewedAt: now },
  });

  return updated;
}

export function exportAuditBundle(input: {
  organizationId: string;
  actorId: string;
  sessionId?: string;
  archiveRecordId?: string;
  query?: string;
}): AuditBundleExport {
  const now = new Date().toISOString();
  let trail;
  let archiveRecord: ArchiveRecord | undefined;
  let searchResults;

  if (input.archiveRecordId) {
    archiveRecord =
      getArchiveRecord(input.organizationId, input.archiveRecordId) ?? undefined;
    const sessionId = archiveRecord?.sessionId ?? input.sessionId;
    if (sessionId) {
      trail = retrieveAuditTrail(
        input.organizationId,
        sessionId,
        archiveRecord?.projectName,
      );
    }
  } else if (input.sessionId) {
    trail = retrieveAuditTrail(input.organizationId, input.sessionId);
    archiveRecord =
      getArchiveRecordBySession(input.organizationId, input.sessionId) ?? undefined;
  } else if (input.query) {
    const queue = buildArchiveQueue(input.organizationId);
    const matches = queue.allItems.filter((item) => {
      const q = input.query!.toLowerCase();
      const label = (item.projectName ?? item.sessionId).toLowerCase();
      return label.includes(q) || item.sessionId.toLowerCase().includes(q);
    });
    searchResults = matches;
  } else {
    const queue = buildArchiveQueue(input.organizationId);
    searchResults = queue.allItems.slice(0, 20);
  }

  incrementExportsCount(input.organizationId);

  appendArchiveAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "export_audit_bundle",
    archiveRecordId: input.archiveRecordId ?? archiveRecord?.id,
    sessionId: input.sessionId ?? archiveRecord?.sessionId ?? trail?.sessionId,
    note: "导出审计包",
    meta: { format: "json", query: input.query },
  });

  return {
    organizationId: input.organizationId,
    exportedAt: now,
    format: "json",
    sessionId: input.sessionId ?? archiveRecord?.sessionId ?? trail?.sessionId,
    archiveRecordId: input.archiveRecordId ?? archiveRecord?.id,
    payload: {
      trail,
      archiveRecord,
      searchResults,
    },
    readOnly: true,
  };
}

function requireArchiveRecord(organizationId: string, recordId: string): ArchiveRecord {
  const record = getArchiveRecord(organizationId, recordId);
  if (!record) throw new Error("ARCHIVE_NOT_FOUND");
  return record;
}
