/**
 * V81 — Export release package bundle (read-only)
 */

import {
  buildIntakeRollbackIndex,
  buildIntakeSignoffReport,
  getIntakeSession,
  listIntakeAudit,
} from "@/lib/pilot/v80";

import { listDeliveryTrackingEvents } from "./ops.store";
import type { DeliveryExportBundle } from "./ops.types";
import { V81_DELIVERY_OPS_VERSION } from "./ops.types";

export async function buildDeliveryExportBundle(
  sessionId: string,
  organizationId: string,
): Promise<DeliveryExportBundle> {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");
  if (!session.signedOff) throw new Error("NOT_RELEASED");

  const report = await buildIntakeSignoffReport(sessionId, organizationId);
  const audit = listIntakeAudit(sessionId);
  const tracking = listDeliveryTrackingEvents(sessionId);
  const rollbackIndex = buildIntakeRollbackIndex(session, audit);

  return {
    version: V81_DELIVERY_OPS_VERSION,
    exportedAt: new Date().toISOString(),
    sessionId,
    organizationId,
    releasePackageId: session.releasePackageId ?? report.releaseManifest.manifestId,
    releaseManifest: report.releaseManifest as unknown as Record<string, unknown>,
    rollbackIndex,
    artifacts: report.releaseManifest.artifacts.map((a) => ({
      kind: a.kind,
      label: a.label,
      status: a.status,
      downloadUrl: a.downloadUrl,
      openUrl: a.openUrl,
    })),
    auditSummary: {
      totalEvents: audit.length,
      steps: [...new Set(audit.map((e) => e.step))],
      lastEventAt: audit.length > 0 ? audit[audit.length - 1]!.timestamp : undefined,
    },
    tracking,
    readOnly: true,
  };
}

export function serializeDeliveryExportBundle(bundle: DeliveryExportBundle): string {
  return JSON.stringify(bundle, null, 2);
}
