/**
 * V80 Pilot P1 — Map TenderRequirements → production Project / Quote inputs
 */

import { BudgetLevel, DeliveryMode, SiteType } from "@prisma/client";

import type { CompanyInfoInput } from "@/lib/product-engine";
import type { CreateProjectInput } from "@/lib/services/project.service";

import type { TenderRequirements } from "./requirements.schema";

function inferSiteType(req: TenderRequirements): SiteType {
  const blob = [
    req.scope,
    ...req.space.map((s) => s.text),
    ...req.functionalRequirements.map((s) => s.text),
  ]
    .join(" ")
    .toLowerCase();
  if (/健身|gym|器械|训练/.test(blob)) return SiteType.mixed;
  if (/办公|office/.test(blob)) return SiteType.office;
  return SiteType.office;
}

function inferBudgetLevel(req: TenderRequirements): BudgetLevel {
  const max = req.budget.max ?? 0;
  if (max > 0 && max < 500_000) return BudgetLevel.low;
  if (max > 2_000_000) return BudgetLevel.high;
  return BudgetLevel.mid;
}

function parseAreaM2(req: TenderRequirements): number | undefined {
  const joined = [...req.space, ...req.quantity].map((s) => s.text).join(" ");
  const m = joined.match(/(\d+(?:\.\d+)?)\s*(?:㎡|m2|平方米|平米)/i);
  return m ? Number(m[1]) : undefined;
}

function parseTargetUsers(req: TenderRequirements): number | undefined {
  const joined = [...req.quantity, ...req.equipment].map((s) => s.text).join(" ");
  const m = joined.match(/(\d+)\s*(?:人|users?|员工)/i);
  return m ? Number(m[1]) : undefined;
}

export function mapRequirementsToProjectInput(
  req: TenderRequirements,
  organizationId: string,
): CreateProjectInput {
  const notes = [
    req.objectives.length ? `目标：${req.objectives.join("；")}` : "",
    req.deliverables.length ? `交付：${req.deliverables.join("；")}` : "",
    req.risks.length ? `风险：${req.risks.join("；")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    name: req.projectName.trim() || "招标项目",
    clientName: req.organization.trim() || undefined,
    industry: req.industry.trim() || undefined,
    city: req.location.trim() || undefined,
    siteType: inferSiteType(req),
    areaM2: parseAreaM2(req),
    targetUsers: parseTargetUsers(req),
    budgetLevel: inferBudgetLevel(req),
    deliveryMode: DeliveryMode.tender,
    notes: notes || req.scope.slice(0, 2000) || undefined,
    organizationId,
  };
}

export function mapRequirementsToQuoteCompanyInfo(req: TenderRequirements): CompanyInfoInput {
  return {
    companyName: req.organization.trim() || req.projectName.trim() || "招标单位",
    industry: req.industry.trim() || undefined,
    city: req.location.trim() || undefined,
    targetUsers: parseTargetUsers(req),
    areaM2: parseAreaM2(req),
    notes: [req.scope, ...req.objectives].filter(Boolean).join("\n").slice(0, 4000) || undefined,
  };
}

export function mapRequirementsToTenderMetadata(
  req: TenderRequirements,
  extras?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    intakeVersion: "v80-pilot-p3",
    requirements: req,
    ...extras,
  };
}

export function mapRequirementsToQuoteContent(req: TenderRequirements): Record<string, unknown> {
  return {
    proposal: {
      summary: req.scope || req.objectives[0] || "",
      sections: [
        { title: "项目目标", body: req.objectives.join("\n") || "—" },
        { title: "功能需求", body: req.functionalRequirements.map((r) => r.text).join("\n") || "—" },
        { title: "技术需求", body: req.technicalRequirements.map((r) => r.text).join("\n") || "—" },
        { title: "设备与空间", body: [...req.equipment, ...req.space].map((r) => r.text).join("\n") || "—" },
        { title: "交付物", body: req.deliverables.join("\n") || "—" },
      ],
      generatedAt: new Date().toISOString(),
    },
    intake: { requirements: req },
  };
}
