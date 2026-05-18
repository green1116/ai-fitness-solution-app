import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { BudgetLevel, DeliveryMode, SiteType } from "@prisma/client";
import { normalizeUserTier } from "@/lib/commercial/userTier";
import type { ProjectInput } from "@/lib/domain/tender";
import {
  deniedErrorFor,
  isAccessEnabled,
  resolveRequestEntitlement,
} from "@/lib/entitlements/resolveEntitlement";
import { prisma } from "@/lib/prisma";
import { renderPlanPdf } from "@/lib/pdf/renderPlanPdf";
import { generateSolution } from "@/lib/services/tender/generateSolution";

export const runtime = "nodejs";

const projectInclude = {
  solution: true,
  placeholders: true,
} as const;

function projectInputFromRow(p: {
  name: string;
  clientName: string | null;
  industry: string | null;
  siteType: SiteType;
  areaM2: number | null;
  targetUsers: number | null;
  city: string | null;
  budgetLevel: BudgetLevel;
  deliveryMode: DeliveryMode;
  notes: string | null;
}): ProjectInput {
  return {
    name: p.name,
    clientName: p.clientName ?? "投标企业",
    industry: p.industry ?? "enterprise",
    siteType: p.siteType as ProjectInput["siteType"],
    areaM2: p.areaM2 ?? 1200,
    targetUsers: p.targetUsers ?? 200,
    city: p.city ?? "上海市",
    budgetLevel: p.budgetLevel as ProjectInput["budgetLevel"],
    deliveryMode: p.deliveryMode as ProjectInput["deliveryMode"],
    notes: p.notes ?? undefined,
  };
}

/**
 * 开发态：Project 存在但缺 Solution 时，用 `generateSolution` 补一行，避免测试被空库阻塞。
 */
async function ensureDevSolutionIfMissing(projectId: string): Promise<void> {
  if (process.env.NODE_ENV === "production") return;
  const row = await prisma.project.findUnique({
    where: { id: projectId },
    include: { solution: true },
  });
  if (!row || row.solution) return;
  const input = projectInputFromRow(row);
  const solutionData = generateSolution(input);
  await prisma.solution.create({
    data: {
      projectId: row.id,
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

/**
 * Plan PDF：权限与 budget/zip 同源（`resolveRequestEntitlement` + `isAccessEnabled`）。
 * 成功路径仅返回 `application/pdf` 二进制。
 */
export async function POST(req: Request) {
  try {
    const body = (await req.clone().json().catch(() => ({}))) as {
      projectId?: string;
      planId?: string;
      docType?: string;
      tier?: string;
    };

    const { projectId, planId, docType } = body;

    const pid =
      typeof projectId === "string" && projectId.trim()
        ? projectId.trim()
        : "";
    const requestPlanId =
      typeof planId === "string" && planId.trim() ? planId.trim() : "";

    if (!pid) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    if (!requestPlanId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    const { entitlement, source, userId } = await resolveRequestEntitlement({
      req,
      planId: requestPlanId,
    });

    const allowed = isAccessEnabled(entitlement, "plan");

    console.log("[access-check]", {
      type: "plan",
      planId: requestPlanId,
      projectId: pid,
      docType: docType ?? null,
      entitlement,
      allowed,
      source,
      userId,
    });

    if (!allowed) {
      return NextResponse.json(
        { error: deniedErrorFor("plan") },
        { status: 403 },
      );
    }

    let project = await prisma.project.findUnique({
      where: { id: pid },
      include: projectInclude,
    });

    if (!project) {
      const isDev = process.env.NODE_ENV !== "production";
      if (!isDev) {
        return NextResponse.json(
          {
            error: "PROJECT_NOT_FOUND",
            message: "当前 projectId 无效，请从生成流程进入",
          },
          { status: 404 },
        );
      }
      try {
        project = await prisma.project.upsert({
          where: { id: pid },
          update: {},
          create: {
            id: pid,
            name: `Mock-${pid}`,
            siteType: "office",
            budgetLevel: "mid",
            deliveryMode: "tender",
            areaM2: 120,
            targetUsers: 200,
            clientName: "投标企业",
            industry: "enterprise",
            city: "上海市",
            notes: "dev: plan route mock project",
          },
          include: projectInclude,
        });
      } catch {
        return NextResponse.json(
          {
            error: "PROJECT_NOT_FOUND",
            message: "当前 projectId 无效，请从生成流程进入",
          },
          { status: 404 },
        );
      }
    }

    await ensureDevSolutionIfMissing(pid);

    project = await prisma.project.findUnique({
      where: { id: pid },
      include: projectInclude,
    });

    if (!project?.solution) {
      return NextResponse.json(
        {
          error: "SOLUTION_NOT_READY",
          message: "缺少方案数据（Solution），请先在结果页生成完整投标方案后再下载计划书。",
        },
        { status: 422 },
      );
    }

    const renderTier = normalizeUserTier(entitlement.effectiveLevel);

    const pdfBytes = await renderPlanPdf(
      project,
      project.solution,
      project.placeholders,
      { tier: renderTier },
    );

    return new Response(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="plan.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[tender-plan-error]", err);
    return new Response(null, { status: 500 });
  }
}
