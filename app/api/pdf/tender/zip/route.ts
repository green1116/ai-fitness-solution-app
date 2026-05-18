import JSZip from "jszip";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getEntitlement } from "@/lib/entitlement";
import { toSafeEntitlementsDebug } from "@/lib/entitlements/publicEntitlement";
import { normalizeUserTier } from "@/lib/commercial/userTier";
import { prisma } from "@/lib/prisma";
import { renderBudgetPdf } from "@/lib/pdf/renderBudgetPdf";
import { renderPlanPdf } from "@/lib/pdf/renderPlanPdf";
import { renderTenderPack } from "@/lib/pdf/renderTenderPack";
import {
  buildTenderDocumentContext,
  computeTenderPackReqsig,
} from "@/lib/pdf/tenderDocumentContext";
import type {
  BudgetRecord,
  ProductPlaceholder,
  ProjectRecord,
  SolutionRecord,
} from "@/lib/domain/tender";
import { provisionZipProjectMinimal } from "@/lib/services/tender/provisionZipProjectMinimal";

/** App Router：POST /api/pdf/tender/zip；GET 仅用于探测路由是否挂载（避免与业务 404 混淆） */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const projectInclude = {
  solution: true,
  placeholders: true,
  budgets: { orderBy: { createdAt: "desc" as const }, take: 1 },
} as const;

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route: "/api/pdf/tender/zip",
      methods: ["GET", "POST"],
      hint: "POST body: { projectId, planId? } — 若 Network 为 HTML 404 则路由未编译；若为 JSON 见 code 字段",
    },
    { status: 200 },
  );
}

/**
 * 非生产、且仅在 .env.local 显式配置 DEV_ZIP_ALLOWED_PLAN_IDS 时生效（逗号分隔 planId）。
 * 不影响生产；不得依赖 X-Mode / X-Paid。
 */
function isDevZipPlanAllowlist(planId: string): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const raw = process.env.DEV_ZIP_ALLOWED_PLAN_IDS ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length > 0 && ids.includes(planId);
}

export async function POST(req: Request) {
  try {
    console.log("[ZIP] start");
    console.log("[ZIP] POST hit", { t: Date.now() });

    const body = (await req.clone().json().catch(() => ({}))) as {
      projectId?: string;
      planId?: string;
    };

    const { projectId, planId } = body;

    const bodyPlanId =
      (typeof planId === "string" ? planId.trim() : "") ||
      (typeof projectId === "string" ? projectId.trim() : "") ||
      "";

    const headerPlanId = (req.headers.get("x-plan-id") || "").trim();
    const planIdForEnt =
      (headerPlanId || bodyPlanId || "attaguy-plan").trim() || "attaguy-plan";

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const user = await getCurrentUser();
    /** 仅传入 getEntitlement 做 DB 定位；最终权限只看返回值，不把 header 当「付费证明」 */
    const headerLicenseKey = (req.headers.get("x-license-key") || "").trim();

    const { entitlement, debug } = await getEntitlement(planIdForEnt, {
      userId: user?.id ?? null,
      headerLicenseKey,
    });

    const zipFromEntitlement = entitlement.zipEnabled === true;
    const devListed = isDevZipPlanAllowlist(planIdForEnt);
    const allowed = zipFromEntitlement || devListed;

    const diagnostic = toSafeEntitlementsDebug(debug);

    console.log("[DEBUG][ZIP][ENT]", {
      planId: planIdForEnt,
      userId: user?.id ?? null,
      zipFromEntitlement,
      zipEnabled: entitlement.zipEnabled,
      effectiveLevel: entitlement.effectiveLevel,
      devListed,
      winningSource: debug.winningSource,
      diagnostic,
    });

    if (devListed && !zipFromEntitlement) {
      console.warn(
        "[ZIP][DEV] DEV_ZIP_ALLOWED_PLAN_IDS 放行；验证真实权益后请移除环境变量。",
      );
    }

    if (!allowed) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[DEBUG][ZIP][DENY]", { planId: planIdForEnt, diagnostic });
      } else {
        console.warn("[ZIP][DENY]", {
          planId: planIdForEnt,
          effectiveLevel: entitlement.effectiveLevel,
          zipEnabled: entitlement.zipEnabled,
        });
      }
      return NextResponse.json(
        {
          ok: false,
          code: "NOT_ENTITLED",
          reason: "ZIP_NOT_ENTITLED",
          planId: planIdForEnt,
          effectiveLevel: entitlement.effectiveLevel,
          zipEnabled: entitlement.zipEnabled,
          diagnostic,
        },
        { status: 403 },
      );
    }

    let project = await prisma.project.findFirst({
      where: { id: projectId },
      include: projectInclude,
    });

    /**
     * 常见误判：浏览器 Network 显示「404」实为**业务体**里返回了 status=404，
     * 根因是 URL 里的 projectId 从未走 /api/tender/generate 落库（例如占位 test123）。
     * 在**已通过 ZIP 权益校验**的前提下，自动补建一套 Prisma 数据再打包，避免假「路由不存在」。
     */
    if (!project || !project.solution || !project.budgets[0]) {
      console.warn("[ZIP] db-miss-or-incomplete — provisioning package", {
        requestedProjectId: projectId,
        hadRow: Boolean(project),
        hadSolution: Boolean(project?.solution),
        hadBudget: Boolean(project?.budgets[0]),
      });
      try {
        const pack = await provisionZipProjectMinimal({
          name: `投标ZIP-${String(projectId).slice(0, 40)}`,
          clientName: "投标企业",
          industry: "enterprise",
          siteType: "office",
          areaM2: 1200,
          targetUsers: 200,
          budgetLevel: "mid",
          deliveryMode: "tender",
          notes: `ZIP 路由自动补库（最小集、无占位行）：原请求 projectId=${String(projectId).slice(0, 80)}`,
        });
        project = await prisma.project.findFirst({
          where: { id: pack.project.id },
          include: projectInclude,
        });
        console.info("[ZIP] provisioned project for zip", {
          newProjectId: pack.project.id,
          requestedProjectId: projectId,
        });
      } catch (e) {
        console.error("[ZIP] provision_failed", e);
        return NextResponse.json(
          {
            ok: false,
            code: "ZIP_PROJECT_PROVISION_FAILED",
            message:
              e instanceof Error ? e.message : "无法在数据库中准备投标项目数据",
            requestedProjectId: projectId,
          },
          { status: 422 },
        );
      }
    }

    if (!project || !project.solution) {
      return NextResponse.json(
        {
          ok: false,
          code: "ZIP_PROJECT_NOT_READY",
          message: "缺少可用的 Project / Solution 数据（非 Next 路由 404）",
          requestedProjectId: projectId,
        },
        { status: 422 },
      );
    }

    const budget = project.budgets[0];
    if (!budget) {
      return NextResponse.json(
        {
          ok: false,
          code: "ZIP_BUDGET_NOT_FOUND",
          message: "项目存在但缺少 Budget 记录",
          projectId: project.id,
        },
        { status: 422 },
      );
    }

    const eff = (entitlement.effectiveLevel ?? "free") as string;
    const renderTier = normalizeUserTier(eff);

    const tenderDocument = buildTenderDocumentContext({
      projectId: project.id,
      planId: planIdForEnt,
      tier: renderTier,
    });
    // plan/budget/merged 共用同一身份（含 REQSIG）
    const packReqsig = await computeTenderPackReqsig(tenderDocument, {
      budgetLevel: project.budgetLevel,
    });
    const docCtx = { ...tenderDocument, reqsig: packReqsig };

    console.log("[ZIP] tender-context", {
      tenderId: docCtx.tenderId,
      reqsig: packReqsig,
    });

    console.log("[ZIP] renderPlanPdf:start", { projectId: project.id, renderTier });
    const planBytes = await renderPlanPdf(
      project,
      project.solution,
      project.placeholders,
      { tier: renderTier, tenderDocument: docCtx },
    );
    console.log("[ZIP] renderPlanPdf:done", { planBytes: planBytes?.length });
    console.log("planBytes", planBytes?.length);

    console.log("[ZIP] renderBudgetPdf:start", { planId: planIdForEnt });
    const budgetBytes = await renderBudgetPdf(budget, {
      tier: renderTier,
      planId: planIdForEnt,
      companyName: project.clientName ?? project.name ?? "投标企业",
      companySize: project.targetUsers ?? 200,
      budgetLevel: project.budgetLevel,
      tenderDocument: docCtx,
    });
    console.log("[ZIP] renderBudgetPdf:done", { budgetBytes: budgetBytes?.length });
    console.log("budgetBytes", budgetBytes?.length);

    const zip = new JSZip();
    console.log("[ZIP] zip append:start");
    zip.file("plan.pdf", planBytes);
    zip.file("budget.pdf", budgetBytes);

    const isEnterpriseLike = renderTier === "enterprise" || renderTier === "pro";
    let mergedBytes: number | undefined;
    if (isEnterpriseLike) {
      console.log("[ZIP] renderTenderPack:start");
      const finalPack = await renderTenderPack({
        project: project as unknown as ProjectRecord,
        solution: project.solution as unknown as SolutionRecord,
        placeholders: project.placeholders as unknown as ProductPlaceholder[],
        budget: budget as unknown as BudgetRecord,
        tier: renderTier,
        planId: planIdForEnt,
        companyName: project.clientName ?? project.name ?? "投标企业",
        companySize: project.targetUsers ?? 200,
        budgetLevel: project.budgetLevel,
        tenderDocument: docCtx,
        reqsig: packReqsig,
      });
      mergedBytes = finalPack?.length;
      console.log("[ZIP] renderTenderPack:done", { mergedBytes });
      console.log("mergedBytes", mergedBytes);
      zip.file("final-tender-pack.pdf", finalPack);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    console.log("[ZIP] zip append:done", { zipBytes: zipBuffer?.length, mergedBytes });

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="enterprise-pack.zip"',
      },
    });
  } catch (error) {
    console.error("[ZIP][FATAL]", error);
    if (error instanceof Error) {
      console.error("[ZIP][FATAL] message", error.message);
      console.error("[ZIP][FATAL] stack", error.stack);
      const c = (error as Error & { cause?: unknown }).cause;
      if (c !== undefined) console.error("[ZIP][FATAL] cause", c);
    }
    console.error("[zip pdf error]", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
