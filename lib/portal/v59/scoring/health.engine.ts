/**
 * V59 P4 — Delivery Health Engine
 */

import { prisma } from "@/lib/prisma";
import { aggregateDeliveries } from "@/lib/portal/v58/documents/documents.aggregator";
import { getDeliveryTrackingSnapshot } from "../tracking/delivery-tracking.intelligence";

export type HealthLevel = "healthy" | "warning" | "critical";

export type HealthIssue = {
  code: string;
  label: string;
  severity: HealthLevel;
};

export type DeliveryHealthReport = {
  level: HealthLevel;
  score: number;
  issues: HealthIssue[];
  checks: {
    hasDocuments: boolean;
    hasBudget: boolean;
    hasReports: boolean;
    hasDeliveries: boolean;
    hasDownloads: boolean;
  };
};

export async function computeProjectHealth(
  organizationId: string,
  projectId: string,
): Promise<DeliveryHealthReport> {
  const [exports, budgets, tenders, quotes, deliveries, tracking] = await Promise.all([
    prisma.documentExport.count({ where: { projectId } }),
    prisma.budget.count({ where: { projectId } }),
    prisma.tender.count({ where: { projectId } }),
    prisma.quote.count({ where: { projectId, organizationId } }),
    aggregateDeliveries(organizationId),
    getDeliveryTrackingSnapshot(organizationId),
  ]);

  const projectDeliveries = deliveries.filter((d) => d.projectId === projectId);
  const hasDownloads =
    projectDeliveries.some((d) => d.downloadCount > 0) || tracking.pdfDownloaded > 0;

  const checks = {
    hasDocuments: exports > 0 || quotes > 0,
    hasBudget: budgets > 0,
    hasReports: tenders > 0,
    hasDeliveries: projectDeliveries.length > 0,
    hasDownloads,
  };

  const issues: HealthIssue[] = [];
  if (!checks.hasDocuments) {
    issues.push({ code: "missing_documents", label: "缺失文档", severity: "critical" });
  }
  if (!checks.hasBudget) {
    issues.push({ code: "missing_budget", label: "缺失预算", severity: "warning" });
  }
  if (!checks.hasReports) {
    issues.push({ code: "missing_reports", label: "缺失报告/标书", severity: "warning" });
  }
  if (!checks.hasDeliveries) {
    issues.push({ code: "missing_deliveries", label: "缺失交付记录", severity: "critical" });
  }
  if (!checks.hasDownloads) {
    issues.push({ code: "missing_downloads", label: "缺失下载记录", severity: "warning" });
  }

  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passed / 5) * 100);
  let level: HealthLevel = "healthy";
  if (issues.some((i) => i.severity === "critical")) level = "critical";
  else if (issues.length > 0) level = "warning";

  return { level, score, issues, checks };
}

export async function computeOrganizationHealth(
  organizationId: string,
): Promise<DeliveryHealthReport> {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    select: { id: true },
  });
  if (projects.length === 0) {
    return {
      level: "critical",
      score: 0,
      issues: [{ code: "no_projects", label: "无项目", severity: "critical" }],
      checks: {
        hasDocuments: false,
        hasBudget: false,
        hasReports: false,
        hasDeliveries: false,
        hasDownloads: false,
      },
    };
  }

  const reports = await Promise.all(
    projects.map((p) => computeProjectHealth(organizationId, p.id)),
  );

  const avgScore = Math.round(reports.reduce((n, r) => n + r.score, 0) / reports.length);
  const allIssues = reports.flatMap((r) => r.issues);
  const uniqueIssues = [...new Map(allIssues.map((i) => [i.code, i])).values()];

  let level: HealthLevel = "healthy";
  if (reports.some((r) => r.level === "critical")) level = "critical";
  else if (reports.some((r) => r.level === "warning")) level = "warning";

  const checks = {
    hasDocuments: reports.every((r) => r.checks.hasDocuments) || reports.some((r) => r.checks.hasDocuments),
    hasBudget: reports.some((r) => r.checks.hasBudget),
    hasReports: reports.some((r) => r.checks.hasReports),
    hasDeliveries: reports.some((r) => r.checks.hasDeliveries),
    hasDownloads: reports.some((r) => r.checks.hasDownloads),
  };

  return { level, score: avgScore, issues: uniqueIssues, checks };
}
