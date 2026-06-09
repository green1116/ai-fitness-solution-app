import type { PlanEntitlementSnapshot } from "@/lib/entitlements/planEntitlement";
import { normalizeUserTier, type UserTier } from "@/lib/commercial/userTier";

export type PlanDocumentTierResult =
  | { ok: true; renderTier: UserTier; requestedTier: UserTier; source: string }
  | { ok: false; status: number; error: string; message: string };

/** 从请求解析 Plan **内容**档位（绝不读取 entitlement.effectiveLevel） */
export function extractPlanDocumentTierFromRequest(
  req: Request,
  body: {
    documentTier?: unknown;
    tier?: unknown;
    mode?: unknown;
  },
): { tier: UserTier; source: string } {
  const fromBody =
    body.documentTier ?? body.tier ?? body.mode;
  if (fromBody !== undefined && fromBody !== null && String(fromBody).trim() !== "") {
    return {
      tier: normalizeUserTier(fromBody),
      source: body.documentTier != null ? "body.documentTier" : body.tier != null ? "body.tier" : "body.mode",
    };
  }

  const headerTier =
    req.headers.get("x-plan-document-tier")?.trim() ||
    req.headers.get("x-mode")?.trim();
  if (headerTier) {
    return { tier: normalizeUserTier(headerTier), source: "header" };
  }

  return { tier: "free", source: "default-free" };
}

/**
 * Plan PDF 内容档位由**请求 tier**决定，不由 entitlement 档位抬升。
 * entitlement 仅用于校验是否有权下载该档位（商业边界）。
 */
export function resolvePlanDocumentTier(params: {
  requestedTier: unknown;
  entitlement: PlanEntitlementSnapshot;
}): PlanDocumentTierResult {
  const requestedTier = normalizeUserTier(params.requestedTier);
  const ent = params.entitlement;

  if (requestedTier === "free") {
    return { ok: true, renderTier: "free", requestedTier, source: "free-request" };
  }

  if (requestedTier === "pro") {
    const allowed =
      ent.proEnabled === true ||
      ent.budgetEnabled === true ||
      ent.effectiveLevel === "pro" ||
      ent.effectiveLevel === "enterprise";
    if (!allowed) {
      return {
        ok: false,
        status: 403,
        error: "PLAN_PRO_NOT_ENTITLED",
        message: "当前账号暂无 Pro 版计划书下载权限，请先完成 Pro 购买或升级。",
      };
    }
    return { ok: true, renderTier: "pro", requestedTier, source: "pro-request" };
  }

  const allowed =
    ent.enterpriseEnabled === true ||
    ent.zipEnabled === true ||
    ent.effectiveLevel === "enterprise";
  if (!allowed) {
    return {
      ok: false,
      status: 403,
      error: "PLAN_ENTERPRISE_NOT_ENTITLED",
      message: "当前账号暂无 Enterprise 版计划书下载权限。",
    };
  }
  return { ok: true, renderTier: "enterprise", requestedTier, source: "enterprise-request" };
}
