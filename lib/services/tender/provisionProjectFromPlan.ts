import type { Prisma } from "@prisma/client";
import {
  BudgetLevel,
  DeliveryMode,
  SiteType,
} from "@prisma/client";
import type { ProjectInput } from "@/lib/domain/tender";
import { resolveCompanyName } from "@/lib/plan/resolveCompanyName";
import type { Plan } from "@/lib/types/plan";
import { prisma } from "@/lib/prisma";
import { generateBudget } from "./generateBudget";
import { generateSolution } from "./generateSolution";

function mapBudgetLevelFromRange(budgetRange: string): ProjectInput["budgetLevel"] {
  const v = budgetRange.toLowerCase();
  if (v.includes("低") || v.includes("5万") || v.includes("5-")) return "low";
  if (v.includes("高") || v.includes("20") || v.includes("50")) return "high";
  return "mid";
}

export function planJsonToProjectInput(
  plan: Plan,
  formInput?: Record<string, unknown> | null,
): ProjectInput {
  const cp = plan.client_profile;
  const companySize = Number(
    formInput?.companySize ?? cp.company_size ?? cp.companySize ?? 150,
  ) || 150;
  const area = Number(formInput?.area ?? cp.space_area ?? cp.area ?? 200) || 200;
  const budgetRange = String(
    formInput?.budget ?? cp.budget_range ?? cp.budget ?? "5-10万",
  );
  const companyName = resolveCompanyName(formInput);
  const scene = String(
    formInput?.scenario ?? cp.scene ?? cp.scenario ?? "企业办公",
  );

  return {
    name: `${companyName}员工健身空间建设项目`,
    clientName: companyName,
  const companySize = Number(cp.company_size ?? cp.companySize ?? 150) || 150;
  const area = Number(cp.space_area ?? cp.area ?? 200) || 200;
  const budgetRange = String(
    cp.budget_range ?? cp.budget ?? formInput?.budget ?? "5-10万",
  );
  const email = String(formInput?.email ?? "").trim();
  const scene = String(cp.scene ?? cp.scenario ?? formInput?.scenario ?? "企业办公");

  return {
    name: `企业健身方案-${plan.meta.plan_id}`,
    clientName: email ? email.split("@")[0] : "投标企业",
    industry: cp.industry || "enterprise",
    siteType: "office",
    areaM2: area,
    targetUsers: companySize,
    city: "上海市",
    budgetLevel: mapBudgetLevelFromRange(budgetRange),
    deliveryMode: "tender",
    notes: `planJob:${plan.meta.plan_id}; scene:${scene}`,
  };
}

async function syncSolutionCopyForClient(
  projectId: string,
  input: ProjectInput,
): Promise<void> {
  const solutionData = generateSolution(input);
  await prisma.solution.update({
    where: { projectId },
    data: {
      summary: solutionData.summary,
      background: solutionData.background,
    },
  });
}

/**
 * 将 Plan API 产出的 planJob 同步为同 ID 的 Project / Solution / Budget，
 * 使 projectId === planId === 下载接口查询主键。
 */
export async function provisionProjectFromPlan(
  planId: string,
  plan: Plan,
  formInput?: Record<string, unknown> | null,
): Promise<{ created: boolean; projectId: string }> {
  const id = planId.trim();
  if (!id) {
    throw new Error("provisionProjectFromPlan: planId is required");
  }

  const input = planJsonToProjectInput(plan, formInput);

  const existing = await prisma.project.findUnique({
    where: { id },
    include: {
      solution: true,
      budgets: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (existing?.solution && existing.budgets[0]) {
    await prisma.project.update({
      where: { id },
      data: {
        name: input.name,
        clientName: input.clientName,
        industry: input.industry,
        areaM2: input.areaM2,
        targetUsers: input.targetUsers,
        budgetLevel: input.budgetLevel as BudgetLevel,
        notes: input.notes,
      },
    });
    await syncSolutionCopyForClient(id, input);
    return { created: false, projectId: id };
  }

    return { created: false, projectId: id };
  }

  const input = planJsonToProjectInput(plan, formInput);
  const solutionData = generateSolution(input);
  const budgetData = generateBudget(id, []);

  await prisma.$transaction(async (tx) => {
    await tx.project.upsert({
      where: { id },
      update: {
        name: input.name,
        clientName: input.clientName,
        industry: input.industry,
        areaM2: input.areaM2,
        targetUsers: input.targetUsers,
        budgetLevel: input.budgetLevel as BudgetLevel,
        notes: input.notes,
      },
      create: {
        id,
        name: input.name,
        clientName: input.clientName,
        industry: input.industry,
        siteType: SiteType.office,
        areaM2: input.areaM2,
        targetUsers: input.targetUsers,
        city: input.city ?? "上海市",
        budgetLevel: input.budgetLevel as BudgetLevel,
        deliveryMode: DeliveryMode.tender,
        notes: input.notes,
      },
    });

    if (!existing?.solution) {
      await tx.solution.upsert({
        where: { projectId: id },
        update: {
          summary: solutionData.summary,
          background: solutionData.background,
        },
        update: {},
        create: {
          projectId: id,
          summary: solutionData.summary,
          background: solutionData.background,
          requirements: solutionData.requirements as unknown as Prisma.JsonArray,
          objectives: solutionData.objectives as unknown as Prisma.JsonArray,
          zoning: solutionData.zoning as unknown as Prisma.JsonArray,
          implementationPlan:
            solutionData.implementationPlan as unknown as Prisma.JsonArray,
          operationsPlan: solutionData.operationsPlan as unknown as Prisma.JsonArray,
          riskControl: solutionData.riskControl as unknown as Prisma.JsonArray,
          acceptanceCriteria:
            solutionData.acceptanceCriteria as unknown as Prisma.JsonArray,
        },
      });
    }

    if (!existing?.budgets[0]) {
      await tx.budget.create({
        data: {
          projectId: id,
          currency: budgetData.currency,
          totalEstimateMin: budgetData.totalEstimateMin,
          totalEstimateMax: budgetData.totalEstimateMax,
          items: budgetData.items as unknown as Prisma.JsonArray,
          assumptions: budgetData.assumptions as unknown as Prisma.JsonArray,
        },
      });
    }
  });

  return { created: true, projectId: id };
}

/**
 * 下载路径兜底：planJob 存在但 Project 缺失时，按 planJob.id 补建 Project 行。
 */
export async function ensureProjectFromPlanJobId(
  planId: string,
): Promise<boolean> {
  const id = planId.trim();
  if (!/^ATG-\d{8}-\d{4}$/i.test(id)) return false;

  const row = await prisma.planJob.findUnique({ where: { id } });
  if (!row?.plan) return false;

  const plan = row.plan as unknown as Plan;
  if (!plan.meta?.plan_id) {
    plan.meta = {
      ...plan.meta,
      plan_id: id,
      generated_at: plan.meta?.generated_at ?? new Date().toISOString().split("T")[0],
      version: plan.meta?.version ?? "v1",
    };
  if (!plan?.meta?.plan_id) {
    plan.meta = { ...plan.meta, plan_id: id };
  }

  await provisionProjectFromPlan(id, plan, (row.input as Record<string, unknown>) ?? null);
  return true;
}
