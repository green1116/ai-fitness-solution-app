import { BudgetLevel, SiteType } from "@prisma/client";

import { budgetLabelToTier } from "@/lib/plan/planFormBridge";

export const PROJECT_SCENARIO_OPTIONS = [
  "企业办公楼",
  "园区 / 写字楼",
  "酒店 / 公寓",
  "工厂 / 生产园区",
] as const;

export const PROJECT_GOAL_OPTIONS = [
  "提升员工健康",
  "减脂塑形",
  "企业福利",
  "运动恢复 / 放松",
] as const;

export const PROJECT_BUDGET_OPTIONS = [
  "5万以内",
  "5-10万",
  "10-30万",
  "30-80万",
  "80万以上",
] as const;

export type ProjectIntakeForm = {
  name: string;
  clientName: string;
  scenario: string;
  goal: string;
  companySize: string;
  area: string;
  budget: string;
  city: string;
  industry: string;
  notes: string;
};

export const DEFAULT_PROJECT_INTAKE: ProjectIntakeForm = {
  name: "",
  clientName: "",
  scenario: PROJECT_SCENARIO_OPTIONS[0],
  goal: PROJECT_GOAL_OPTIONS[0],
  companySize: "",
  area: "",
  budget: PROJECT_BUDGET_OPTIONS[1],
  city: "",
  industry: "",
  notes: "",
};

export function scenarioToSiteType(scenario: string): SiteType {
  const value = scenario.trim();
  if (value.includes("工厂")) return SiteType.factory;
  if (value.includes("酒店") || value.includes("公寓") || value.includes("园区")) {
    return SiteType.mixed;
  }
  return SiteType.office;
}

export function budgetLabelToProjectLevel(label: string): BudgetLevel {
  return budgetLabelToTier(label) as BudgetLevel;
}

export function budgetLevelToDefaultLabel(
  level: string | null | undefined,
): typeof PROJECT_BUDGET_OPTIONS[number] {
  const value = String(level ?? "").trim().toLowerCase();
  if (value === "low") return "5万以内";
  if (value === "high") return "30-80万";
  return PROJECT_BUDGET_OPTIONS[1];
}

export function resolveProjectBudgetLabel(
  budgetLabel: string | null | undefined,
  budgetLevel: string | null | undefined,
): string {
  const label = String(budgetLabel ?? "").trim();
  if (label) return label;
  return budgetLevelToDefaultLabel(budgetLevel);
}

/** Upper bound in yuan; null means no cap (e.g. 80万以上). */
export function budgetLabelUpperBoundYuan(label: string): number | null {
  const v = String(label || "").trim();
  if (!v || v.includes("80万以上")) return null;
  if (v.includes("5万以内")) return 50000;
  if (v.includes("5-10万")) return 100000;
  if (v.includes("10-30万")) return 300000;
  if (v.includes("30-80万")) return 800000;
  return null;
}

export function isBudgetOverLabelUpperBound(
  totalEstimateMax: number,
  label: string,
): boolean {
  const upper = budgetLabelUpperBoundYuan(label);
  if (upper === null || !Number.isFinite(totalEstimateMax)) return false;
  return totalEstimateMax > upper;
}

export function parseSiteTypeValue(raw: unknown): SiteType | undefined {
  const value = String(raw ?? "").trim().toLowerCase();
  if ((Object.values(SiteType) as string[]).includes(value)) {
    return value as SiteType;
  }
  return undefined;
}

export function parseBudgetLevelValue(raw: unknown): BudgetLevel | undefined {
  const value = String(raw ?? "").trim().toLowerCase();
  if ((Object.values(BudgetLevel) as string[]).includes(value)) {
    return value as BudgetLevel;
  }
  return undefined;
}

export function projectIntakeToCreatePayload(form: ProjectIntakeForm) {
  const name = form.name.trim();
  const clientName = form.clientName.trim() || name;
  const targetUsers = Number(form.companySize);
  const areaM2 = Number(form.area);
  return {
    name,
    clientName,
    industry: form.industry.trim() || form.scenario.trim(),
    city: form.city.trim() || undefined,
    areaM2: Number.isFinite(areaM2) && areaM2 > 0 ? areaM2 : undefined,
    targetUsers:
      Number.isFinite(targetUsers) && targetUsers > 0
        ? Math.floor(targetUsers)
        : undefined,
    siteType: scenarioToSiteType(form.scenario),
    budgetLevel: budgetLabelToProjectLevel(form.budget),
    budgetLabel: form.budget.trim(),
    notes:
      [form.goal.trim(), form.notes.trim()].filter(Boolean).join(" · ") || undefined,
  };
}

export type StoredProjectIntake = {
  name?: string | null;
  clientName?: string | null;
  industry?: string | null;
  city?: string | null;
  areaM2?: number | null;
  targetUsers?: number | null;
  siteType?: string | null;
  budgetLevel?: string | null;
  budgetLabel?: string | null;
  notes?: string | null;
};

export function quotePayloadFromProjectIntake(input: {
  projectId: string;
  organizationId: string;
  companyName: string;
  project?: StoredProjectIntake | null;
}) {
  const project = input.project;
  const payload: Record<string, unknown> = {
    projectId: input.projectId,
    companyName: input.companyName.trim(),
    workspaceId: input.organizationId,
    organizationId: input.organizationId,
  };
  if (project?.industry?.trim()) payload.industry = project.industry.trim();
  if (project?.city?.trim()) payload.city = project.city.trim();
  if (
    typeof project?.areaM2 === "number" &&
    Number.isFinite(project.areaM2) &&
    project.areaM2 > 0
  ) {
    payload.areaM2 = project.areaM2;
  }
  if (
    typeof project?.targetUsers === "number" &&
    Number.isFinite(project.targetUsers) &&
    project.targetUsers > 0
  ) {
    payload.targetUsers = project.targetUsers;
  }
  if (project?.notes?.trim()) payload.notes = project.notes.trim();
  return payload;
}
