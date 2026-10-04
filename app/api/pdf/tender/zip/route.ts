import JSZip from "jszip";
import type { Budget } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
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
import {
  renderPlanPdf,
  type PlaceholderLike,
  type ProjectLike,
  type SolutionLike,
} from "@/lib/pdf/renderPlanPdf";
import { renderTenderPack } from "@/lib/pdf/renderTenderPack";
import {
  buildTenderDocumentContext,
  computeTenderPackReqsig,
} from "@/lib/pdf/tenderDocumentContext";
import type {
  BudgetRecord,
  ProductPlaceholder,
  ProjectInput,
  ProjectRecord,
  SolutionRecord,
} from "@/lib/domain/tender";
import { runSaasOrgGate } from "@/lib/saas/api-gate";
import { readBudgetQuoteBasis } from "@/lib/services/budget.service";
import {
  buildQuotePlanPdfSource,
  findQuotePlanPdfSourceForProject,
} from "@/lib/services/quote.service";
import {
  loadTenderDeliveryBinding,
  TenderBindingError,
} from "@/lib/services/tender.service";
import { provisionZipProjectMinimal } from "@/lib/services/tender/provisionZipProjectMinimal";
import { generateSolution } from "@/lib/services/tender/generateSolution";
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
const ZIP_ENDPOINT = "/api/pdf/tender/zip";

/** Placeholder Project/Solution/Budget provisioning is a local/dev fixture only; never for production delivery. */
function isProductionDelivery(): boolean {
  return isProductionRuntime() || process.env.NODE_ENV === "production";
}

class ZipDeliveryFactsMissingError extends Error {
  constructor() {
    super("缺少可交付的方案与预算，请先完成方案和预算后再下载");
    this.name = "ZipDeliveryFactsMissingError";
  }
}

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
      hint: "POST body: { projectId, tenderId, planId? } — 成功响应为 application/zip 二进制",
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
  if (isProductionDelivery()) {
    throw new ZipDeliveryFactsMissingError();
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

/** Facts every ZIP document is rendered from. */
type ZipRenderSource = {
  projectId: string;
  budget: Budget;
  budgetLevel: "low" | "mid" | "high" | "custom";
  companySize: number;
  project: ProjectLike;
  solution: SolutionLike;
  placeholders: PlaceholderLike[];
  dataSource: string;
};

type ZipSourceResult = { ok: true; source: ZipRenderSource } | { ok: false; response: Response };

/** Tender-bound delivery requires an org member session; the Tender's project must belong to that org. */
async function resolveZipOrganizationId(
  req: NextRequest,
  projectId: string,
): Promise<{ ok: true; organizationId: string } | { ok: false; response: Response }> {
  try {
    const gate = await runSaasOrgGate(req, ZIP_ENDPOINT, { projectId });
    return { ok: true, organizationId: gate.organizationId };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "SaasAuthError") {
      return { ok: false, response: zipError(401, "ZIP_AUTH_REQUIRED", "请先登录组织账号后再下载投标交付包") };
    }
    if (name === "TenantIsolationError") {
      return { ok: false, response: zipError(403, "TENANT_ISOLATION", "当前投标文件不属于你的组织，无法下载。") };
    }
    if (name === "RateLimitError") {
      return { ok: false, response: zipError(429, "RATE_LIMITED", "下载过于频繁，请稍后再试。") };
    }
    throw err;
  }
}

/** Exactly the Quote + Budget persisted on the Tender; never the project's latest Budget. */
async function resolveTenderBoundSource(
  req: NextRequest,
  params: { projectId: string; tenderId: string; requestedCompanySize?: number },
): Promise<ZipSourceResult> {
  const org = await resolveZipOrganizationId(req, params.projectId);
  if (!org.ok) return org;

  let binding: Awaited<ReturnType<typeof loadTenderDeliveryBinding>>;
  try {
    binding = await loadTenderDeliveryBinding({
      tenderId: params.tenderId,
      projectId: params.projectId,
      organizationId: org.organizationId,
    });
  } catch (err) {
    if (err instanceof TenderBindingError) {
      return { ok: false, response: zipError(err.status, err.code, err.message) };
    }
    if (err instanceof Error && err.name === "TenantIsolationError") {
      return { ok: false, response: zipError(403, "TENANT_ISOLATION", "当前投标文件不属于你的组织，无法下载。") };
    }
    throw err;
  }

  const { project, quote, budget } = binding;
  const quoteSource = buildQuotePlanPdfSource(quote);
  const companySize =
    quoteSource.targetUsers ?? params.requestedCompanySize ?? project.targetUsers ?? 200;
  return {
    ok: true,
    source: {
      projectId: project.id,
      budget,
      budgetLevel: readBudgetQuoteBasis(budget.assumptions)?.budgetTier ?? project.budgetLevel,
      companySize,
      project: { ...quoteSource, targetUsers: companySize },
      solution: quoteSource.solution,
      placeholders: quoteSource.placeholders,
      dataSource: "db-tender",
    },
  };
}

/** Legacy project-level contract (no tenderId): latest Budget of the project. */
async function resolveLegacyProjectSource(params: {
  projectId: string;
  requestedCompanySize?: number;
}): Promise<ZipSourceResult> {
  const pid = params.projectId;
  const requestedCompanySize = params.requestedCompanySize;
  const loaded = await loadProjectForZip(pid);
  let project: ZipProjectRow;
  let dataSource: string = loaded.source;

  const latestBudget =
    loaded.source === "db" ? loaded.project?.budgets[0] : undefined;
  const quoteBasis = latestBudget
    ? readBudgetQuoteBasis(latestBudget.assumptions)
    : null;
  /** Quote-linked Budget：方案事实取自该 Quote 快照，不依赖项目级 Solution / Project.areaM2 */
  const quoteSource =
    quoteBasis && loaded.project
      ? await findQuotePlanPdfSourceForProject(
          quoteBasis.quoteId,
          loaded.project.id,
        )
      : null;

  if (quoteSource) {
    project = loaded.project;
    dataSource = "db-quote";
  } else {
    try {
      const ready = await ensureProjectReadyForZip(pid, loaded.project);
      project = ready.project;
      dataSource = ready.source;
    } catch (e) {
      if (e instanceof ZipDeliveryFactsMissingError) {
        return {
          ok: false,
          response: zipError(422, "ZIP_DELIVERY_FACTS_MISSING", e.message, {
            requestedProjectId: pid,
          }),
        };
      }
      console.error("[ZIP] ensureProjectReadyForZip failed", e);
      return {
        ok: false,
        response: zipError(
          422,
          "ZIP_PROJECT_PROVISION_FAILED",
          e instanceof Error
            ? e.message
            : "无法在数据库中准备投标项目数据",
          { requestedProjectId: pid },
        ),
      };
    }
  }

  if (!project || (!quoteSource && !project.solution)) {
    return {
      ok: false,
      response: zipError(
        422,
        "ZIP_PROJECT_NOT_READY",
        "缺少可用的 Project / Solution 数据",
        { requestedProjectId: pid, dataSource },
      ),
    };
  }

  const budget = project.budgets[0];
  if (!budget) {
    return {
      ok: false,
      response: zipError(
        422,
        "ZIP_BUDGET_NOT_FOUND",
        "项目存在但缺少 Budget 记录",
        { projectId: project.id, dataSource },
      ),
    };
  }

  let companySize: number;
  let projectForRender: ProjectLike;
  let solutionForRender: SolutionLike;
  let placeholdersForRender: PlaceholderLike[];

  if (quoteSource) {
    companySize =
      quoteSource.targetUsers ?? requestedCompanySize ?? project.targetUsers ?? 200;
    projectForRender = { ...quoteSource, targetUsers: companySize };
    solutionForRender = quoteSource.solution;
    placeholdersForRender = quoteSource.placeholders;
  } else {
    const legacySolution = project.solution!;
    companySize = requestedCompanySize ?? project.targetUsers ?? 200;
    /** 仅本次渲染覆盖人数元数据，不写回 DB */
    projectForRender = { ...project, targetUsers: companySize };

    const projectInputForRender: ProjectInput = {
      name: project.name,
      clientName: project.clientName ?? undefined,
      industry: project.industry ?? undefined,
      siteType: project.siteType as ProjectInput["siteType"],
      areaM2: project.areaM2 ?? undefined,
      targetUsers: companySize,
      city: project.city ?? undefined,
      budgetLevel: project.budgetLevel as ProjectInput["budgetLevel"],
      deliveryMode: project.deliveryMode as ProjectInput["deliveryMode"],
      notes: project.notes ?? undefined,
    };
    const generatedSolution = generateSolution(projectInputForRender);
    /** 临时 Solution：按当前 companySize 重算正文/分区，不更新 prisma.solution */
    solutionForRender = {
      id: legacySolution.id,
      projectId: project.id,
      summary: generatedSolution.summary,
      background: generatedSolution.background,
      requirements: generatedSolution.requirements,
      objectives: generatedSolution.objectives,
      zoning: generatedSolution.zoning,
      implementationPlan: generatedSolution.implementationPlan,
      operationsPlan: generatedSolution.operationsPlan,
      riskControl: generatedSolution.riskControl,
      acceptanceCriteria: generatedSolution.acceptanceCriteria,
      createdAt: legacySolution.createdAt,
      updatedAt: legacySolution.updatedAt,
    };
    placeholdersForRender = project.placeholders;
  }

  return {
    ok: true,
    source: {
      projectId: project.id,
      budget,
      budgetLevel: quoteBasis?.budgetTier ?? project.budgetLevel,
      companySize,
      project: projectForRender,
      solution: solutionForRender,
      placeholders: placeholdersForRender,
      dataSource,
    },
  };
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    console.log("[ZIP] POST start", { t: startedAt });

    const body = (await req.clone().json().catch(() => ({}))) as {
      projectId?: string;
      planId?: string;
      tenderId?: unknown;
      companySize?: unknown;
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

    const tenderIdRequested = Object.prototype.hasOwnProperty.call(body, "tenderId");
    const requestedTenderId =
      typeof body.tenderId === "string" ? body.tenderId.trim() : "";
    if (tenderIdRequested && !requestedTenderId) {
      return zipError(400, "TENDER_ID_REQUIRED", "缺少 tenderId");
    }

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

    const bodyCompanySize = Number(body.companySize);
    const requestedCompanySize =
      Number.isFinite(bodyCompanySize) && bodyCompanySize > 0
        ? Math.round(bodyCompanySize)
        : undefined;

    const resolved =
      tenderIdRequested
        ? await resolveTenderBoundSource(req, {
            projectId: pid,
            tenderId: requestedTenderId,
            requestedCompanySize,
          })
        : await resolveLegacyProjectSource({ projectId: pid, requestedCompanySize });
    if (!resolved.ok) return resolved.response;

    const {
      projectId: renderProjectId,
      budget,
      budgetLevel: budgetLevelForRender,
      companySize,
      project: projectForRender,
      solution: solutionForRender,
      placeholders: placeholdersForRender,
      dataSource,
    } = resolved.source;

    const companyNameForRender =
      projectForRender.clientName ?? projectForRender.name ?? "投标企业";

    const renderTier = normalizeUserTier(entitlement.effectiveLevel ?? "free");

    const tenderDocument = buildTenderDocumentContext({
      projectId: renderProjectId,
      planId: planIdForEnt,
      tier: renderTier,
    });
    const packReqsig = await computeTenderPackReqsig(tenderDocument, {
      budgetLevel: budgetLevelForRender,
    });
    const docCtx = { ...tenderDocument, reqsig: packReqsig };

    console.log("[ZIP] render start", {
      projectId: renderProjectId,
      renderTier,
      dataSource,
      tenderId: docCtx.tenderId,
      companySize,
    });

    let planBytes: Buffer;
    let budgetBytes: Buffer;
    try {
      planBytes = toNodeBuffer(
        await renderPlanPdf(
          projectForRender,
          solutionForRender,
          placeholdersForRender,
          {
            tier: renderTier,
            tenderDocument: docCtx,
          },
        ),
      );
      budgetBytes = toNodeBuffer(
        await renderBudgetPdf(budget, {
          tier: renderTier,
          planId: planIdForEnt,
          companyName: companyNameForRender,
          companySize,
          budgetLevel: budgetLevelForRender,
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
        { projectId: renderProjectId },
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
            project: projectForRender as unknown as ProjectRecord,
            solution: solutionForRender as unknown as SolutionRecord,
            placeholders: placeholdersForRender as unknown as ProductPlaceholder[],
            budget: budget as unknown as BudgetRecord,
            tier: renderTier,
            planId: planIdForEnt,
            companyName: companyNameForRender,
            companySize,
            budgetLevel: budgetLevelForRender,
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
