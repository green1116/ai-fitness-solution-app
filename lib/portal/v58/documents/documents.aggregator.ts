/**
 * V58 — Document center read-only aggregation
 */

import { prisma } from "@/lib/prisma";
import {
  applyVersionGroups,
  buildTenderPackBundle,
  synthesizeDeliveryFromExport,
  synthesizeDeliveryFromQuote,
  synthesizeDeliveryFromTender,
} from "../delivery/delivery.orchestrator";
import { getDeliveryOverlays } from "../delivery/delivery.store";
import type { DeliveryRecord } from "../delivery/delivery.types";
import { getDeliveryAnalyticsSnapshot } from "../analytics/delivery-analytics";

export type DocumentsSummary = {
  plansCount: number;
  budgetsCount: number;
  quotesCount: number;
  reportsCount: number;
  deliveriesCount: number;
  recentDeliveries: DeliveryRecord[];
  recentActivities: { event: string; timestamp: string; meta?: Record<string, unknown> }[];
};

export type DocumentListItem = {
  id: string;
  title: string;
  projectId: string;
  projectName?: string;
  status: string;
  createdAt: string;
  downloadUrl?: string;
};

async function loadOrgProjectIds(organizationId: string): Promise<string[]> {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    select: { id: true, name: true },
  });
  return projects.map((p) => p.id);
}

export async function aggregateDeliveries(organizationId: string): Promise<DeliveryRecord[]> {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    select: { id: true, name: true },
  });
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));
  const projectIds = projects.map((p) => p.id);
  if (projectIds.length === 0) return applyVersionGroups(getDeliveryOverlays());

  const [exports, tenders, quotes] = await Promise.all([
    prisma.documentExport.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tender.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quote.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const synthesized: DeliveryRecord[] = [
    ...exports.map((e) =>
      synthesizeDeliveryFromExport({
        id: e.id,
        organizationId,
        projectId: e.projectId,
        projectName: projectMap.get(e.projectId),
        docType: e.docType,
        fileName: e.fileName,
        fileUrl: e.fileUrl,
        renderVersion: e.renderVersion,
        createdAt: e.createdAt,
      }),
    ),
    ...tenders.map((t) =>
      synthesizeDeliveryFromTender({
        id: t.id,
        organizationId,
        projectId: t.projectId,
        projectName: projectMap.get(t.projectId),
        quoteId: t.quoteId,
        budgetId: t.budgetId,
        status: t.status,
        fileName: t.fileName,
        fileUrl: t.fileUrl,
        renderVersion: t.renderVersion,
        createdAt: t.createdAt,
      }),
    ),
    ...quotes.map((q) =>
      synthesizeDeliveryFromQuote({
        id: q.id,
        organizationId,
        projectId: q.projectId,
        projectName: projectMap.get(q.projectId),
        status: q.status,
        createdAt: q.createdAt,
      }),
    ),
    ...getDeliveryOverlays().filter((o) => o.organizationId === organizationId),
  ];

  return applyVersionGroups(synthesized);
}

export async function getDocumentsSummary(organizationId: string): Promise<DocumentsSummary> {
  const projectIds = await loadOrgProjectIds(organizationId);
  const deliveries = await aggregateDeliveries(organizationId);

  const [plansCount, budgetsCount, quotesCount, reportsCount] = await Promise.all([
    prisma.documentExport.count({
      where: { projectId: { in: projectIds }, docType: "plan" },
    }),
    prisma.budget.count({ where: { projectId: { in: projectIds } } }),
    prisma.quote.count({ where: { organizationId } }),
    prisma.tender.count({ where: { projectId: { in: projectIds } } }),
  ]);

  const analytics = getDeliveryAnalyticsSnapshot(20).filter(
    (e) => e.organizationId === organizationId,
  );

  return {
    plansCount,
    budgetsCount,
    quotesCount,
    reportsCount,
    deliveriesCount: deliveries.length,
    recentDeliveries: deliveries.filter((d) => d.isLatest).slice(0, 8),
    recentActivities: analytics.map((e) => ({
      event: e.event,
      timestamp: e.timestamp,
      meta: e.meta,
    })),
  };
}

export async function getProjectDocuments(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    include: {
      quotes: { orderBy: { createdAt: "desc" } },
      budgets: { orderBy: { createdAt: "desc" } },
      tenders: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) return null;

  const deliveries = await aggregateDeliveries(organizationId);
  const bundle = buildTenderPackBundle(projectId, deliveries);

  return {
    project: {
      id: project.id,
      name: project.name,
      clientName: project.clientName,
    },
    quotes: project.quotes.map((q) => ({
      id: q.id,
      status: q.status,
      createdAt: q.createdAt.toISOString(),
    })),
    budgets: project.budgets.map((b) => ({
      id: b.id,
      createdAt: b.createdAt.toISOString(),
    })),
    tenders: project.tenders.map((t) => ({
      id: t.id,
      status: t.status,
      fileName: t.fileName,
      createdAt: t.createdAt.toISOString(),
    })),
    exports: project.documents.map((e) => ({
      id: e.id,
      docType: e.docType,
      fileName: e.fileName,
      createdAt: e.createdAt.toISOString(),
    })),
    tenderPack: bundle,
    deliveries: bundle.all,
  };
}

export async function getQuoteDocuments(organizationId: string, quoteId: string) {
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, organizationId },
    include: { project: true, tenders: true },
  });
  if (!quote) return null;

  const deliveries = await aggregateDeliveries(organizationId);
  const quoteDeliveries = deliveries.filter((d) => d.quoteId === quoteId || d.id.includes(quoteId));

  return {
    quote: {
      id: quote.id,
      status: quote.status,
      projectId: quote.projectId,
      projectName: quote.project.name,
      createdAt: quote.createdAt.toISOString(),
    },
    deliveries: quoteDeliveries,
    latest: quoteDeliveries.find((d) => d.isLatest),
    history: quoteDeliveries.filter((d) => !d.isLatest),
    tenders: quote.tenders.map((t) => ({
      id: t.id,
      status: t.status,
      fileName: t.fileName,
    })),
  };
}

export async function listPlans(organizationId: string): Promise<DocumentListItem[]> {
  const projectIds = await loadOrgProjectIds(organizationId);
  const exports = await prisma.documentExport.findMany({
    where: { projectId: { in: projectIds }, docType: "plan" },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { name: true } } },
  });
  return exports.map((e) => ({
    id: e.id,
    title: e.fileName,
    projectId: e.projectId,
    projectName: e.project.name,
    status: e.fileUrl ? "delivered" : "ready",
    createdAt: e.createdAt.toISOString(),
    downloadUrl: e.fileUrl ?? undefined,
  }));
}

export async function listBudgets(organizationId: string): Promise<DocumentListItem[]> {
  const projectIds = await loadOrgProjectIds(organizationId);
  const budgets = await prisma.budget.findMany({
    where: { projectId: { in: projectIds } },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { name: true } } },
  });
  return budgets.map((b) => ({
    id: b.id,
    title: `Budget · ${b.project.name}`,
    projectId: b.projectId,
    projectName: b.project.name,
    status: "ready",
    createdAt: b.createdAt.toISOString(),
    downloadUrl: `/budget?projectId=${b.projectId}`,
  }));
}

export async function listQuoteDocuments(organizationId: string): Promise<DocumentListItem[]> {
  const quotes = await prisma.quote.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { name: true } } },
  });
  return quotes.map((q) => ({
    id: q.id,
    title: `Quote · ${q.project.name}`,
    projectId: q.projectId,
    projectName: q.project.name,
    status: q.status,
    createdAt: q.createdAt.toISOString(),
    downloadUrl: `/documents/quotes/${q.id}`,
  }));
}

export async function listDeliveryReports(organizationId: string) {
  const summary = await getDocumentsSummary(organizationId);
  const deliveries = await aggregateDeliveries(organizationId);
  return {
    summary,
    downloadAnalytics: {
      totalDownloads: deliveries.reduce((n, d) => n + d.downloadCount, 0),
      byType: deliveries.reduce<Record<string, number>>((acc, d) => {
        acc[d.artifactType] = (acc[d.artifactType] ?? 0) + d.downloadCount;
        return acc;
      }, {}),
    },
    recentActivities: summary.recentActivities,
  };
}
