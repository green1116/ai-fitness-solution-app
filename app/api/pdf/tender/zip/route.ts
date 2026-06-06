import JSZip from "jszip";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { toSafeEntitlementsDebug } from "@/lib/entitlements/publicEntitlement";
import { evaluateZipAccess } from "@/lib/entitlements/zipAccess";
import { resolveRequestEntitlement } from "@/lib/entitlements/resolveEntitlement";
import { normalizeUserTier } from "@/lib/commercial/userTier";
import {
  createDevZipProjectBundle,
  isDatabaseConnectivityError,
} from "@/lib/pdf/devFallback";
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
import { isProductionRuntime } from "@/lib/http/productionRouteGuard";
import {
  clientErrorExtras,
  sanitizeProductionClientMessage,
} from "@/lib/http/sanitizeProductionClient";

/** App Router：POST /api/pdf/tender/zip；GET 仅用于探测路由是否挂载 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** 合并 PDF 耗时较长，避免平台默认超时过早中断 */
export const maxDuration = 120;

const ZIP_FILENAME = "enterprise-package.zip";

const projectInclude = {
  solution: true,
  placeholders: true,
  budgets: { orderBy: { createdAt: "desc" as const }, take: 1 },
} as const;

type ZipProjectRow = Awaited<
  ReturnType<typeof prisma.project.findFirst<{ include: typeof projectInclude }>>
>;

function zipError(
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>,
) {
  const safeMessage = sanitizeProductionClientMessage(
    message,
    status >= 500 ? "ZIP 打包内部错误，请稍后重试" : message,
  );
  const clientExtra = clientErrorExtras(extra);
  const body: Record<string, unknown> = {
    ok: false,
    code,
    message: safeMessage,
  };
  if (clientExtra) Object.assign(body, clientExtra);
  return NextResponse.json(body, { status });
}

function toNodeBuffer(bytes: Buffer | Uint8Array | undefined): Buffer {
  if (!bytes || bytes.length === 0) return Buffer.alloc(0);
  return Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
}

function zipBinaryResponse(zipBuffer: Buffer) {
  const body = new Uint8Array(zipBuffer);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${ZIP_FILENAME}"`,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route: "/api/pdf/tender/zip",
      methods: ["GET", "POST"],
      hint: "POST body: { projectId, planId? } — 成功响应为 application/zip 二进制",
    },
    { status: 200 },
  );
}

async function loadProjectForZip(
  projectId: string,
): Promise<{ project: ZipProjectRow; source: "db" | "dev-fallback" }> {
  try {
    const row = await prisma.project.findFirst({
      where: { id: projectId },
      include: projectInclude,
    });
    if (row?.solution && row.budgets[0]) {
      return { project: row, source: "db" };
    }
    return { project: row, source: "db" };
  } catch (error) {
    if (isProductionRuntime() || !isDatabaseConnectivityError(error)) {
      throw error;
    }
    console.warn("[ZIP] DEV DB fallback (findFirst)", error);
    return {
      project: createDevZipProjectBundle(projectId) as unknown as ZipProjectRow,
      source: "dev-fallback",
    };
  }
}

async function ensureProjectReadyForZip(
  projectId: string,
  initial: ZipProjectRow | null,
): Promise<{ project: ZipProjectRow; source: "db" | "dev-fallback" | "provisioned" }> {
  if (initial?.solution && initial.budgets[0]) {
    return { project: initial, source: "db" };
  }

  console.warn("[ZIP] db-miss-or-incomplete — provisioning or fallback", {
    requestedProjectId: projectId,
    hadRow: Boolean(initial),
    hadSolution: Boolean(initial?.solution),
    hadBudget: Boolean(initial?.budgets[0]),
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
      notes: `ZIP 路由自动补库：原请求 projectId=${String(projectId).slice(0, 80)}`,
    });
    const row = await prisma.project.findFirst({
      where: { id: pack.project.id },
      include: projectInclude,
    });
    if (row?.solution && row.budgets[0]) {
      console.info("[ZIP] provisioned project for zip", {
        newProjectId: pack.project.id,
        requestedProjectId: projectId,
      });
      return { project: row, source: "provisioned" };
    }
  } catch (e) {
    if (
      process.env.NODE_ENV !== "production" &&
      isDatabaseConnectivityError(e)
    ) {
      console.warn("[ZIP] DEV DB fallback (provision)", e);
      return {
        project: createDevZipProjectBundle(projectId) as unknown as ZipProjectRow,
        source: "dev-fallback",
      };
    }
    throw e;
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      project: createDevZipProjectBundle(projectId) as unknown as ZipProjectRow,
      source: "dev-fallback",
    };
  }

  throw new Error("ZIP_PROJECT_PROVISION_FAILED");
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    console.log("[ZIP] POST start", { t: startedAt });

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

    if (!projectId || !String(projectId).trim()) {
      return zipError(400, "ZIP_BAD_REQUEST", "projectId is required");
    }

    const pid = String(projectId).trim();

    const { entitlement, debug, source, userId } =
      await resolveRequestEntitlement({
        req,
        planId: planIdForEnt,
      });

    const zipDecision = evaluateZipAccess({
      entitlement,
      debug,
      planId: planIdForEnt,
    });

    const diagnostic = toSafeEntitlementsDebug(debug);

    console.log("[ZIP] entitlement", {
      planId: planIdForEnt,
      projectId: pid,
      source,
      userId,
      effectiveLevel: zipDecision.effectiveLevel,
      zipFromEntitlement: zipDecision.zipFromEntitlement,
      zipFromEnterprisePurchase: zipDecision.zipFromEnterprisePurchase,
      purchaseStatus: zipDecision.purchaseStatus,
      devListed: zipDecision.devListed,
      devBypass: zipDecision.devBypass,
      allowed: zipDecision.allowed,
      allowedReason: zipDecision.allowedReason,
      denyReason: zipDecision.denyReason ?? null,
      zipEnabled: entitlement.zipEnabled,
      budgetEnabled: entitlement.budgetEnabled,
      paidOrderCount: debug.paidOrders.length,
      orderWinner: debug.orderWinner,
      licenseWinner: debug.licenseWinner,
      finalRank: debug.finalRank,
      winningSource: debug.winningSource,
      diagnostic,
    });

    if (!zipDecision.allowed) {
      const code =
        zipDecision.denyReason === "NOT_PURCHASED"
          ? "ZIP_NOT_PURCHASED"
          : zipDecision.denyReason === "TIER_INSUFFICIENT"
            ? "ZIP_TIER_INSUFFICIENT"
            : zipDecision.denyReason === "DEV_NOT_ALLOWLISTED"
              ? "ZIP_DEV_NOT_ALLOWLISTED"
              : "ZIP_NOT_ENTITLED";

      return zipError(403, code, zipDecision.userMessage, {
        reason: zipDecision.denyReason ?? "ZIP_NOT_ENTITLED",
        planId: planIdForEnt,
        effectiveLevel: entitlement.effectiveLevel,
        zipEnabled: entitlement.zipEnabled,
        purchaseStatus: zipDecision.purchaseStatus,
        allowedReason: zipDecision.allowedReason,
        diagnostic,
        winningSource: debug.winningSource,
      });
    }

    const loaded = await loadProjectForZip(pid);
    let project: ZipProjectRow;
    let dataSource: string = loaded.source;

    try {
      const ready = await ensureProjectReadyForZip(pid, loaded.project);
      project = ready.project;
      dataSource = ready.source;
    } catch (e) {
      console.error("[ZIP] ensureProjectReadyForZip failed", e);
      return zipError(
        422,
        "ZIP_PROJECT_PROVISION_FAILED",
        e instanceof Error
          ? e.message
          : "无法在数据库中准备投标项目数据",
        { requestedProjectId: pid },
      );
    }

    if (!project?.solution) {
      return zipError(
        422,
        "ZIP_PROJECT_NOT_READY",
        "缺少可用的 Project / Solution 数据",
        { requestedProjectId: pid, dataSource },
      );
    }

    const budget = project.budgets[0];
    if (!budget) {
      return zipError(
        422,
        "ZIP_BUDGET_NOT_FOUND",
        "项目存在但缺少 Budget 记录",
        { projectId: project.id, dataSource },
      );
    }

    const renderTier = normalizeUserTier(entitlement.effectiveLevel ?? "free");

    const tenderDocument = buildTenderDocumentContext({
      projectId: project.id,
      planId: planIdForEnt,
      tier: renderTier,
    });
    const packReqsig = await computeTenderPackReqsig(tenderDocument, {
      budgetLevel: project.budgetLevel,
    });
    const docCtx = { ...tenderDocument, reqsig: packReqsig };

    console.log("[ZIP] render start", {
      projectId: project.id,
      renderTier,
      dataSource,
      tenderId: docCtx.tenderId,
    });

    let planBytes: Buffer;
    let budgetBytes: Buffer;
    try {
      planBytes = toNodeBuffer(
        await renderPlanPdf(project, project.solution, project.placeholders, {
          tier: renderTier,
          tenderDocument: docCtx,
        }),
      );
      budgetBytes = toNodeBuffer(
        await renderBudgetPdf(budget, {
          tier: renderTier,
          planId: planIdForEnt,
          companyName: project.clientName ?? project.name ?? "投标企业",
          companySize: project.targetUsers ?? 200,
          budgetLevel: project.budgetLevel,
          tenderDocument: docCtx,
        }),
      );
    } catch (renderErr) {
      console.error("[ZIP] pdf render failed", renderErr);
      return zipError(
        500,
        "ZIP_PDF_RENDER_FAILED",
        renderErr instanceof Error
          ? renderErr.message
          : "Plan 或 Budget PDF 生成失败",
        { projectId: project.id },
      );
    }

    if (!planBytes.length || !budgetBytes.length) {
      console.error("[ZIP] empty pdf bytes", {
        planBytes: planBytes.length,
        budgetBytes: budgetBytes.length,
      });
      return zipError(500, "ZIP_PDF_EMPTY", "Plan 或 Budget PDF 为空", {
        planBytes: planBytes.length,
        budgetBytes: budgetBytes.length,
      });
    }

    console.log("[ZIP] pdf rendered", {
      planBytes: planBytes.length,
      budgetBytes: budgetBytes.length,
    });

    const zip = new JSZip();
    zip.file("plan.pdf", planBytes);
    zip.file("budget.pdf", budgetBytes);

    const isEnterpriseLike = renderTier === "enterprise" || renderTier === "pro";
    if (isEnterpriseLike) {
      try {
        console.log("[ZIP] renderTenderPack:start");
        const finalPack = toNodeBuffer(
          await renderTenderPack({
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
          }),
        );
        if (finalPack.length > 0) {
          zip.file("final-tender-pack.pdf", finalPack);
          console.log("[ZIP] renderTenderPack:done", {
            mergedBytes: finalPack.length,
          });
        } else {
          console.warn("[ZIP] renderTenderPack returned empty — zip has plan+budget only");
        }
      } catch (mergeErr) {
        console.error("[ZIP] renderTenderPack failed — continuing with plan+budget", mergeErr);
      }
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    if (!zipBuffer?.length) {
      return zipError(500, "ZIP_EMPTY", "ZIP 打包结果为空");
    }

    console.log("[ZIP] success", {
      zipBytes: zipBuffer.length,
      elapsedMs: Date.now() - startedAt,
      dataSource,
    });

    return zipBinaryResponse(zipBuffer);
  } catch (error) {
    console.error("[ZIP][FATAL]", error);
    if (error instanceof Error && error.stack) {
      console.error("[ZIP][FATAL] stack", error.stack);
    }
    const message = sanitizeProductionClientMessage(
      error instanceof Error ? error.message : "ZIP 打包内部错误",
      "ZIP 打包内部错误，请稍后重试",
    );
    return zipError(500, "ZIP_INTERNAL_ERROR", message);
  }
}
