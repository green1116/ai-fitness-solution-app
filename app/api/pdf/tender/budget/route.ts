import { NextRequest, NextResponse } from "next/server";
import type { UserTier } from "@/lib/commercial/userTier";
import { normalizeLevel } from "@/lib/entitlement";
import { deniedErrorFor, resolveRequestEntitlement } from "@/lib/entitlements/resolveEntitlement";
import {
  devProjectFallbackBudgetSelect,
  isDatabaseConnectivityError,
} from "@/lib/pdf/devFallback";
import { resolveDownloadIds } from "@/lib/http/resolveDownloadIds";
import { sanitizeProductionClientMessage } from "@/lib/http/sanitizeProductionClient";
import { DOWNLOAD_SERVICE_UNAVAILABLE } from "@/lib/client/clientFacingMessages";
import { resolveOrganizationFeatures } from "@/lib/billing/subscription/subscription.resolver";
import { prisma } from "@/lib/prisma";
import { renderBudgetPdf } from "@/lib/pdf/renderBudgetPdf";
import { runSaasOrgGate } from "@/lib/saas/api-gate";
import { ensureProjectFromPlanJobId } from "@/lib/services/tender/provisionProjectFromPlan";

export const runtime = "nodejs";

const BUDGET_PDF_ENDPOINT = "/api/pdf/tender/budget";
const BUDGET_NOT_ENTITLED_MESSAGE = "当前套餐不包含预算 PDF 下载，请升级专业版后重试。";
const LEGACY_NOT_LINKED_MESSAGE = "当前账号没有该方案的预算 PDF 授权（需本人购买或绑定该方案的专业版授权）。";

function parseRequestBudgetTier(raw: unknown): "low" | "mid" | "high" | undefined {
  const value = String(raw ?? "").trim().toLowerCase();
  if (value === "low" || value === "mid" || value === "high") return value;
  return undefined;
}

function deny(status: number, error: string, message: string) {
  return NextResponse.json({ error, message }, { status });
}

type SaasIdentity =
  | { kind: "member"; organizationId: string; userId: string }
  | { kind: "none"; reason: "SaasAuthError" | "FeatureGateError" }
  | { kind: "denied"; response: NextResponse };

/**
 * Org session identity without feature/usage checks: the gate's rate-limit bucket is this
 * endpoint (not /api/budget/calculate) and no UsageRecord is written, so a download never
 * consumes Budget generation quota. No session / org / membership / role → kind "none".
 */
async function resolveSaasIdentity(
  req: NextRequest,
  projectId: string,
): Promise<SaasIdentity> {
  try {
    const gate = await runSaasOrgGate(req, BUDGET_PDF_ENDPOINT, { projectId });
    return { kind: "member", organizationId: gate.organizationId, userId: gate.userId };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "SaasAuthError" || name === "FeatureGateError") return { kind: "none", reason: name };
    if (name === "TenantIsolationError") {
      return {
        kind: "denied",
        response: deny(403, "TENANT_ISOLATION", "当前项目不属于你的组织，无法下载预算 PDF。"),
      };
    }
    if (name === "RateLimitError") {
      return {
        kind: "denied",
        response: deny(429, "RATE_LIMITED", "下载过于频繁，请稍后再试。"),
      };
    }
    throw err;
  }
}

function tierFromSaasPlan(plan: string): UserTier {
  return plan === "ENTERPRISE" ? "enterprise" : "pro";
}

function denyWithoutOrganization(reason: "SaasAuthError" | "FeatureGateError") {
  console.log("[DEBUG][BUDGET][DECISION]", { allowed: false, reason });
  return reason === "SaasAuthError"
    ? deny(401, "ORGANIZATION_CONTEXT_REQUIRED", "请登录并从所属组织的项目页下载该预算 PDF。")
    : deny(403, "ROLE_NOT_PERMITTED", "当前账号在该组织中无权下载预算 PDF。");
}

const LEGACY_LEVEL_RANK = { free: 0, pro: 1, enterprise: 2 } as const;

type LinkedLegacyAccess =
  | { kind: "login-required" }
  | { kind: "not-linked" }
  | { kind: "linked"; tier: UserTier };

/**
 * 无组织历史项目的 legacy 授权只认与当前登录用户可靠关联、且精确限定到该 planId 的记录：
 * 本人绑定的 License、本人请求携带的 License key、本人支付的 UpgradeOrder。
 * 匿名、通配 License（planId 为空）、未绑定的 plan-scope License、他人或无主的已支付订单均不授权。
 */
async function resolveLinkedLegacyAccess(req: NextRequest, planId: string): Promise<LinkedLegacyAccess> {
  const { userId, debug } = await resolveRequestEntitlement({ req, planId });
  if (!userId) return { kind: "login-required" };

  let rank = 0;
  for (const candidate of debug.licenseCandidates) {
    if (candidate.planId !== planId) continue;
    if (candidate.source !== "binding" && candidate.source !== "header-key") continue;
    rank = Math.max(rank, LEGACY_LEVEL_RANK[candidate.level]);
  }
  const paidOrderIds = debug.paidOrders.map((order) => order.id);
  if (paidOrderIds.length > 0) {
    const ownOrders = await prisma.upgradeOrder.findMany({
      where: { id: { in: paidOrderIds }, planId, userId },
      select: { targetLevel: true },
    });
    for (const order of ownOrders) {
      rank = Math.max(rank, LEGACY_LEVEL_RANK[normalizeLevel(order.targetLevel)]);
    }
  }
  if (rank === 0) return { kind: "not-linked" };
  return { kind: "linked", tier: rank >= 2 ? "enterprise" : "pro" };
}

/**
 * Budget PDF 授权：
 * 1) 有 organizationId 的项目（以及任何带 budgetId 的请求）：组织会话 + 成员资格 + 项目归属当前组织 +
 *    订阅计划含 canGenerateBudget（与预算计算同一能力，只读，不计用量）；任一不满足即拒绝，不走 legacy。
 * 2) 无 organizationId 的历史项目（或尚未建档的 plan）且未带 budgetId：仅 resolveLinkedLegacyAccess 认可的
 *    本人关联授权；未登录 401，无可靠关联 403。授权通过后才允许建档 / 读取最新 Budget / stub。
 * budgetId 字段存在但不是非空字符串时直接 400。
 * 数据来源：请求带 budgetId 时只用该 Budget（须属于 projectId）；未带时沿用最新 Budget / stub 兜底。
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.clone().json().catch(() => ({}))) as {
      projectId?: string;
      planId?: string;
      budgetId?: unknown;
      tier?: string;
      companySize?: unknown;
      budgetTier?: unknown;
      budgetLevel?: unknown;
    };
    const { projectId, planId, tier: bodyTier } = body;
    const requestBudgetId = typeof body.budgetId === "string" ? body.budgetId.trim() : "";
    if (body.budgetId !== undefined && body.budgetId !== null && !requestBudgetId) {
      return deny(400, "INVALID_BUDGET_ID", "预算编号无效，请从项目页重新进入预算后再下载。");
    }

    const ids = resolveDownloadIds({ projectId, planId });
    if (!ids.ok) {
      return NextResponse.json(
        { error: ids.error, message: ids.message },
        { status: ids.status },
      );
    }
    const resolvedProjectId = ids.projectId;
    const requestPlanId = ids.entitlementId;

    console.log("[DEBUG][BUDGET][INPUT]", {
      projectId: resolvedProjectId,
      planId: requestPlanId,
      budgetId: requestBudgetId || null,
      tier: bodyTier ?? null,
    });

    let renderTier: UserTier;
    let accessSource: "saas-subscription" | "legacy-linked-entitlement";

    const identity = await resolveSaasIdentity(req, resolvedProjectId);
    if (identity.kind === "denied") return identity.response;
    if (requestBudgetId && identity.kind === "none") return denyWithoutOrganization(identity.reason);

    const owner = await prisma.project.findUnique({
      where: { id: resolvedProjectId },
      select: { organizationId: true },
    });
    const ownerOrganizationId = owner?.organizationId?.trim() || "";

    if (ownerOrganizationId || requestBudgetId) {
      if (identity.kind === "none") return denyWithoutOrganization(identity.reason);
      if (!owner) {
        return NextResponse.json(
          { error: "PROJECT_NOT_FOUND", message: "当前 projectId 无效，请从生成流程进入" },
          { status: 404 },
        );
      }
      if (ownerOrganizationId !== identity.organizationId) {
        console.log("[DEBUG][BUDGET][DECISION]", { allowed: false, reason: "TENANT_ISOLATION" });
        return deny(403, "TENANT_ISOLATION", "当前项目不属于你的组织，无法下载预算 PDF。");
      }
      const features = await resolveOrganizationFeatures(identity.organizationId);
      if (!features.flags.canGenerateBudget) {
        console.log("[DEBUG][BUDGET][DECISION]", { allowed: false, reason: "BUDGET_NOT_ENTITLED" });
        return deny(403, deniedErrorFor("budget"), BUDGET_NOT_ENTITLED_MESSAGE);
      }
      renderTier = tierFromSaasPlan(features.plan);
      accessSource = "saas-subscription";
    } else {
      const legacy = await resolveLinkedLegacyAccess(req, requestPlanId);
      console.log("[access-check]", { type: "budget", planId: requestPlanId, legacy: legacy.kind });
      if (legacy.kind === "login-required") {
        return deny(401, "LEGACY_LOGIN_REQUIRED", "请登录购买或绑定该方案授权的账号后再下载预算 PDF。");
      }
      if (legacy.kind === "not-linked") {
        return deny(403, deniedErrorFor("budget"), LEGACY_NOT_LINKED_MESSAGE);
      }
      renderTier = legacy.tier;
      accessSource = "legacy-linked-entitlement";
    }
    console.log("[DEBUG][BUDGET][ACCESS]", { allowed: true, source: accessSource, tier: renderTier });

    const projectSelect = {
      id: true,
      name: true,
      clientName: true,
      budgetLevel: true,
      areaM2: true,
      targetUsers: true,
    } as const;

    /** —— 数据：先查 Project；缺失时 dev 下落 mock，prod 下给清晰错误文案 —— */
    let project;
    try {
      project = await prisma.project.findUnique({
        where: { id: resolvedProjectId },
        select: projectSelect,
      });
    } catch (error) {
      if (
        process.env.NODE_ENV === "production" ||
        !isDatabaseConnectivityError(error)
      ) {
        throw error;
      }
      console.warn("[tender-budget] DEV DB fallback (findUnique)", error);
      project = devProjectFallbackBudgetSelect(resolvedProjectId);
    }

    console.log("[DEBUG][BUDGET][PROJECT]", project);

    if (!project && requestBudgetId) {
      return NextResponse.json(
        { error: "PROJECT_NOT_FOUND", message: "当前 projectId 无效，请从生成流程进入" },
        { status: 404 },
      );
    }
    if (!project) {
      try {
        await ensureProjectFromPlanJobId(resolvedProjectId);
      } catch (provisionErr) {
        console.error("[tender-budget] provision failed (non-fatal)", provisionErr);
      }
      try {
        project = await prisma.project.findUnique({
          where: { id: resolvedProjectId },
          select: projectSelect,
        });
      } catch (reloadAfterProvision) {
        if (
          process.env.NODE_ENV === "production" ||
          !isDatabaseConnectivityError(reloadAfterProvision)
        ) {
          throw reloadAfterProvision;
        }
        console.warn(
          "[tender-budget] DEV DB fallback (reload after provision)",
          reloadAfterProvision,
        );
        project = devProjectFallbackBudgetSelect(resolvedProjectId);
      }
    }

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
          where: { id: resolvedProjectId },
          update: {},
          create: {
            id: resolvedProjectId,
            name: `Mock-${resolvedProjectId}`,
            siteType: "office",
            budgetLevel: "mid",
            deliveryMode: "enterprise",
            areaM2: 120,
            targetUsers: 200,
          },
          select: projectSelect,
        });
        console.log("[DEBUG][BUDGET][PROJECT_MOCKED]", project);
      } catch (e) {
        if (isDatabaseConnectivityError(e)) {
          console.warn("[tender-budget] DEV DB fallback (upsert)", e);
          project = devProjectFallbackBudgetSelect(resolvedProjectId);
        } else {
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
    }

    let budgetRow = null;
    if (requestBudgetId) {
      budgetRow = await prisma.budget.findUnique({ where: { id: requestBudgetId } });
      if (!budgetRow) {
        return deny(404, "BUDGET_NOT_FOUND", "未找到当前预算，请重新计算预算后再下载。");
      }
      if (budgetRow.projectId !== resolvedProjectId) {
        console.log("[DEBUG][BUDGET][DECISION]", { allowed: false, reason: "BUDGET_PROJECT_MISMATCH" });
        return deny(409, "BUDGET_PROJECT_MISMATCH", "该预算不属于当前项目，请从项目页重新进入预算。");
      }
    } else {
      try {
        budgetRow = await prisma.budget.findFirst({
          where: { projectId: resolvedProjectId },
          orderBy: { createdAt: "desc" },
        });
      } catch (error) {
        if (
          process.env.NODE_ENV === "production" ||
          !isDatabaseConnectivityError(error)
        ) {
          throw error;
        }
        console.warn(
          "[tender-budget] DEV DB fallback (budget findFirst); using stub budget",
          error,
        );
      }
    }

    /** 仅旧调用方（未带 budgetId）且 Budget 缺失时使用 stub；带 budgetId 时上方已保证 budgetRow 存在 */
    const budget = budgetRow ?? buildStubBudget(project);

    console.log("[DEBUG][BUDGET][DECISION]", {
      exists: Boolean(budgetRow),
      allowed: true,
      reason: budgetRow ? "REAL_BUDGET" : "STUB_BUDGET_FALLBACK",
      tier: renderTier,
      totalRange: [budget.totalEstimateMin, budget.totalEstimateMax],
    });

    const bodyCompanySize = Number(body.companySize);
    const companySize =
      Number.isFinite(bodyCompanySize) && bodyCompanySize > 0
        ? Math.round(bodyCompanySize)
        : project.targetUsers ?? 200;

    const requestBudgetTier = parseRequestBudgetTier(body.budgetTier ?? body.budgetLevel);
    const pdfBudgetLevel = requestBudgetTier ?? project.budgetLevel;

    const pdfBytes = await renderBudgetPdf(budget, {
      tier: renderTier,
      planId: requestPlanId,
      companyName: project.clientName ?? project.name ?? "投标企业",
      companySize,
      budgetLevel: pdfBudgetLevel,
    });

    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="budget.pdf"',
      },
    });
  } catch (error) {
    console.error("[budget pdf error]", error);
    const message = sanitizeProductionClientMessage(
      error instanceof Error ? error.message : "",
      DOWNLOAD_SERVICE_UNAVAILABLE,
    );
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message },
      { status: 500 },
    );
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
