/**
 * V59 P7 — Commercial Readiness Score
 */

import { prisma } from "@/lib/prisma";
import { getWorkspaceSummary } from "@/lib/portal/v57/experience/workspace-summary.service";
import { aggregateDeliveries } from "@/lib/portal/v58/documents/documents.aggregator";
import { computeOrganizationReadiness } from "./readiness.engine";
import { computeOrganizationHealth } from "./health.engine";
import { getDeliveryTrackingSnapshot } from "../tracking/delivery-tracking.intelligence";

export type CommercialReadinessReport = {
  commercialReadiness: number;
  deliveryReadiness: number;
  tenderReadiness: number;
  executionReadiness: number;
  overallBusinessScore: number;
};

export async function computeCommercialReadiness(
  organizationId: string,
  userId?: string,
): Promise<CommercialReadinessReport> {
  const [summary, readiness, health, tracking, deliveries] = await Promise.all([
    getWorkspaceSummary(organizationId, userId),
    computeOrganizationReadiness(organizationId),
    computeOrganizationHealth(organizationId),
    getDeliveryTrackingSnapshot(organizationId),
    aggregateDeliveries(organizationId),
  ]);

  const hasOrg = Boolean(summary.organization);
  const hasProjects = summary.projectsCount > 0;
  const hasQuotes = summary.quotesCount > 0;
  const hasDeliveries = deliveries.length > 0;

  const commercialReadiness = Math.round(
    (hasOrg ? 30 : 0) +
      (hasProjects ? 35 : 0) +
      (hasQuotes ? 35 : 0),
  );

  const deliveryReadiness = Math.round(
    health.score * 0.5 +
      Math.min(50, tracking.pdfDownloaded * 5) +
      (hasDeliveries ? 20 : 0),
  );

  const tenderReadiness = readiness.overallReadiness;

  const readyQuotes = await prisma.quote.count({
    where: { organizationId, status: { not: "DRAFT" } },
  });
  const executionReadiness = summary.quotesCount
    ? Math.round((readyQuotes / summary.quotesCount) * 100)
    : 0;

  const overallBusinessScore = Math.round(
    commercialReadiness * 0.25 +
      deliveryReadiness * 0.25 +
      tenderReadiness * 0.3 +
      executionReadiness * 0.2,
  );

  return {
    commercialReadiness: Math.min(100, commercialReadiness),
    deliveryReadiness: Math.min(100, deliveryReadiness),
    tenderReadiness,
    executionReadiness,
    overallBusinessScore,
  };
}
