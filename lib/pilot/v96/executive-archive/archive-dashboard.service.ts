/**
 * V96 — Executive archive dashboard
 */

import {
  getExportsCount,
  listArchiveActions,
  listArchiveRecords,
} from "./archive-cache";
import { searchAuditHistory } from "./audit-retrieval.service";
import { buildArchiveQueue } from "./archive.service";
import type { ArchiveSearchResult, ExecutiveArchiveDashboard } from "./archive.types";
import { V96_EXECUTIVE_ARCHIVE_VERSION } from "./archive.types";

export function buildExecutiveArchiveDashboard(
  organizationId: string,
): ExecutiveArchiveDashboard {
  const queues = buildArchiveQueue(organizationId);
  const records = listArchiveRecords(organizationId);

  return {
    version: V96_EXECUTIVE_ARCHIVE_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    queues: {
      closed: queues.closed,
      acted: queues.acted,
      deferred: queues.deferred,
      overdueResolved: queues.overdueResolved,
      archived: queues.archived,
    },
    allItems: queues.allItems,
    summary: {
      total: queues.allItems.length,
      closed: queues.closed.length,
      acted: queues.acted.length,
      deferred: queues.deferred.length,
      overdueResolved: queues.overdueResolved.length,
      archived: queues.archived.length,
      reviewed: records.filter((r) => r.status === "reviewed").length,
      exportsCount: getExportsCount(organizationId),
    },
    recentActions: listArchiveActions(organizationId).slice(0, 20),
    readOnly: true,
  };
}

export function searchArchiveDashboard(input: {
  organizationId: string;
  query: string;
}): ArchiveSearchResult {
  const queues = buildArchiveQueue(input.organizationId);
  const matches = queues.allItems.filter((item) => {
    const q = input.query.trim().toLowerCase();
    if (!q) return true;
    const label = (item.projectName ?? item.sessionId).toLowerCase();
    return label.includes(q) || item.sessionId.toLowerCase().includes(q);
  });

  const trails = searchAuditHistory({
    organizationId: input.organizationId,
    query: input.query,
    items: matches.map((m) => ({ sessionId: m.sessionId, projectName: m.projectName })),
  });

  return {
    query: input.query,
    matches,
    trails,
    readOnly: true,
  };
}
