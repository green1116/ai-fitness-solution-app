/** /plan 表单 ↔ /result 页面字段映射与本地持久化 */

import { resolveCompanyName } from "@/lib/plan/resolveCompanyName";

export type PlanPageForm = {
  companyName: string;
  companySize: string;
  area: string;
  scenario: string;
  goal: string;
  budget: string;
  email: string;
};

export type ResultPageFormSnapshot = {
  projectId: string;
  companyName: string;
  headcount: number;
  spaceSqm: number;
  scenario: string;
  goal: string;
  budgetLabel: string;
  companyEmail: string;
  email: string;
  budgetTier?: "low" | "mid" | "high";
};

export const PLAN_FORM_SESSION_KEY = "attaguy_plan_form";
export const PLAN_FORM_DRAFT_KEY = "attaguy_plan_form_draft";
export const PLAN_FORM_BY_PROJECT_PREFIX = "attaguy_plan_form:";

export function budgetLabelToTier(label: string): "low" | "mid" | "high" {
  const v = String(label || "").trim();
  if (v.includes("低") || v.includes("5万以内")) return "low";
  if (v.includes("高") || v.includes("80万以上") || v.includes("30-80万")) return "high";
  return "mid";
}

export function planInputToResultForm(
  projectId: string,
  input: Record<string, unknown> | null | undefined,
): Partial<ResultPageFormSnapshot> {
  if (!input) return { projectId, companyName: "示例企业" };
  const email = String(input.email ?? input.companyEmail ?? "").trim();
  const scenario = String(input.scenario ?? "企业办公楼").trim();
  const goal = String(input.goal ?? "提升员工健康").trim();
  const budgetLabel = String(input.budget ?? input.budgetLabel ?? "5-10万").trim();
  const headcount = Number(input.companySize ?? input.company_size ?? 0) || 200;
  const spaceSqm = Number(input.area ?? input.space_area ?? 0) || 120;
  const companyName = resolveCompanyName(input);

  return {
    projectId,
    companyName,
    headcount,
    spaceSqm,
    scenario,
    goal,
    budgetLabel,
    companyEmail: email,
    email,
    budgetTier: budgetLabelToTier(budgetLabel),
  };
}

/** /plan 填写过程中保存草稿（提交前，尚无 projectId） */
export function persistPlanFormDraft(form: PlanPageForm): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PLAN_FORM_DRAFT_KEY, JSON.stringify(form));
  } catch {
    // ignore
  }
}

export function readPlanFormDraft(): PlanPageForm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PLAN_FORM_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlanPageForm>;
    return {
      companyName: parsed.companyName ?? "",
      companySize: parsed.companySize ?? "",
      area: parsed.area ?? "",
      scenario: parsed.scenario ?? "企业办公楼",
      goal: parsed.goal ?? "提升员工健康",
      budget: parsed.budget ?? "5-10万",
      email: parsed.email ?? "",
    };
  } catch {
    return null;
  }
}

export function persistPlanFormForProject(
  projectId: string,
  form: PlanPageForm,
): void {
  if (typeof window === "undefined" || !projectId) return;
  const snapshot = planInputToResultForm(projectId, form as Record<string, unknown>);
  try {
    sessionStorage.setItem(PLAN_FORM_SESSION_KEY, JSON.stringify(snapshot));
    sessionStorage.setItem(
      `${PLAN_FORM_BY_PROJECT_PREFIX}${projectId}`,
      JSON.stringify(snapshot),
    );
    sessionStorage.removeItem(PLAN_FORM_DRAFT_KEY);
  } catch {
    // ignore quota
  }
}

export function readPlanFormFromStorage(
  projectId: string,
): Partial<ResultPageFormSnapshot> | null {
  if (typeof window === "undefined" || !projectId) return null;
  try {
    const scoped = sessionStorage.getItem(
      `${PLAN_FORM_BY_PROJECT_PREFIX}${projectId}`,
    );
    if (scoped) return JSON.parse(scoped) as Partial<ResultPageFormSnapshot>;

    const latest = sessionStorage.getItem(PLAN_FORM_SESSION_KEY);
    if (!latest) return null;
    const parsed = JSON.parse(latest) as Partial<ResultPageFormSnapshot>;
    if (parsed.projectId && parsed.projectId !== projectId) return null;
    return parsed;
  } catch {
    return null;
  }
}
