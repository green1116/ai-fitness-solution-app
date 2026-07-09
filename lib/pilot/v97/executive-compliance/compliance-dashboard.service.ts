/**
 * V97 — Executive compliance dashboard
 */

import {
  getComplianceExportsRequested,
  listComplianceActions,
  listComplianceRecords,
} from "./compliance-cache";
import { buildComplianceQueue } from "./compliance-pipeline.service";
import type { ExecutiveComplianceDashboard } from "./compliance.types";
import {
  DEFAULT_RETENTION_WINDOW_DAYS,
  DEFAULT_REVIEW_WINDOW_DAYS,
  V97_EXECUTIVE_COMPLIANCE_VERSION,
} from "./compliance.types";

export function buildExecutiveComplianceDashboard(
  organizationId: string,
): ExecutiveComplianceDashboard {
  const queues = buildComplianceQueue(organizationId);
  const records = listComplianceRecords(organizationId);

  return {
    version: V97_EXECUTIVE_COMPLIANCE_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    policy: {
      retentionWindowDays: DEFAULT_RETENTION_WINDOW_DAYS,
      reviewWindowDays: DEFAULT_REVIEW_WINDOW_DAYS,
      readOnly: true,
    },
    queues: {
      reviewed: queues.reviewed,
      pendingReview: queues.pendingReview,
      retentionRequired: queues.retentionRequired,
      exportRequested: queues.exportRequested,
      expired: queues.expired,
    },
    allItems: queues.allItems,
    summary: {
      total: queues.allItems.length,
      reviewed: queues.reviewed.length,
      pendingReview: queues.pendingReview.length,
      retentionRequired: queues.retentionRequired.length,
      exportRequested: queues.exportRequested.length,
      expired: queues.expired.length,
      onHold: records.filter((r) => r.complianceStatus === "on_hold").length,
      purgeScheduled: records.filter((r) => r.complianceStatus === "purge_scheduled").length,
      exportsRequested: getComplianceExportsRequested(organizationId),
    },
    recentActions: listComplianceActions(organizationId).slice(0, 20),
    readOnly: true,
  };
}
