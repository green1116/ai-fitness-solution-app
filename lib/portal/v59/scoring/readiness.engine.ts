/**
 * V59 P3 — Tender Readiness Engine
 */

import { prisma } from "@/lib/prisma";
import {
  aggregateDeliveries,
  getProjectDocuments,
} from "@/lib/portal/v58/documents/documents.aggregator";

export type ReadinessDimension = {
  key: string;
  label: string;
  score: number;
  status: "ready" | "partial" | "missing";
};

export type TenderReadinessReport = {
  planReadiness: number;
  budgetReadiness: number;
  evidenceReadiness: number;
  tenderPackageReadiness: number;
  overallReadiness: number;
  dimensions: ReadinessDimension[];
};

function scorePresence(present: boolean, partial = false): number {
  if (present) return 100;
  if (partial) return 45;
  return 0;
}

export async function computeProjectReadiness(
  organizationId: string,
  projectId: string,
): Promise<TenderReadinessReport> {
  const projectData = await getProjectDocuments(organizationId, projectId);
  if (!projectData) {
    return {
      planReadiness: 0,
      budgetReadiness: 0,
      evidenceReadiness: 0,
      tenderPackageReadiness: 0,
      overallReadiness: 0,
      dimensions: [],
    };
  }

  const bundle = projectData.tenderPack;
  const hasPlan = Boolean(bundle.planPdf?.downloadUrl || projectData.exports.some((e) => e.docType === "plan"));
  const hasBudget = projectData.budgets.length > 0 || Boolean(bundle.budgetPdf);
  const hasEvidence =
    projectData.tenders.length > 0 ||
    projectData.exports.some((e) => ["merged", "tender"].includes(e.docType));
  const packSlots = [
    bundle.planPdf,
    bundle.budgetPdf,
    bundle.quotePdf,
    bundle.mergedPdf,
    bundle.zipPackage,
    bundle.tenderPack,
  ];
  const packFilled = packSlots.filter(Boolean).length;
  const tenderPackageReadiness = Math.round((packFilled / packSlots.length) * 100);

  const planReadiness = scorePresence(hasPlan, projectData.exports.length > 0);
  const budgetReadiness = scorePresence(hasBudget, projectData.budgets.length > 0);
  const evidenceReadiness = scorePresence(
    hasEvidence,
    projectData.tenders.some((t) => t.status === "GENERATING"),
  );

  const overallReadiness = Math.round(
    planReadiness * 0.25 +
      budgetReadiness * 0.25 +
      evidenceReadiness * 0.2 +
      tenderPackageReadiness * 0.3,
  );

  return {
    planReadiness,
    budgetReadiness,
    evidenceReadiness,
    tenderPackageReadiness,
    overallReadiness,
    dimensions: [
      { key: "plan", label: "Plan", score: planReadiness, status: hasPlan ? "ready" : "missing" },
      {
        key: "budget",
        label: "Budget",
        score: budgetReadiness,
        status: hasBudget ? "ready" : projectData.budgets.length > 0 ? "partial" : "missing",
      },
      {
        key: "evidence",
        label: "Evidence",
        score: evidenceReadiness,
        status: hasEvidence ? "ready" : "missing",
      },
      {
        key: "tender_pack",
        label: "Tender Pack",
        score: tenderPackageReadiness,
        status: tenderPackageReadiness >= 80 ? "ready" : tenderPackageReadiness >= 40 ? "partial" : "missing",
      },
    ],
  };
}

export async function computeOrganizationReadiness(
  organizationId: string,
): Promise<TenderReadinessReport> {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    select: { id: true },
  });
  if (projects.length === 0) {
    return {
      planReadiness: 0,
      budgetReadiness: 0,
      evidenceReadiness: 0,
      tenderPackageReadiness: 0,
      overallReadiness: 0,
      dimensions: [],
    };
  }

  const reports = await Promise.all(
    projects.map((p) => computeProjectReadiness(organizationId, p.id)),
  );

  const avg = (key: keyof TenderReadinessReport) =>
    Math.round(
      reports.reduce((n, r) => n + (typeof r[key] === "number" ? (r[key] as number) : 0), 0) /
        reports.length,
    );

  const deliveries = await aggregateDeliveries(organizationId);
  const hasAnyDelivery = deliveries.length > 0;

  return {
    planReadiness: avg("planReadiness"),
    budgetReadiness: avg("budgetReadiness"),
    evidenceReadiness: avg("evidenceReadiness"),
    tenderPackageReadiness: avg("tenderPackageReadiness"),
    overallReadiness: hasAnyDelivery ? avg("overallReadiness") : Math.max(0, avg("overallReadiness") - 10),
    dimensions: reports[0]?.dimensions ?? [],
  };
}
