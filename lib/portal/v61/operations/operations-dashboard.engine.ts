/**
 * V61 P6 — Operational dashboard aggregation
 */

import { prisma } from "@/lib/prisma";
import { getWorkspaceSummary } from "@/lib/portal/v57/experience/workspace-summary.service";
import { getDocumentsSummary } from "@/lib/portal/v58/documents/documents.aggregator";
import { getDeliveryTrackingSnapshot } from "@/lib/portal/v59/tracking/delivery-tracking.intelligence";
import { buildSystemHealthReport } from "@/lib/portal/v60/health/system-health.engine";
import { buildLaunchReadinessScores } from "../launch/launch-readiness.engine";

export type OperationsDashboard = {
  organization: { id: string; name: string } | null;
  stats: {
    usersEstimate: number;
    projects: number;
    quotes: number;
    deliveries: number;
    downloads: number;
  };
  recentActivities: { event: string; timestamp: string }[];
  health: Awaited<ReturnType<typeof buildSystemHealthReport>>;
  readiness: Awaited<ReturnType<typeof buildLaunchReadinessScores>>;
};

export async function buildOperationsDashboard(
  organizationId: string,
  userId?: string,
): Promise<OperationsDashboard> {
  const [ws, docs, tracking, health, readiness] = await Promise.all([
    getWorkspaceSummary(organizationId, userId),
    getDocumentsSummary(organizationId).catch(() => ({
      deliveriesCount: 0,
      recentActivities: [],
    })),
    getDeliveryTrackingSnapshot(organizationId),
    buildSystemHealthReport(),
    buildLaunchReadinessScores(organizationId),
  ]);

  let usersEstimate = 1;
  try {
    usersEstimate = await prisma.organizationMember.count({ where: { organizationId } });
  } catch {
    usersEstimate = 1;
  }

  return {
    organization: ws.organization
      ? { id: ws.organization.id, name: ws.organization.name }
      : null,
    stats: {
      usersEstimate,
      projects: ws.projectsCount,
      quotes: ws.quotesCount,
      deliveries: docs.deliveriesCount ?? 0,
      downloads: tracking.totalDownloadCount,
    },
    recentActivities: [
      ...(docs.recentActivities ?? []),
      ...tracking.recentActivity.map((a) => ({ event: a.event, timestamp: a.timestamp })),
    ].slice(0, 15),
    health,
    readiness,
  };
}
