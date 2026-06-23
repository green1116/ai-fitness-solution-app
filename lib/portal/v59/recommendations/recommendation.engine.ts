/**
 * V59 P9 — Recommendation Engine
 */

import type { RiskItem } from "../risk/risk.intelligence";
import { analyzeOrganizationRisks } from "../risk/risk.intelligence";
import { computeOrganizationReadiness } from "../scoring/readiness.engine";
import { computeOrganizationHealth } from "../scoring/health.engine";
import { prisma } from "@/lib/prisma";

export type Recommendation = {
  id: string;
  action: string;
  label: string;
  priority: "high" | "medium" | "low";
  reason: string;
  href: string;
  projectId?: string;
  quoteId?: string;
};

export type RecommendationReport = {
  recommendations: Recommendation[];
};

const ACTION_MAP: Record<string, { label: string; href: (ctx: { projectId?: string; quoteId?: string }) => string }> = {
  Generate_Budget: {
    label: "Generate Budget",
    href: ({ projectId }) => (projectId ? `/budget?projectId=${projectId}` : "/budget"),
  },
  Create_Tender_Pack: {
    label: "Create Tender Pack",
    href: ({ projectId }) => (projectId ? `/tender?projectId=${projectId}` : "/tender"),
  },
  Download_Latest_Package: {
    label: "Download Latest Package",
    href: ({ projectId }) =>
      projectId ? `/documents/projects/${projectId}` : "/documents/deliveries",
  },
  Review_Project: {
    label: "Review Project",
    href: ({ projectId }) => (projectId ? `/projects/${projectId}` : "/projects"),
  },
  Update_Documents: {
    label: "Update Documents",
    href: ({ projectId }) =>
      projectId ? `/documents/projects/${projectId}` : "/documents",
  },
  Generate_Quote: {
    label: "Generate Quote",
    href: ({ projectId }) => (projectId ? `/quote?projectId=${projectId}` : "/quote"),
  },
};

function riskToRecommendation(risk: RiskItem): Recommendation | null {
  const actionKey = risk.recommendedAction.replace(/ /g, "_");
  const mapped = ACTION_MAP[actionKey];
  if (!mapped) {
    return {
      id: `rec_${risk.id}`,
      action: actionKey,
      label: risk.recommendedAction,
      priority: risk.severity === "critical" || risk.severity === "high" ? "high" : "medium",
      reason: risk.title,
      href: `/intelligence/projects/${risk.projectId}`,
      projectId: risk.projectId,
    };
  }
  return {
    id: `rec_${risk.id}`,
    action: actionKey,
    label: mapped.label,
    priority: risk.severity === "critical" || risk.severity === "high" ? "high" : "medium",
    reason: risk.title,
    href: mapped.href({ projectId: risk.projectId }),
    projectId: risk.projectId,
  };
}

export async function generateRecommendations(
  organizationId: string,
): Promise<RecommendationReport> {
  const [risks, readiness, health] = await Promise.all([
    analyzeOrganizationRisks(organizationId),
    computeOrganizationReadiness(organizationId),
    computeOrganizationHealth(organizationId),
  ]);

  const recommendations: Recommendation[] = [];
  const seen = new Set<string>();

  for (const risk of risks.risks.slice(0, 8)) {
    const rec = riskToRecommendation(risk);
    if (rec && !seen.has(rec.action + rec.projectId)) {
      seen.add(rec.action + rec.projectId);
      recommendations.push(rec);
    }
  }

  if (readiness.overallReadiness < 70) {
    const projects = await prisma.project.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (projects && !seen.has("Create_Tender_Pack" + projects.id)) {
      recommendations.push({
        id: "rec_tender_pack",
        action: "Create_Tender_Pack",
        label: "Create Tender Pack",
        priority: "high",
        reason: `整体就绪度 ${readiness.overallReadiness}% 低于目标`,
        href: `/tender?projectId=${projects.id}`,
        projectId: projects.id,
      });
    }
  }

  if (health.level === "critical") {
    recommendations.push({
      id: "rec_review_health",
      action: "Review_Project",
      label: "Review Project",
      priority: "high",
      reason: "交付健康度为 Critical",
      href: "/intelligence/projects",
    });
  }

  const latestQuote = await prisma.quote.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: { id: true, projectId: true },
  });
  if (latestQuote && readiness.planReadiness < 50) {
    recommendations.push({
      id: "rec_quote",
      action: "Generate_Quote",
      label: "Generate Quote",
      priority: "medium",
      reason: "Plan 就绪度不足",
      href: `/quote?projectId=${latestQuote.projectId}`,
      projectId: latestQuote.projectId,
      quoteId: latestQuote.id,
    });
  }

  return {
    recommendations: recommendations.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    }),
  };
}
