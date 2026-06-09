import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { BudgetLevel, DeliveryMode, SiteType } from "@prisma/client";
import {
  extractPlanDocumentTierFromRequest,
  resolvePlanDocumentTier,
} from "@/lib/commercial/planDocumentTier";
import type { ProjectInput } from "@/lib/domain/tender";
import {
  deniedErrorFor,
  isAccessEnabled,
  resolveRequestEntitlement,
} from "@/lib/entitlements/resolveEntitlement";
import {
  createDevProjectFallback,
  isDatabaseConnectivityError,
} from "@/lib/pdf/devFallback";
import { resolveDownloadIds } from "@/lib/http/resolveDownloadIds";
import { sanitizeProductionClientMessage } from "@/lib/http/sanitizeProductionClient";
import { DOWNLOAD_SERVICE_UNAVAILABLE } from "@/lib/client/clientFacingMessages";
import { resolveCompanyName } from "@/lib/plan/resolveCompanyName";
import { prisma } from "@/lib/prisma";
import { renderPlanPdf } from "@/lib/pdf/renderPlanPdf";
import { ensureProjectFromPlanJobId } from "@/lib/services/tender/provisionProjectFromPlan";
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
    clientName: p.clientName ?? "示例企业",
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
  let row;
  try {
    row = await prisma.project.findUnique({
      where: { id: projectId },
      include: { solution: true },
    });
  } catch (error) {
    if (isDatabaseConnectivityError(error)) return;
    throw error;
  }
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
      mode?: string;
      documentTier?: string;
    };

    const { projectId, planId, docType } = body;

    const ids = resolveDownloadIds({ projectId, planId });
    if (!ids.ok) {
      return NextResponse.json(
        { error: ids.error, message: ids.message },
        { status: ids.status },
      );
    }
    const pid = ids.projectId;
    const requestPlanId = ids.entitlementId;

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

    let project;
    try {
      project = await prisma.project.findUnique({
        where: { id: pid },
        include: projectInclude,
      });
    } catch (error) {
      if (
        process.env.NODE_ENV === "production" ||
        !isDatabaseConnectivityError(error)
      ) {
        throw error;
      }
      console.warn("[tender-plan] DEV DB fallback (findUnique)", error);
      project = createDevProjectFallback(pid);
    }

    if (!project) {
      try {
        await ensureProjectFromPlanJobId(pid);
      } catch (provisionErr) {
        console.error("[tender-plan] provision failed (non-fatal)", provisionErr);
      }
      try {
        project = await prisma.project.findUnique({
          where: { id: pid },
          include: projectInclude,
        });
      } catch (reloadAfterProvision) {
        if (
          process.env.NODE_ENV === "production" ||
          !isDatabaseConnectivityError(reloadAfterProvision)
        ) {
          throw reloadAfterProvision;
        }
        console.warn(
          "[tender-plan] DEV DB fallback (reload after provision)",
          reloadAfterProvision,
        );
        project = createDevProjectFallback(pid);
      }
    }

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
            clientName: "示例企业",
            industry: "enterprise",
            city: "上海市",
            notes: "dev: plan route mock project",
          },
          include: projectInclude,
        });
      } catch (upsertError) {
        if (isDatabaseConnectivityError(upsertError)) {
          console.warn("[tender-plan] DEV DB fallback (upsert)", upsertError);
          project = createDevProjectFallback(pid);
        } else {
          return NextResponse.json(
            {
              error: "PROJECT_NOT_FOUND",
              message: "当前 projectId 无效，请从生成流程进入",
            },
            { status: 404 },
          );
        }
      }
    }

    if (!project.solution) {
      await ensureDevSolutionIfMissing(pid);

      try {
        project = await prisma.project.findUnique({
          where: { id: pid },
          include: projectInclude,
        });
      } catch (reloadError) {
        if (
          process.env.NODE_ENV !== "production" &&
          isDatabaseConnectivityError(reloadError)
        ) {
          console.warn("[tender-plan] DEV DB fallback (reload)", reloadError);
          project = createDevProjectFallback(pid);
        } else {
          throw reloadError;
        }
      }
    }

    if (!project?.solution) {
      return NextResponse.json(
        {
          error: "SOLUTION_NOT_READY",
          message: "缺少方案数据（Solution），请先在结果页生成完整投标方案后再下载计划书。",
        },
        { status: 422 },
      );
    }

    const extracted = extractPlanDocumentTierFromRequest(req, body);
    const tierDecision = resolvePlanDocumentTier({
      requestedTier: extracted.tier,
      entitlement,
    });

    if (!tierDecision.ok) {
      return NextResponse.json(
        {
          error: tierDecision.error,
          message: tierDecision.message,
        },
        { status: tierDecision.status },
      );
    }

    const renderTier = tierDecision.renderTier;
    const planFilename =
      renderTier === "free" ? "plan-preview.pdf" : "plan.pdf";

    console.log("[plan-render-tier]", {
      planId: requestPlanId,
      projectId: pid,
      requestedTier: tierDecision.requestedTier,
      renderTier,
      tierSource: extracted.source,
      decisionSource: tierDecision.source,
      effectiveLevel: entitlement.effectiveLevel,
      headerXMode: req.headers.get("x-mode"),
      headerDocumentTier: req.headers.get("x-plan-document-tier"),
    });

    const planJob = await prisma.planJob.findUnique({
      where: { id: pid },
      select: { input: true },
    });
    const resolvedCompany = resolveCompanyName({
      ...((planJob?.input as Record<string, unknown> | null) ?? {}),
      clientName: project.clientName,
    });
    if (resolvedCompany !== project.clientName) {
      project = {
        ...project,
        clientName: resolvedCompany,
        name: `${resolvedCompany}员工健身空间建设项目`,
      };
    }

    const pdfBytes = await renderPlanPdf(
      project,
      project.solution!,
      project.placeholders,
      { tier: renderTier },
    );

    return new Response(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${planFilename}"`,
        "X-Plan-Document-Tier": renderTier,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[tender-plan-error]", err);
    const message = sanitizeProductionClientMessage(
      err instanceof Error ? err.message : "",
      DOWNLOAD_SERVICE_UNAVAILABLE,
    );
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message },
      { status: 500 },
    );
  }
}
