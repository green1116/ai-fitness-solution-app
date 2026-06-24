/**
 * V59 P8 — Risk Intelligence
 */

import { prisma } from "@/lib/prisma";
import { aggregateDeliveries } from "@/lib/portal/v58/documents/documents.aggregator";
import { computeProjectHealth } from "../scoring/health.engine";
import { computeProjectReadiness } from "../scoring/readiness.engine";

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type RiskItem = {
  id: string;
  projectId: string;
  projectName?: string;
  code: string;
  title: string;
  severity: RiskSeverity;
  recommendedAction: string;
};

export type RiskReport = {
  risks: RiskItem[];
  bySeverity: Record<RiskSeverity, number>;
  totalRisks: number;
};

const RISK_ACTIONS: Record<string, string> = {
  no_budget: "Generate Budget",
  no_plan: "Create Plan PDF",
  no_report: "Generate Tender / Report",
  no_delivery: "Register delivery via Quote or Tender",
  no_download: "Download Latest Package",
  stale_version: "Update Documents to latest version",
  incomplete_delivery: "Complete Tender Pack assembly",
};

function severityFromHealth(code: string): RiskSeverity {
  if (code === "missing_documents" || code === "missing_deliveries" || code === "no_plan") {
    return "critical";
  }
  if (code === "missing_budget" || code === "missing_reports") return "high";
  if (code === "missing_downloads") return "medium";
  return "low";
}

export async function analyzeProjectRisks(
  organizationId: string,
  projectId: string,
  projectName?: string,
): Promise<RiskItem[]> {
  const [health, readiness, deliveries] = await Promise.all([
    computeProjectHealth(organizationId, projectId),
    computeProjectReadiness(organizationId, projectId),
    aggregateDeliveries(organizationId),
  ]);

  const risks: RiskItem[] = [];
  const projectDeliveries = deliveries.filter((d) => d.projectId === projectId);

  for (const issue of health.issues) {
    risks.push({
      id: `${projectId}_${issue.code}`,
      projectId,
      projectName,
      code: issue.code,
      title: issue.label,
      severity: severityFromHealth(issue.code),
      recommendedAction: RISK_ACTIONS[issue.code.replace("missing_", "no_")] ?? "Review Project",
    });
  }

  if (readiness.planReadiness < 50) {
    risks.push({
      id: `${projectId}_no_plan`,
      projectId,
      projectName,
      code: "no_plan",
      title: "Plan 准备不足",
      severity: "high",
      recommendedAction: RISK_ACTIONS.no_plan,
    });
  }

  if (readiness.budgetReadiness < 50) {
    risks.push({
      id: `${projectId}_no_budget`,
      projectId,
      projectName,
      code: "no_budget",
      title: "Budget 未就绪",
      severity: "high",
      recommendedAction: RISK_ACTIONS.no_budget,
    });
  }

  const archivedOnly = projectDeliveries.length > 0 && !projectDeliveries.some((d) => d.isLatest);
  if (archivedOnly) {
    risks.push({
      id: `${projectId}_stale_version`,
      projectId,
      projectName,
      code: "stale_version",
      title: "版本过旧",
      severity: "medium",
      recommendedAction: RISK_ACTIONS.stale_version,
    });
  }

  if (readiness.tenderPackageReadiness < 60) {
    risks.push({
      id: `${projectId}_incomplete_delivery`,
      projectId,
      projectName,
      code: "incomplete_delivery",
      title: "交付不完整",
      severity: "high",
      recommendedAction: RISK_ACTIONS.incomplete_delivery,
    });
  }

  return risks;
}

export async function analyzeOrganizationRisks(organizationId: string): Promise<RiskReport> {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    select: { id: true, name: true },
  });

  const allRisks: RiskItem[] = [];
  for (const p of projects) {
    const risks = await analyzeProjectRisks(organizationId, p.id, p.name);
    allRisks.push(...risks);
  }

  const bySeverity: Record<RiskSeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  for (const r of allRisks) {
    bySeverity[r.severity]++;
  }

  return {
    risks: allRisks.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.severity] - order[b.severity];
    }),
    bySeverity,
    totalRisks: allRisks.length,
  };
}
