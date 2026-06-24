/**
 * V59 P5 — Project Intelligence Dashboard aggregation
 */

import { prisma } from "@/lib/prisma";
import { aggregateDeliveries } from "@/lib/portal/v58/documents/documents.aggregator";
import { buildTenderPackBundle } from "@/lib/portal/v58/delivery/delivery.orchestrator";
import { computeProjectReadiness } from "../scoring/readiness.engine";
import { computeProjectHealth } from "../scoring/health.engine";
import { analyzeProjectRisks } from "../risk/risk.intelligence";
import { analyzeProjectVersions } from "../versioning/version.intelligence";
import { getDeliveryTrackingSnapshot } from "../tracking/delivery-tracking.intelligence";
import { generateRecommendations } from "../recommendations/recommendation.engine";

export type ProjectIntelligenceItem = {
  id: string;
  name: string;
  clientName: string | null;
  quotesCount: number;
  deliveriesCount: number;
  readiness: number;
  health: string;
  riskCount: number;
  lastActivity: string | null;
};

export type ProjectIntelligenceDetail = {
  id: string;
  name: string;
  clientName: string | null;
  quotesCount: number;
  deliveriesCount: number;
  readinessScore: number;
  healthLevel: string;
  riskCount: number;
  lastActivity: string | null;
  quotes: { id: string; status: string; createdAt: string }[];
  deliveries: Awaited<ReturnType<typeof aggregateDeliveries>>;
  tenderPack: ReturnType<typeof buildTenderPackBundle>;
  readiness: Awaited<ReturnType<typeof computeProjectReadiness>>;
  health: Awaited<ReturnType<typeof computeProjectHealth>>;
  risks: Awaited<ReturnType<typeof analyzeProjectRisks>>;
  versionComparisons: Awaited<ReturnType<typeof analyzeProjectVersions>>;
  tracking: Awaited<ReturnType<typeof getDeliveryTrackingSnapshot>>;
  recommendations: Awaited<ReturnType<typeof generateRecommendations>>["recommendations"];
};

export async function listProjectIntelligence(
  organizationId: string,
): Promise<ProjectIntelligenceItem[]> {
  const [projects, deliveries, tracking] = await Promise.all([
    prisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { quotes: true } } },
    }),
    aggregateDeliveries(organizationId),
    getDeliveryTrackingSnapshot(organizationId),
  ]);

  const items: ProjectIntelligenceItem[] = [];
  for (const p of projects) {
    const [readiness, health, risks] = await Promise.all([
      computeProjectReadiness(organizationId, p.id),
      computeProjectHealth(organizationId, p.id),
      analyzeProjectRisks(organizationId, p.id, p.name),
    ]);
    const projectDeliveries = deliveries.filter((d) => d.projectId === p.id);
    const lastDelivery = projectDeliveries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
    const lastActivity =
      lastDelivery?.createdAt ??
      tracking.recentActivity.find((a) => a.projectId === p.id)?.timestamp ??
      null;

    items.push({
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      quotesCount: p._count.quotes,
      deliveriesCount: projectDeliveries.length,
      readiness: readiness.overallReadiness,
      health: health.level,
      riskCount: risks.length,
      lastActivity,
    });
  }
  return items;
}

export async function getProjectIntelligenceDetail(
  organizationId: string,
  projectId: string,
): Promise<ProjectIntelligenceDetail | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    include: {
      quotes: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!project) return null;

  const [deliveries, readiness, health, risks, versions, tracking, allRecs] =
    await Promise.all([
      aggregateDeliveries(organizationId),
      computeProjectReadiness(organizationId, projectId),
      computeProjectHealth(organizationId, projectId),
      analyzeProjectRisks(organizationId, projectId, project.name),
      analyzeProjectVersions(organizationId, projectId),
      getDeliveryTrackingSnapshot(organizationId),
      generateRecommendations(organizationId),
    ]);

  const projectDeliveries = deliveries.filter((d) => d.projectId === projectId);
  const recommendations = allRecs.recommendations.filter((r) => r.projectId === projectId);

  return {
    id: project.id,
    name: project.name,
    clientName: project.clientName,
    quotesCount: project.quotes.length,
    deliveriesCount: projectDeliveries.length,
    readinessScore: readiness.overallReadiness,
    healthLevel: health.level,
    riskCount: risks.length,
    lastActivity: projectDeliveries[0]?.createdAt ?? null,
    quotes: project.quotes.map((q) => ({
      id: q.id,
      status: q.status,
      createdAt: q.createdAt.toISOString(),
    })),
    deliveries: projectDeliveries,
    tenderPack: buildTenderPackBundle(projectId, deliveries),
    readiness,
    health,
    risks,
    versionComparisons: versions,
    tracking,
    recommendations,
  };
}
