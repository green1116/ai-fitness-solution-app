import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { formatPrismaErrorForLog, isPrismaConnectionError } from "@/lib/db/prismaErrors";
import { describeDatabaseUrl, resolveDatabaseUrl } from "@/lib/db/resolveDatabaseUrl";
import {
  ENTITLEMENTS_API_VERSION,
  toPublicEntitlementPayload,
  toSafeEntitlementsDebug,
} from "@/lib/entitlements/publicEntitlement";
import {
  buildDegradedEntitlementFallback,
  shouldUseEntitlementDbFallback,
} from "@/lib/entitlements/fallbackEntitlement";
import { getPlanEntitlementsDetail } from "@/lib/entitlements/planEntitlement";
import { resolveRequestEntitlement } from "@/lib/entitlements/resolveEntitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/entitlements?planId=
 *
 * **权限模型**
 * - **Auth**：仅影响 `authenticated` / `user` / `bindings` 展示；**不参与**把 entitlement 降级为 free。
 * - **Plan**：`planId`（query 或 `x-plan-id`）决定读取哪条 plan 的订单与 license 范围。
 * - **Entitlement**：唯一事实来源 = `getEntitlement(planId)`（经 `resolveRequestEntitlement`）。
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const queryPlanId = (url.searchParams.get("planId") || "").trim();
  const headerPlanId = (req.headers.get("x-plan-id") || "").trim();
  const planId =
    (headerPlanId || queryPlanId || "attaguy-plan").trim() || "attaguy-plan";

  try {
    const user = await getCurrentUser();
    const { entitlement, source, userId, debug } = await resolveRequestEntitlement({
      req,
      planId,
    });

    const entitlementPayload = toPublicEntitlementPayload(entitlement);
    const diagnostic = toSafeEntitlementsDebug(debug);

    console.log("[DEBUG][api/entitlements]", {
      planId,
      authenticated: Boolean(user),
      entitlement: entitlementPayload,
      diagnostic,
      source,
    });

    const bindings = user
      ? (await getPlanEntitlementsDetail(user.id, planId)).bindings
      : [];

    return NextResponse.json({
      ok: true,
      apiVersion: ENTITLEMENTS_API_VERSION,
      entitlement: entitlementPayload,
      authenticated: Boolean(user),
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      planId,
      effectiveLevel: entitlementPayload.effectiveLevel,
      planEnabled: entitlementPayload.planEnabled,
      proEnabled: entitlementPayload.proEnabled,
      budgetEnabled: entitlementPayload.budgetEnabled,
      enterpriseEnabled: entitlementPayload.enterpriseEnabled,
      zipEnabled: entitlementPayload.zipEnabled,
      source,
      userId,
      bindings,
      diagnostic,
    });
  } catch (e) {
    const prismaDetail = formatPrismaErrorForLog(e);
    let datasource: ReturnType<typeof describeDatabaseUrl> | null = null;
    try {
      datasource = describeDatabaseUrl(resolveDatabaseUrl());
    } catch {
      datasource = null;
    }

    console.error("[/api/entitlements] failed", {
      planId,
      prismaDetail,
      datasource,
      nodeEnv: process.env.NODE_ENV,
    });

    if (isPrismaConnectionError(e) && shouldUseEntitlementDbFallback()) {
      const user = await getCurrentUser().catch(() => null);
      const fallback = buildDegradedEntitlementFallback(
        planId,
        String(prismaDetail.message ?? "database unreachable"),
      );
      const entitlementPayload = toPublicEntitlementPayload(fallback.entitlement);
      const diagnostic = {
        ...toSafeEntitlementsDebug(fallback.debug),
        degraded: true,
        dbAvailable: false,
        fallbackLevel: fallback.fallbackLevel,
        datasource,
      };

      console.warn("[/api/entitlements] degraded fallback (dev)", {
        planId,
        fallbackLevel: fallback.fallbackLevel,
        datasource,
      });

      return NextResponse.json({
        ok: true,
        apiVersion: ENTITLEMENTS_API_VERSION,
        entitlement: entitlementPayload,
        authenticated: Boolean(user),
        user: user ? { id: user.id, email: user.email, name: user.name } : null,
        planId,
        effectiveLevel: entitlementPayload.effectiveLevel,
        planEnabled: entitlementPayload.planEnabled,
        proEnabled: entitlementPayload.proEnabled,
        budgetEnabled: entitlementPayload.budgetEnabled,
        enterpriseEnabled: entitlementPayload.enterpriseEnabled,
        zipEnabled: entitlementPayload.zipEnabled,
        source: "degraded-db-fallback",
        userId: user?.id ?? null,
        bindings: [],
        diagnostic,
        degraded: true,
        warning:
          "数据库暂不可用，当前为开发环境降级权益；请检查 DATABASE_URL / DIRECT_URL 或设置 PRISMA_USE_DIRECT_URL=1",
      });
    }

    if (isPrismaConnectionError(e)) {
      return NextResponse.json(
        {
          ok: false,
          code: "DATABASE_UNAVAILABLE",
          message: "数据库连接失败，无法查询权益",
          diagnostic: { datasource, prisma: prismaDetail },
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { ok: false, code: "INTERNAL", message: "查询失败" },
      { status: 500 },
    );
  }
}
