/**
 * V96 — Archive queue (read from V95 closure + archive cache)
 */

import { buildGovernanceClosureView } from "@/lib/pilot/v95";

import { getArchiveRecordBySession, listArchiveRecords } from "./archive-cache";
import { buildLinkedIds, wasOverdueResolved } from "./audit-retrieval.service";
import type { ArchiveQueue, ArchiveQueueItem, ArchiveRecordStatus } from "./archive.types";

export function classifyArchiveQueue(input: {
  outcome: "acted" | "deferred" | "closed";
  archiveStatus?: ArchiveRecordStatus;
  overdueResolved: boolean;
}): ArchiveQueue {
  if (input.archiveStatus === "archived" || input.archiveStatus === "reviewed") {
    return "archived";
  }
  if (input.overdueResolved && input.outcome === "acted") return "overdue_resolved";
  if (input.outcome === "closed") return "closed";
  if (input.outcome === "acted") return "acted";
  return "deferred";
}

export function buildArchiveQueue(organizationId: string): {
  closed: ArchiveQueueItem[];
  acted: ArchiveQueueItem[];
  deferred: ArchiveQueueItem[];
  overdueResolved: ArchiveQueueItem[];
  archived: ArchiveQueueItem[];
  allItems: ArchiveQueueItem[];
} {
  const closure = buildGovernanceClosureView(organizationId);
  const archivedRecords = listArchiveRecords(organizationId);

  const items: ArchiveQueueItem[] = [];

  for (const completed of closure.completedDecisions) {
    if (
      completed.outcome !== "acted" &&
      completed.outcome !== "deferred" &&
      completed.outcome !== "closed"
    ) {
      continue;
    }

    const stored = getArchiveRecordBySession(organizationId, completed.sessionId);
    const overdueResolved = wasOverdueResolved(organizationId, completed.sessionId);
    const archiveQueue = classifyArchiveQueue({
      outcome: completed.outcome,
      archiveStatus: stored?.status,
      overdueResolved,
    });

    const closedAt =
      completed.actionRecord.actedAt ??
      completed.actionRecord.deferredAt ??
      completed.actionRecord.closedAt;

    items.push({
      sessionId: completed.sessionId,
      projectName: completed.projectName,
      archiveQueue,
      outcome: completed.outcome,
      archiveRecordId: stored?.id,
      status: stored?.status ?? "active",
      closedAt,
      linkedIds: buildLinkedIds(organizationId, completed.sessionId),
      readOnly: true,
    });
  }

  for (const record of archivedRecords) {
    if (items.some((i) => i.sessionId === record.sessionId)) continue;
    items.push({
      sessionId: record.sessionId,
      projectName: record.projectName,
      archiveQueue: "archived",
      outcome: record.outcome,
      archiveRecordId: record.id,
      status: record.status,
      closedAt: record.archivedAt,
      linkedIds: record.linkedIds,
      readOnly: true,
    });
  }

  const closed: ArchiveQueueItem[] = [];
  const acted: ArchiveQueueItem[] = [];
  const deferred: ArchiveQueueItem[] = [];
  const overdueResolved: ArchiveQueueItem[] = [];
  const archived: ArchiveQueueItem[] = [];

  for (const item of items) {
    switch (item.archiveQueue) {
      case "closed":
        closed.push(item);
        break;
      case "acted":
        acted.push(item);
        break;
      case "deferred":
        deferred.push(item);
        break;
      case "overdue_resolved":
        overdueResolved.push(item);
        break;
      case "archived":
        archived.push(item);
        break;
    }
  }

  const allItems = [...closed, ...acted, ...deferred, ...overdueResolved, ...archived];

  return { closed, acted, deferred, overdueResolved, archived, allItems };
}
