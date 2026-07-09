/**
 * V81 — Delivery ops dashboard (released projects queue)
 */

import {
  buildIntakeLinkage,
  buildIntakeSignoffReport,
  getIntakeDeliverySnapshot,
  getIntakeSession,
  listIntakeAudit,
  listIntakeSessionsForOrg,
  type TenderIntakeSession,
} from "@/lib/pilot/v80";

import { listDeliveryOpsNotifications } from "./ops.store";
import { syncDeliveryOpsNotifications } from "./notification.service";
import {
  derivePackageStatus,
  getDeliveryTrackingSummary,
  seedReleaseReadyTracking,
  summarizeTracking,
} from "./tracking.service";
import type {
  DeliveryOpsArtifactLink,
  DeliveryOpsDashboard,
  DeliveryOpsQueueItem,
} from "./ops.types";
import { V81_DELIVERY_OPS_VERSION } from "./ops.types";

async function buildArtifactLinks(
  session: TenderIntakeSession,
  organizationId: string,
): Promise<DeliveryOpsArtifactLink[]> {
  if (!session.productionProjectId) return [];

  try {
    const delivery = await getIntakeDeliverySnapshot(session, organizationId);
    return delivery.artifacts.map((a) => ({
      kind: a.kind,
      label: a.label,
      status: a.status,
      downloadUrl: a.downloadUrl,
      openUrl: a.openUrl,
    }));
  } catch {
    const linkage = buildIntakeLinkage(session);
    if (!linkage.projectId) return [];
    return [
      {
        kind: "project",
        label: "Project Document Center",
        status: "ready",
        openUrl: `/documents/projects/${linkage.projectId}`,
      },
    ];
  }
}

function lastWorkflowEvent(sessionId: string) {
  const audit = listIntakeAudit(sessionId);
  for (let i = audit.length - 1; i >= 0; i--) {
    const entry = audit[i]!;
    if (
      entry.step === "generate" ||
      entry.step === "handoff" ||
      entry.step === "signoff" ||
      entry.step === "release_package" ||
      entry.workflowStatusAfter
    ) {
      return {
        step: entry.step,
        timestamp: entry.timestamp,
        message: entry.message,
      };
    }
  }
  return undefined;
}

export async function buildDeliveryOpsQueueItem(
  session: TenderIntakeSession,
  organizationId: string,
): Promise<DeliveryOpsQueueItem> {
  if (!session.signedOff || !session.signedOffAt || !session.signedOffBy) {
    throw new Error("NOT_RELEASED");
  }

  let trackingSummary = getDeliveryTrackingSummary(session.id);
  if (trackingSummary.events.length === 0) {
    seedReleaseReadyTracking({
      sessionId: session.id,
      organizationId,
      actorId: session.signedOffBy,
    });
    trackingSummary = getDeliveryTrackingSummary(session.id);
  }

  syncDeliveryOpsNotifications(session);

  const artifactLinks = await buildArtifactLinks(session, organizationId);
  const linkage = buildIntakeLinkage(session);

  return {
    sessionId: session.id,
    releasePackageId: session.releasePackageId ?? `rel_${session.id.slice(0, 8)}`,
    projectName: session.requirements?.projectName,
    fileName: session.fileName,
    packageStatus: derivePackageStatus(trackingSummary.events),
    signedOffAt: session.signedOffAt,
    signedOffBy: session.signedOffBy,
    linkage,
    artifactLinks,
    lastWorkflowEvent: lastWorkflowEvent(session.id),
    tracking: summarizeTracking(trackingSummary.events),
    readOnly: true,
  };
}

export async function buildDeliveryOpsDashboard(
  organizationId: string,
): Promise<DeliveryOpsDashboard> {
  const released = listIntakeSessionsForOrg(organizationId)
    .filter((s) => s.signedOff === true)
    .sort((a, b) => (b.signedOffAt ?? "").localeCompare(a.signedOffAt ?? ""));

  const items = await Promise.all(
    released.map((s) => buildDeliveryOpsQueueItem(s, organizationId)),
  );

  return {
    version: V81_DELIVERY_OPS_VERSION,
    organizationId,
    releasedCount: items.length,
    items,
    notifications: listDeliveryOpsNotifications(organizationId),
  };
}

export async function getDeliveryOpsDetail(
  sessionId: string,
  organizationId: string,
): Promise<{ item: DeliveryOpsQueueItem; report: Awaited<ReturnType<typeof buildIntakeSignoffReport>> }> {
  const session = getIntakeSession(sessionId);
  if (!session || session.organizationId !== organizationId || !session.signedOff) {
    throw new Error("NOT_RELEASED");
  }

  const [item, report] = await Promise.all([
    buildDeliveryOpsQueueItem(session, organizationId),
    buildIntakeSignoffReport(sessionId, organizationId),
  ]);

  return { item, report };
}
