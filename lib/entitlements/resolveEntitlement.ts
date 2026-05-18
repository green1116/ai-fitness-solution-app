/**
 * 统一的请求侧 entitlement 解析（委托 `getEntitlement(planId)`）。
 *
 * 禁止：X-Mode / X-Paid / body.tier 等请求头作为权限依据。
 * `x-license-key` 仅传入 `getEntitlement` 用于 **DB 哈希定位**，最终权限只读 DB 合成结果。
 */
import { getCurrentUser } from "@/lib/auth/currentUser";
import type { EntitlementDebug, LicenseCandidate } from "@/lib/entitlement";
import { getEntitlement, normalizeLevel } from "@/lib/entitlement";
import type { PlanEntitlementSnapshot } from "@/lib/entitlements/planEntitlement";

export type AccessType = "plan" | "budget" | "zip";

export type RequestEntitlement = {
  entitlement: PlanEntitlementSnapshot;
  source:
    | "session-binding"
    | "license-key"
    | "anonymous"
    | "upgrade-order";
  userId: string | null;
};

export type SelectedLicenseMeta =
  | {
      id: string;
      level: "free" | "pro" | "enterprise";
      rawPlanLevel: string;
      source: LicenseCandidate["source"];
    }
  | null;

export type DeriveEntitlementResult = {
  entitlement: PlanEntitlementSnapshot;
  source: RequestEntitlement["source"];
  userId: string | null;
  selectedLicense: SelectedLicenseMeta;
  licenses: LicenseCandidate[];
  debug: EntitlementDebug;
};

function mapSource(params: {
  finalRank: number;
  winningSource: "upgrade-order" | "license" | "none";
  licenseWinnerSource: LicenseCandidate["source"] | undefined;
}): RequestEntitlement["source"] {
  const { finalRank, winningSource, licenseWinnerSource } = params;
  if (finalRank <= 0) {
    return "anonymous";
  }
  if (winningSource === "upgrade-order") return "upgrade-order";
  if (licenseWinnerSource === "binding") return "session-binding";
  return "license-key";
}

function pickSelectedLicense(debug: EntitlementDebug): SelectedLicenseMeta {
  if (debug.winningSource === "upgrade-order" && debug.orderWinner) {
    const o = debug.orderWinner;
    return {
      id: `upgrade_order:${o.id}`,
      level: normalizeLevel(o.targetLevel),
      rawPlanLevel: o.targetLevel,
      source: "upgrade-order",
    };
  }
  if (debug.licenseWinner) {
    const w = debug.licenseWinner;
    return {
      id: w.id,
      level: w.level,
      rawPlanLevel: w.rawPlanLevel,
      source: w.source,
    };
  }
  return null;
}

/**
 * 与 ZIP/budget/plan 同源：getEntitlement(planId) → 快照 + debug（单一事实来源）。
 */
export async function deriveEntitlementFromRequest(
  req: Request,
  planId: string,
): Promise<DeriveEntitlementResult> {
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const headerLicenseKey = (req.headers.get("x-license-key") || "").trim();

  const { entitlement, debug } = await getEntitlement(planId, {
    userId,
    headerLicenseKey,
  });

  const selectedLicense = pickSelectedLicense(debug);
  const source = mapSource({
    finalRank: debug.finalRank,
    winningSource: debug.winningSource,
    licenseWinnerSource: debug.licenseWinner?.source,
  });

  return {
    entitlement,
    source,
    userId,
    selectedLicense,
    licenses: debug.licenseCandidates,
    debug,
  };
}

export async function resolveRequestEntitlement(params: {
  req: Request;
  planId: string;
}): Promise<DeriveEntitlementResult> {
  return deriveEntitlementFromRequest(params.req, params.planId);
}

export function isAccessEnabled(
  entitlement: PlanEntitlementSnapshot,
  type: AccessType,
): boolean {
  switch (type) {
    case "plan":
      return true;
    case "budget":
      return entitlement.budgetEnabled;
    case "zip":
      return entitlement.zipEnabled;
  }
}

export function deniedErrorFor(type: AccessType): string {
  switch (type) {
    case "plan":
      return "PLAN_NOT_ENTITLED";
    case "budget":
      return "BUDGET_NOT_ENTITLED";
    case "zip":
      return "ZIP_NOT_ENTITLED";
  }
}
