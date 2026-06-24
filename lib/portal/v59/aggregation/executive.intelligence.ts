/**
 * V59 P6 — Executive Dashboard aggregation
 */

import { getWorkspaceSummary } from "@/lib/portal/v57/experience/workspace-summary.service";
import { aggregateDeliveries } from "@/lib/portal/v58/documents/documents.aggregator";
import { computeOrganizationReadiness } from "../scoring/readiness.engine";
import { computeOrganizationHealth } from "../scoring/health.engine";
import { computeCommercialReadiness } from "../scoring/commercial.engine";
import { analyzeOrganizationRisks } from "../risk/risk.intelligence";
import { getDeliveryTrackingSnapshot } from "../tracking/delivery-tracking.intelligence";
import { buildIntelligenceAnalytics } from "../analytics/intelligence-analytics.engine";
import { listProjectIntelligence } from "./project.intelligence";

export type ExecutiveDashboard = {
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
  stats: {
    projects: number;
    quotes: number;
    tenderPacks: number;
    downloads: number;
    deliveries: number;
  };
  deliveryHealth: Awaited<ReturnType<typeof computeOrganizationHealth>>;
  readiness: Awaited<ReturnType<typeof computeOrganizationReadiness>>;
  commercial: Awaited<ReturnType<typeof computeCommercialReadiness>>;
  readinessDistribution: { ready: number; partial: number; missing: number };
  recentDeliveries: Awaited<ReturnType<typeof aggregateDeliveries>>;
  recentActivities: Awaited<ReturnType<typeof getDeliveryTrackingSnapshot>>["recentActivity"];
  topRisks: Awaited<ReturnType<typeof analyzeOrganizationRisks>>["risks"];
  projects: Awaited<ReturnType<typeof listProjectIntelligence>>;
  analytics: Awaited<ReturnType<typeof buildIntelligenceAnalytics>>;
};

export async function buildExecutiveDashboard(
  organizationId: string,
  userId?: string,
): Promise<ExecutiveDashboard> {
  const [
    summary,
    deliveries,
    readiness,
    health,
    commercial,
    risks,
    tracking,
    analytics,
    projects,
  ] = await Promise.all([
    getWorkspaceSummary(organizationId, userId),
    aggregateDeliveries(organizationId),
    computeOrganizationReadiness(organizationId),
    computeOrganizationHealth(organizationId),
    computeCommercialReadiness(organizationId, userId),
    analyzeOrganizationRisks(organizationId),
    getDeliveryTrackingSnapshot(organizationId),
    Promise.resolve(buildIntelligenceAnalytics(organizationId)),
    listProjectIntelligence(organizationId),
  ]);

  const tenderPacks = deliveries.filter((d) => d.artifactType === "tender_pack").length;
  const readinessDistribution = {
    ready: projects.filter((p) => p.readiness >= 80).length,
    partial: projects.filter((p) => p.readiness >= 40 && p.readiness < 80).length,
    missing: projects.filter((p) => p.readiness < 40).length,
  };

  return {
    organization: summary.organization,
    stats: {
      projects: summary.projectsCount,
      quotes: summary.quotesCount,
      tenderPacks,
      downloads: tracking.totalDownloadCount,
      deliveries: deliveries.length,
    },
    deliveryHealth: health,
    readiness,
    commercial,
    readinessDistribution,
    recentDeliveries: deliveries.filter((d) => d.isLatest).slice(0, 8),
    recentActivities: tracking.recentActivity,
    topRisks: risks.risks.slice(0, 6),
    projects: projects.slice(0, 10),
    analytics,
  };
}
