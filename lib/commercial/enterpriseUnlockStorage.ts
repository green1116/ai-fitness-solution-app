/** 与 unlockToken.planLevel、/api/upgrade/confirm 返回值对齐 */
export type CommercialPlanLevel = "free" | "pro" | "enterprise";

/** 与 DownloadPdfButton 一致 */
export const UNLOCK_STORAGE_KEY = "attaguy_unlockToken";
export const UNLOCK_PLAN_KEY = "attaguy_unlockPlanId";

/** 与 DownloadEnterprisePackButton 一致 */
export const UNLOCK_ENTERPRISE_KEY = "attaguy_unlockEnterprise";
export const UNLOCK_ENTERPRISE_PLAN_KEY = "attaguy_unlockEnterprisePlanId";

/** 验证通过后写入的商业档位（用于 getEffectiveCommercialPlanLevel） */
export const UNLOCK_COMMERCIAL_PLAN_LEVEL_KEY =
  "attaguy_unlockCommercialPlanLevel";

export function storeEnterpriseUnlockToken(
  planId: string,
  token: string,
  planLevel: CommercialPlanLevel
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(UNLOCK_ENTERPRISE_KEY, token);
    localStorage.setItem(UNLOCK_ENTERPRISE_PLAN_KEY, planId);
    localStorage.setItem(UNLOCK_COMMERCIAL_PLAN_LEVEL_KEY, planLevel);
    localStorage.setItem(UNLOCK_STORAGE_KEY, token);
    localStorage.setItem(UNLOCK_PLAN_KEY, planId);
  } catch {
    // ignore
  }
}

/** 清除与 planId 关联的通用 / 企业解锁凭证 */
export function clearStoredEnterpriseUnlockToken(planId: string): void {
  if (typeof window === "undefined") return;
  try {
    const enterprisePlan = localStorage.getItem(UNLOCK_ENTERPRISE_PLAN_KEY);
    const genericPlan = localStorage.getItem(UNLOCK_PLAN_KEY);
    if (enterprisePlan !== planId && genericPlan !== planId) return;
    localStorage.removeItem(UNLOCK_ENTERPRISE_KEY);
    localStorage.removeItem(UNLOCK_ENTERPRISE_PLAN_KEY);
    localStorage.removeItem(UNLOCK_COMMERCIAL_PLAN_LEVEL_KEY);
    localStorage.removeItem(UNLOCK_STORAGE_KEY);
    localStorage.removeItem(UNLOCK_PLAN_KEY);
  } catch {
    // ignore
  }
}

/** 无条件清除本机 enterprise / 通用解锁档位（不触发下载；用于「重置授权」） */
export function clearAllEnterpriseUnlockStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(UNLOCK_ENTERPRISE_KEY);
    localStorage.removeItem(UNLOCK_ENTERPRISE_PLAN_KEY);
    localStorage.removeItem(UNLOCK_COMMERCIAL_PLAN_LEVEL_KEY);
    localStorage.removeItem(UNLOCK_STORAGE_KEY);
    localStorage.removeItem(UNLOCK_PLAN_KEY);
  } catch {
    // ignore
  }
}
