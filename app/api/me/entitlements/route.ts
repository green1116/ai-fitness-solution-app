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
import { deriveEntitlementFromRequest } from "@/lib/entitlements/resolveEntitlement";
import { getPlanEntitlementsDetail } from "@/lib/entitlements/planEntitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SelectedLicenseShape = {
  id?: string;
  planId?: string;
  level?: string;
  rawPlanLevel?: string;
  source?: string;
};

/**
 * GET /api/me/entitlements?planId=
 * 与 GET /api/entitlements **同一套** `getEntitlement`；仅路径名不同，便于「已登录」场景。
 * **Auth 不降级 entitlement**：`authenticated=false` 时仍返回同一 plan 的 DB 合成档位。
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const queryPlanId = (url.searchParams.get("planId") || "").trim();
    const headerPlanId = (req.headers.get("x-plan-id") || "").trim();
    const planId =
      (headerPlanId || queryPlanId || "attaguy-plan").trim() || "attaguy-plan";

    const user = await getCurrentUser();

    const { entitlement, source, userId, selectedLicense, debug } =
      await deriveEntitlementFromRequest(req, planId);

    console.log("[DEBUG][ENT][SELECTED]", selectedLicense);

    const entitlementPayload = toPublicEntitlementPayload(entitlement);
    const diagnostic = toSafeEntitlementsDebug(debug);

    console.log("[DEBUG][ENT][FINAL]", entitlementPayload, diagnostic);

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
      selectedLicense: selectedLicense as SelectedLicenseShape | null,
    });
  } catch (e) {
    const prismaDetail = formatPrismaErrorForLog(e);
    let datasource: ReturnType<typeof describeDatabaseUrl> | null = null;
    try {
      datasource = describeDatabaseUrl(resolveDatabaseUrl());
    } catch {
      datasource = null;
    }
    console.error("[/api/me/entitlements] failed", {
      planId: (() => {
        try {
          const u = new URL(req.url);
          return (u.searchParams.get("planId") || "attaguy-plan").trim();
        } catch {
          return "attaguy-plan";
        }
      })(),
      prismaDetail,
      datasource,
    });

    if (isPrismaConnectionError(e) && shouldUseEntitlementDbFallback()) {
      const url = new URL(req.url);
      const planId =
        (url.searchParams.get("planId") || "attaguy-plan").trim() || "attaguy-plan";
      const user = await getCurrentUser().catch(() => null);
      const fallback = buildDegradedEntitlementFallback(
        planId,
        String(prismaDetail.message ?? "database unreachable"),
      );
      const entitlementPayload = toPublicEntitlementPayload(fallback.entitlement);
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
        diagnostic: {
          ...toSafeEntitlementsDebug(fallback.debug),
          degraded: true,
          dbAvailable: false,
        },
        degraded: true,
        warning: "数据库暂不可用，开发环境降级权益",
      });
    }

    if (isPrismaConnectionError(e)) {
      return NextResponse.json(
        {
          ok: false,
          code: "DATABASE_UNAVAILABLE",
          message: "数据库连接失败",
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
