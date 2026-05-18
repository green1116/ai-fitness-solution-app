/**
 * 三个 PDF 接口统一权限判断（plan / budget / zip）。
 *
 * 决策顺序（重要：entitlement 优先）：
 *   1. 已登录 + entitlement[type] === true → 放行，并从 LicenseBinding 挑一条 license 用于 consume
 *   2. 否则尝试 x-license-key（requireValidLicense，访客 / 单机授权兜底）
 *   3. plan + free → 兜底放行
 *   4. 否则拒
 *
 * 关键：当 entitlement 已显示 zipEnabled / budgetEnabled 时，**不再要求 x-license-key 校验通过**，
 * 这样 webhook 写完 binding 后即可下载，避免本地遗留 / fallback 的 license-key 导致 LICENSE_INVALID。
 */
import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  getPlanEntitlementSnapshot,
  pickBestBindingLicense,
  type PickedBindingLicense,
  type PlanEntitlementSnapshot,
} from "@/lib/entitlements/planEntitlement";
import {
  consumeLicenseOnSuccess,
  requireValidLicense,
} from "@/lib/license-guard";
import { tierRank } from "@/lib/license/tierCoverage";

export type AccessType = "plan" | "budget" | "zip";

type Tier = "free" | "pro" | "enterprise";

export type AccessLicense = PickedBindingLicense;

export type AccessAllowed = {
  allowed: true;
  type: AccessType;
  planId: string;
  entitlement: PlanEntitlementSnapshot;
  license: AccessLicense | null;
  fingerprint: string | null;
  /** 通过路径，便于路由层日志 */
  path: "entitlement" | "license-key" | "plan-free";
};

export type AccessDenied = {
  allowed: false;
  type: AccessType;
  planId: string;
  entitlement: PlanEntitlementSnapshot;
  license: AccessLicense | null;
  reason: string;
  status: number;
  path: "denied";
};

export type AccessResult = AccessAllowed | AccessDenied;

const MIN_TIER_FOR_TYPE: Record<AccessType, Tier> = {
  plan: "free",
  budget: "pro",
  zip: "enterprise",
};

function entitlementFlagFor(
  snapshot: PlanEntitlementSnapshot,
  type: AccessType,
): boolean {
  switch (type) {
    case "plan":
      return true;
    case "budget":
      return snapshot.budgetEnabled;
    case "zip":
      return snapshot.zipEnabled;
  }
}

function emptySnapshot(planId: string): PlanEntitlementSnapshot {
  return {
    planId,
    effectiveLevel: "free",
    planEnabled: true,
    proEnabled: false,
    budgetEnabled: false,
    enterpriseEnabled: false,
    zipEnabled: false,
  };
}

export async function checkAccess(params: {
  req: Request;
  planId: string;
  type: AccessType;
}): Promise<AccessResult> {
  const { req, planId, type } = params;
  const minLevel = MIN_TIER_FOR_TYPE[type];
  const minRank = tierRank(minLevel);

  const user = await getCurrentUser();
  const entitlement = user
    ? await getPlanEntitlementSnapshot(user.id, planId)
    : emptySnapshot(planId);
  const entitlementAllows = entitlementFlagFor(entitlement, type);

  /** 1) entitlement 优先：已登录且 entitlement[type] 通过即放行 */
  if (user && entitlementAllows) {
    /** 从 binding 挑一条 license 用于扣配额；找不到也仍然放行（entitlement 已经表明权限）*/
    const license = await pickBestBindingLicense({
      userId: user.id,
      planId,
      minRank,
    });

    console.log("[access-check]", {
      type,
      planId,
      entitlement,
      license: license ? { id: license.id, planLevel: license.planLevel } : null,
      entitlementAllows: true,
      licenseAllows: Boolean(license),
      allowed: true,
      path: "entitlement",
    });

    return {
      allowed: true,
      type,
      planId,
      entitlement,
      license,
      fingerprint: null,
      path: "entitlement",
    };
  }

  /** 2) x-license-key 兜底（访客 / 旧的单机授权链路） */
  const licenseCheck = await requireValidLicense(req, planId, {
    tier: minLevel,
    mode: minLevel,
    pathname: `access:${type}`,
  });

  if (licenseCheck.ok) {
    const licenseAllows =
      tierRank(licenseCheck.license.planLevel) >= minRank;

    console.log("[access-check]", {
      type,
      planId,
      entitlement,
      license: {
        id: licenseCheck.license.id,
        planLevel: licenseCheck.license.planLevel,
      },
      entitlementAllows,
      licenseAllows,
      allowed: licenseAllows,
      path: "license-key",
    });

    if (licenseAllows) {
      return {
        allowed: true,
        type,
        planId,
        entitlement,
        license: licenseCheck.license,
        fingerprint: licenseCheck.fingerprint,
        path: "license-key",
      };
    }

    return {
      allowed: false,
      type,
      planId,
      entitlement,
      license: licenseCheck.license,
      reason: "DOWNLOAD_NOT_ALLOWED",
      status: 403,
      path: "denied",
    };
  }

  /** 3) plan + free：兜底放行（保持向后兼容） */
  if (type === "plan" && minLevel === "free") {
    console.log("[access-check]", {
      type,
      planId,
      entitlement,
      license: null,
      entitlementAllows: true,
      licenseAllows: false,
      allowed: true,
      path: "plan-free",
      note: "plan-free-fallback",
    });
    return {
      allowed: true,
      type,
      planId,
      entitlement,
      license: null,
      fingerprint: null,
      path: "plan-free",
    };
  }

  /** 4) 拒 */
  console.log("[access-check]", {
    type,
    planId,
    entitlement,
    license: null,
    entitlementAllows,
    licenseAllows: false,
    allowed: false,
    path: "denied",
    licenseGuardError: licenseCheck.error,
  });

  return {
    allowed: false,
    type,
    planId,
    entitlement,
    license: null,
    reason: licenseCheck.error,
    status: licenseCheck.status,
    path: "denied",
  };
}

/**
 * 路由侧 consume 包装：
 * - access 通过且有真实 license → 扣配额
 * - entitlement 路径下找不到 binding license（罕见）则跳过 consume，避免阻断下载
 */
export async function consumeAccessOnSuccess(
  access: AccessAllowed,
  route: string,
  licenseKeyPlainForLog?: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!access.license) {
    return { ok: true };
  }
  const fingerprint =
    access.fingerprint?.trim() ||
    `entitlement:${access.planId}:${access.license.id}`;
  const r = await consumeLicenseOnSuccess({
    licenseId: access.license.id,
    planId: access.planId,
    fingerprint,
    route,
    licenseKeyPlainForLog,
  });
  if (!r.ok) {
    /** entitlement 路径下扣配额失败不阻断下载（quota / dup 仅记录，不返 403）*/
    if (access.path === "entitlement") {
      console.warn("[access-consume-skip]", {
        route,
        path: access.path,
        status: r.status,
        error: r.error,
      });
      return { ok: true };
    }
    return { ok: false, status: r.status, error: r.error };
  }
  return { ok: true };
}
