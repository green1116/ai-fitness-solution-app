/**
 * ZIP 下载授权（/api/pdf/tender/zip）。
 *
 * 规则（生产）：
 * - `entitlement.zipEnabled`（enterprise 档位快照）或
 * - 同 planId 存在已支付的 enterprise 订单（购买态优先于仅看 effectiveLevel 的歧义）
 *
 * 规则（开发/本地，非 production）：
 * - `DEV_ZIP_ALLOW_ALL=1` → 全部放行
 * - `DEV_ZIP_ALLOW_ALL=0` → 仅显式白名单 `DEV_ZIP_ALLOWED_PLAN_IDS`
 * - 默认（未设 ALLOW_ALL）：本地默认放行，便于联调 ZIP 管线（可用 `DEV_ZIP_DEFAULT_ALLOW=0` 关闭）
 */
import type { EntitlementDebug } from "@/lib/entitlement";
import { normalizeLevel, type EntitlementLevel } from "@/lib/entitlement";
import type { PlanEntitlementSnapshot } from "@/lib/entitlements/planEntitlement";

export type ZipPurchaseStatus =
  | "none"
  | "unpaid"
  | "pro_paid"
  | "enterprise_paid";

export type ZipDenyReason =
  | "NOT_PURCHASED"
  | "TIER_INSUFFICIENT"
  | "DEV_NOT_ALLOWLISTED"
  | "ZIP_NOT_ENTITLED";

export type ZipAccessDecision = {
  allowed: boolean;
  allowedReason: string;
  zipFromEntitlement: boolean;
  zipFromEnterprisePurchase: boolean;
  purchaseStatus: ZipPurchaseStatus;
  effectiveLevel: EntitlementLevel;
  devListed: boolean;
  devBypass: boolean;
  denyReason?: ZipDenyReason;
  userMessage: string;
};

function levelRank(level: EntitlementLevel): number {
  return level === "enterprise" ? 2 : level === "pro" ? 1 : 0;
}

export function deriveZipPurchaseStatus(debug: EntitlementDebug): ZipPurchaseStatus {
  if (debug.paidOrders.length === 0) {
    return debug.allOrders.length > 0 ? "unpaid" : "none";
  }
  let maxRank = 0;
  for (const o of debug.paidOrders) {
    maxRank = Math.max(maxRank, levelRank(normalizeLevel(o.targetLevel)));
  }
  if (maxRank >= 2) return "enterprise_paid";
  if (maxRank >= 1) return "pro_paid";
  return "unpaid";
}

export function hasPaidEnterpriseOrder(debug: EntitlementDebug): boolean {
  return debug.paidOrders.some(
    (o) => normalizeLevel(o.targetLevel) === "enterprise",
  );
}

export function isDevZipPlanAllowlist(planId: string): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const raw = process.env.DEV_ZIP_ALLOWED_PLAN_IDS ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length > 0 && ids.includes(planId);
}

/** 本地默认是否对 ZIP 放行（非 production） */
export function isDevZipDefaultBypass(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.DEV_ZIP_ALLOW_ALL === "1") return true;
  if (process.env.DEV_ZIP_ALLOW_ALL === "0") return false;
  return process.env.DEV_ZIP_DEFAULT_ALLOW !== "0";
}

export function evaluateZipAccess(params: {
  entitlement: PlanEntitlementSnapshot;
  debug: EntitlementDebug;
  planId: string;
}): ZipAccessDecision {
  const { entitlement, debug, planId } = params;
  const purchaseStatus = deriveZipPurchaseStatus(debug);
  const zipFromEnterprisePurchase = hasPaidEnterpriseOrder(debug);
  const zipFromEntitlement =
    entitlement.zipEnabled === true || zipFromEnterprisePurchase;

  const devListed = isDevZipPlanAllowlist(planId);
  /** 生产环境硬锁：即使 NODE_ENV 误配或 DEV_* 泄漏，也不放行 */
  const devBypass =
    process.env.NODE_ENV !== "production" &&
    (devListed || isDevZipDefaultBypass());

  const effectiveLevel = entitlement.effectiveLevel;

  if (zipFromEntitlement || devBypass) {
    const allowedReason = devBypass
      ? devListed
        ? "dev_plan_allowlist"
        : "dev_default_bypass"
      : zipFromEnterprisePurchase && !entitlement.zipEnabled
        ? "enterprise_paid_order"
        : "entitlement_zip_enabled";

    return {
      allowed: true,
      allowedReason,
      zipFromEntitlement,
      zipFromEnterprisePurchase,
      purchaseStatus,
      effectiveLevel,
      devListed,
      devBypass,
      userMessage: "ok",
    };
  }

  let denyReason: ZipDenyReason;
  let userMessage: string;

  if (purchaseStatus === "none" || purchaseStatus === "unpaid") {
    denyReason = "NOT_PURCHASED";
    userMessage =
      purchaseStatus === "unpaid"
        ? "订单尚未支付完成，无法下载完整投标包（ZIP）。请完成支付后刷新页面再试。"
        : "尚未购买企业版套餐，无法下载完整投标包（ZIP）。请先完成企业版购买。";
  } else if (purchaseStatus === "pro_paid") {
    denyReason = "TIER_INSUFFICIENT";
    userMessage =
      "当前为 Pro 套餐，完整投标包（ZIP）需企业版。请升级至企业版后再下载 ZIP。";
  } else {
    denyReason = "ZIP_NOT_ENTITLED";
    userMessage =
      "当前账号暂无完整投标包（ZIP）下载权限。请确认企业版订单已支付完成，并在页面刷新授权后再试。";
  }

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_ZIP_ALLOW_ALL === "0" &&
    !devListed
  ) {
    denyReason = "DEV_NOT_ALLOWLISTED";
    userMessage =
      "本地开发未放行 ZIP：请设置 DEV_ZIP_ALLOW_ALL=1，或将 planId 加入 DEV_ZIP_ALLOWED_PLAN_IDS。";
  }

  return {
    allowed: false,
    allowedReason: "denied",
    zipFromEntitlement,
    zipFromEnterprisePurchase,
    purchaseStatus,
    effectiveLevel,
    devListed,
    devBypass: false,
    denyReason,
    userMessage,
  };
}
