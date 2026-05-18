import { NextResponse } from "next/server";
import { normalizeUserTier } from "@/lib/commercial/userTier";
import {
  deniedErrorFor,
  isAccessEnabled,
  resolveRequestEntitlement,
} from "@/lib/entitlements/resolveEntitlement";
import { prisma } from "@/lib/prisma";
import { renderBudgetPdf } from "@/lib/pdf/renderBudgetPdf";

export const runtime = "nodejs";

/**
 * Budget PDF：权限来源唯一 = entitlement.budgetEnabled。
 * 数据来源：优先 Prisma Budget 行；缺失时使用 stub budget 兜底（避免"完整结果未生成"导致 404）。
 */
export async function POST(req: Request) {
  try {
    const body = (await req.clone().json().catch(() => ({}))) as {
      projectId?: string;
      planId?: string;
      tier?: string;
    };
    const { projectId, planId, tier: bodyTier } = body;
    const requestPlanId =
      (typeof planId === "string" ? planId.trim() : "") ||
      (typeof projectId === "string" ? projectId.trim() : "") ||
      "";

    /** ★ DEBUG：budget 路由原始输入 */
    console.log("[DEBUG][BUDGET][INPUT]", {
      projectId,
      planId: requestPlanId,
      tier: bodyTier ?? null,
    });
    console.log("[DEBUG][BUDGET][PROJECT_ID]", projectId);

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    if (!requestPlanId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    /** —— 权限：entitlement-only —— */
    const { entitlement, source, userId } = await resolveRequestEntitlement({
      req,
      planId: requestPlanId,
    });

    console.log("[DEBUG][BUDGET][ENTITLEMENT]", entitlement);

    const flags = {
      effectiveLevel: entitlement?.effectiveLevel,
      planEnabled: entitlement?.planEnabled,
      budgetEnabled: entitlement?.budgetEnabled,
      zipEnabled: entitlement?.zipEnabled,
      allowed: entitlement?.budgetEnabled === true,
    };
    console.log("[DEBUG][BUDGET][FLAGS]", flags);

    const allowed = flags.allowed;

    console.log("[budget-check] entitlement raw", entitlement);
    console.log(
      "[DEBUG][BUDGET][READ]",
      JSON.stringify({ planId: requestPlanId, entitlement }, null, 2),
    );
    console.log("[access-check]", {
      type: "budget",
      planId: requestPlanId,
      entitlement,
      allowed,
      allowedViaHelper: isAccessEnabled(entitlement, "budget"),
      source,
      userId,
    });

    if (!allowed) {
      console.log("[DEBUG][BUDGET][DECISION]", {
        exists: null,
        allowed: false,
        reason: "BUDGET_NOT_ENTITLED",
      });
      return NextResponse.json(
        { error: deniedErrorFor("budget") },
        { status: 403 },
      );
    }

    /** —— 数据：先查 Project；缺失时 dev 下落 mock，prod 下给清晰错误文案 —— */
    let project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        clientName: true,
        budgetLevel: true,
        areaM2: true,
        targetUsers: true,
      },
    });

    console.log("[DEBUG][BUDGET][PROJECT]", project);

    if (!project) {
      const isDev = process.env.NODE_ENV !== "production";
      if (!isDev) {
        console.log("[DEBUG][BUDGET][DECISION]", {
          exists: false,
          allowed: true,
          reason: "PROJECT_NOT_FOUND",
        });
        return NextResponse.json(
          {
            error: "PROJECT_NOT_FOUND",
            message: "当前 projectId 无效，请从生成流程进入",
          },
          { status: 404 },
        );
      }

      /** dev 兜底：自动 upsert 一份最小可用 mock project（仅开发态，避免测试阻塞） */
      try {
        project = await prisma.project.upsert({
          where: { id: projectId },
          update: {},
          create: {
            id: projectId,
            name: `Mock-${projectId}`,
            siteType: "office",
            budgetLevel: "mid",
            deliveryMode: "enterprise",
            areaM2: 120,
            targetUsers: 200,
          },
          select: {
            id: true,
            name: true,
            clientName: true,
            budgetLevel: true,
            areaM2: true,
            targetUsers: true,
          },
        });
        console.log("[DEBUG][BUDGET][PROJECT_MOCKED]", project);
      } catch (e) {
        console.warn("[DEBUG][BUDGET][PROJECT_MOCK_FAILED]", {
          error: e instanceof Error ? e.message : String(e),
        });
        return NextResponse.json(
          {
            error: "PROJECT_NOT_FOUND",
            message: "当前 projectId 无效，请从生成流程进入",
          },
          { status: 404 },
        );
      }
    }

    const budgetRow = await prisma.budget.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    const renderTier = normalizeUserTier(entitlement.effectiveLevel);

    /** Budget 缺失时的 stub：保证 Pro 用户已付费就能拿到一份预算 PDF（不要求"先生成完整结果"） */
    const budget = budgetRow ?? buildStubBudget(project);

    console.log("[DEBUG][BUDGET][DECISION]", {
      exists: Boolean(budgetRow),
      allowed: true,
      reason: budgetRow ? "REAL_BUDGET" : "STUB_BUDGET_FALLBACK",
      tier: renderTier,
      totalRange: [budget.totalEstimateMin, budget.totalEstimateMax],
    });

    const pdfBytes = await renderBudgetPdf(budget, {
      tier: renderTier,
      planId: requestPlanId,
      companyName: project.clientName ?? project.name ?? "投标企业",
      companySize: project.targetUsers ?? 200,
      budgetLevel: project.budgetLevel,
    });

    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="budget.pdf"',
      },
    });
  } catch (error) {
    console.error("[budget pdf error]", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

/** 用 Project 字段推导一份最小可用的预算（仅在 DB 没有 Budget 行时兜底） */
function buildStubBudget(project: {
  name: string;
  clientName: string | null;
  budgetLevel: "low" | "mid" | "high" | "custom";
  areaM2: number | null;
  targetUsers: number | null;
}) {
  const area = Math.max(80, Math.round(project.areaM2 ?? 120));
  const users = Math.max(50, Math.round(project.targetUsers ?? 200));
  const tierMul =
    project.budgetLevel === "high"
      ? 1.6
      : project.budgetLevel === "low"
        ? 0.7
        : 1.0;

  const items = [
    {
      category: "有氧训练区设备",
      specLevel: "标准",
      quantity: Math.max(4, Math.round(users / 50)),
      unitPriceMin: 7000 * tierMul,
      unitPriceMax: 12000 * tierMul,
      subtotalMin: 28000 * tierMul,
      subtotalMax: 48000 * tierMul,
      sourceType: "placeholder",
      remark: "stub：基于项目规模估算",
    },
    {
      category: "力量训练区设备",
      specLevel: "标准",
      quantity: Math.max(6, Math.round(users / 40)),
      unitPriceMin: 5000 * tierMul,
      unitPriceMax: 9000 * tierMul,
      subtotalMin: 30000 * tierMul,
      subtotalMax: 54000 * tierMul,
      sourceType: "placeholder",
      remark: "stub：基于项目规模估算",
    },
    {
      category: "智能管理与服务",
      specLevel: "标准",
      quantity: 1,
      unitPriceMin: 28000 * tierMul,
      unitPriceMax: 56000 * tierMul,
      subtotalMin: 28000 * tierMul,
      subtotalMax: 56000 * tierMul,
      sourceType: "placeholder",
      remark: "stub：含管理后台与培训",
    },
  ];

  const totalMin = items.reduce((acc, x) => acc + x.subtotalMin, 0);
  const totalMax = items.reduce((acc, x) => acc + x.subtotalMax, 0);

  return {
    currency: "CNY",
    totalEstimateMin: Math.round(totalMin + area * 100 * tierMul),
    totalEstimateMax: Math.round(totalMax + area * 200 * tierMul),
    items,
  };
}
