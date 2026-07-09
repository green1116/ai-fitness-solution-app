/**
 * Shared tender export bundle loading + PDF/ZIP rendering for download routes.
 */
import { normalizeUserTier } from "@/lib/commercial/userTier";
import {
  createDevZipProjectBundle,
  isDatabaseConnectivityError,
} from "@/lib/pdf/devFallback";
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
import { evaluateZipAccess } from "@/lib/entitlements/zipAccess";
import { resolveRequestEntitlement } from "@/lib/entitlements/resolveEntitlement";
import { toSafeEntitlementsDebug } from "@/lib/entitlements/publicEntitlement";
import { prisma } from "@/lib/prisma";
import { provisionZipProjectMinimal } from "@/lib/services/tender/provisionZipProjectMinimal";
import { isProductionRuntime } from "@/lib/http/productionRouteGuard";
import JSZip from "jszip";

export const TENDER_ZIP_FILENAME = "enterprise-package.zip";

const projectInclude = {
  solution: true,
  placeholders: true,
  budgets: { orderBy: { createdAt: "desc" as const }, take: 1 },
} as const;

export type ZipProjectRow = Awaited<
  ReturnType<typeof prisma.project.findFirst<{ include: typeof projectInclude }>>
>;

export function toNodeBuffer(bytes: Buffer | Uint8Array | undefined): Buffer {
  if (!bytes || bytes.length === 0) return Buffer.alloc(0);
  return Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
}

export async function loadProjectForZip(
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
    console.warn("[TENDER-EXPORT] DEV DB fallback (findFirst)", error);
    return {
      project: createDevZipProjectBundle(projectId) as unknown as ZipProjectRow,
      source: "dev-fallback",
    };
  }
}

export async function ensureProjectReadyForZip(
  projectId: string,
  initial: ZipProjectRow | null,
): Promise<{ project: ZipProjectRow; source: "db" | "dev-fallback" | "provisioned" }> {
  if (initial?.solution && initial.budgets[0]) {
    return { project: initial, source: "db" };
  }

  try {
    const pack = await provisionZipProjectMinimal({
      name: `投标导出-${String(projectId).slice(0, 40)}`,
      clientName: "投标企业",
      industry: "enterprise",
      siteType: "office",
      areaM2: 1200,
      targetUsers: 200,
      budgetLevel: "mid",
      deliveryMode: "tender",
      notes: `导出路由自动补库：原请求 projectId=${String(projectId).slice(0, 80)}`,
    });
    const row = await prisma.project.findFirst({
      where: { id: pack.project.id },
      include: projectInclude,
    });
    if (row?.solution && row.budgets[0]) {
      return { project: row, source: "provisioned" };
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production" && isDatabaseConnectivityError(e)) {
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

  throw new Error("TENDER_PROJECT_PROVISION_FAILED");
}

export type TenderExportContext = {
  project: NonNullable<ZipProjectRow>;
  budget: NonNullable<ZipProjectRow>["budgets"][number];
  renderTier: ReturnType<typeof normalizeUserTier>;
  planIdForEnt: string;
  docCtx: ReturnType<typeof buildTenderDocumentContext> & { reqsig: string };
  dataSource: "db" | "dev-fallback" | "provisioned";
};

export async function resolveTenderExportContext(
  req: Request,
  projectId: string,
): Promise<
  | { ok: true; ctx: TenderExportContext }
  | { ok: false; status: number; code: string; message: string; extra?: Record<string, unknown> }
> {
  const body = (await req.clone().json().catch(() => ({}))) as {
    projectId?: string;
    planId?: string;
  };

  const bodyPlanId =
    (typeof body.planId === "string" ? body.planId.trim() : "") ||
    (typeof projectId === "string" ? projectId.trim() : "") ||
    "";
  const headerPlanId = (req.headers.get("x-plan-id") || "").trim();
  const planIdForEnt = (headerPlanId || bodyPlanId || "attaguy-plan").trim() || "attaguy-plan";

  const { entitlement, debug } = await resolveRequestEntitlement({
    req,
    planId: planIdForEnt,
  });

  const zipDecision = evaluateZipAccess({
    entitlement,
    debug,
    planId: planIdForEnt,
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

    return {
      ok: false,
      status: 403,
      code,
      message: zipDecision.userMessage,
      extra: {
        reason: zipDecision.denyReason ?? "ZIP_NOT_ENTITLED",
        planId: planIdForEnt,
        effectiveLevel: entitlement.effectiveLevel,
        diagnostic: toSafeEntitlementsDebug(debug),
      },
    };
  }

  const loaded = await loadProjectForZip(projectId);
  let project: ZipProjectRow;
  let dataSource: TenderExportContext["dataSource"] = loaded.source;

  try {
    const ready = await ensureProjectReadyForZip(projectId, loaded.project);
    project = ready.project;
    dataSource = ready.source;
  } catch (e) {
    return {
      ok: false,
      status: 422,
      code: "TENDER_PROJECT_PROVISION_FAILED",
      message: e instanceof Error ? e.message : "无法在数据库中准备投标项目数据",
      extra: { requestedProjectId: projectId },
    };
  }

  if (!project) {
    return {
      ok: false,
      status: 422,
      code: "TENDER_PROJECT_NOT_FOUND",
      message: "项目不存在",
      extra: { requestedProjectId: projectId, dataSource },
    };
  }

  if (!project.solution) {
    return {
      ok: false,
      status: 422,
      code: "TENDER_PROJECT_NOT_READY",
      message: "缺少可用的 Project / Solution 数据",
      extra: { requestedProjectId: projectId, dataSource },
    };
  }

  const budget = project.budgets[0];
  if (!budget) {
    return {
      ok: false,
      status: 422,
      code: "TENDER_BUDGET_NOT_FOUND",
      message: "项目存在但缺少 Budget 记录",
      extra: { projectId: project.id, dataSource },
    };
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

  return {
    ok: true,
    ctx: {
      project,
      budget,
      renderTier,
      planIdForEnt,
      docCtx: { ...tenderDocument, reqsig: packReqsig },
      dataSource,
    },
  };
}

export async function renderTenderPackPdfBuffer(ctx: TenderExportContext): Promise<Buffer> {
  const { project, budget, renderTier, planIdForEnt, docCtx } = ctx;
  const pdf = toNodeBuffer(
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
      reqsig: docCtx.reqsig,
    }),
  );
  return pdf;
}

export async function renderTenderZipBuffer(ctx: TenderExportContext): Promise<Buffer> {
  const { project, budget, renderTier, planIdForEnt, docCtx } = ctx;

  const planBytes = toNodeBuffer(
    await renderPlanPdf(project, project.solution!, project.placeholders, {
      tier: renderTier,
      tenderDocument: docCtx,
    }),
  );
  const budgetBytes = toNodeBuffer(
    await renderBudgetPdf(budget, {
      tier: renderTier,
      planId: planIdForEnt,
      companyName: project.clientName ?? project.name ?? "投标企业",
      companySize: project.targetUsers ?? 200,
      budgetLevel: project.budgetLevel,
      tenderDocument: docCtx,
    }),
  );

  if (!planBytes.length || !budgetBytes.length) {
    throw new Error("Plan 或 Budget PDF 为空");
  }

  const zip = new JSZip();
  zip.file("plan.pdf", planBytes);
  zip.file("budget.pdf", budgetBytes);

  const isEnterpriseLike = renderTier === "enterprise" || renderTier === "pro";
  if (isEnterpriseLike) {
    try {
      const finalPack = await renderTenderPackPdfBuffer(ctx);
      if (finalPack.length > 0) {
        zip.file("final-tender-pack.pdf", finalPack);
      }
    } catch (mergeErr) {
      console.error("[TENDER-EXPORT] renderTenderPack failed — continuing with plan+budget", mergeErr);
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  if (!zipBuffer?.length) {
    throw new Error("ZIP 打包结果为空");
  }

  return zipBuffer;
}

export function buildTenderPdfFilename(project: NonNullable<ZipProjectRow>, projectId: string): string {
  const safeName = (project?.name ?? "tender")
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `tender-${safeName || "pack"}-${projectId.slice(0, 8)}.pdf`;
}
