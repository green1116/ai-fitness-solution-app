/**
 * V96 — Executive archive & audit retrieval
 */

export {
  V96_EXECUTIVE_ARCHIVE_VERSION,
  type ArchiveActionEntry,
  type ArchiveActionType,
  type ArchiveQueue,
  type ArchiveQueueItem,
  type ArchiveRecord,
  type ArchiveRecordStatus,
  type ArchiveSearchResult,
  type AuditBundleExport,
  type AuditTrail,
  type ExecutiveArchiveDashboard,
  type LinkedIds,
} from "./executive-archive/archive.types";

export {
  clearArchiveCacheForTests,
  getArchiveRecord,
  getArchiveRecordBySession,
  getExportsCount,
  listArchiveActions,
  listArchiveRecords,
} from "./executive-archive/archive-cache";

export {
  buildLinkedIds,
  listOrgExecutiveActionHistory,
  retrieveAuditTrail,
  searchAuditHistory,
  wasOverdueResolved,
} from "./executive-archive/audit-retrieval.service";

export { buildArchiveQueue, classifyArchiveQueue } from "./executive-archive/archive.service";

export {
  archiveRecord,
  exportAuditBundle,
  markArchiveReviewed,
  restoreArchiveView,
} from "./executive-archive/archive-action.service";

export {
  buildExecutiveArchiveDashboard,
  searchArchiveDashboard,
} from "./executive-archive/archive-dashboard.service";
