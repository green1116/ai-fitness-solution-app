/**
 * 与 GET /api/entitlements 响应体对齐的公开类型与解析（无 Prisma / 可安全给 client bundle）。
 * 不含密钥、不含用户 PII；仅描述 plan 维度的商业权益快照。
 */
import type { EntitlementDebug } from "@/lib/entitlement";

export const ENTITLEMENTS_API_VERSION = 1 as const;

/** API `entitlement` 字段与前端 hook 解析目标一致 */
export type PublicEntitlementPayload = {
  planId: string;
  effectiveLevel: "free" | "pro" | "enterprise";
  planEnabled: true;
  budgetEnabled: boolean;
  zipEnabled: boolean;
  proEnabled: boolean;
  enterpriseEnabled: boolean;
};

/** 与 PlanEntitlementSnapshot 同构；用于服务端把 DB 快照映射为 API 体 */
export type EntitlementSnapshotInput = {
  planId: string;
  effectiveLevel: "free" | "pro" | "enterprise";
  planEnabled: true;
  budgetEnabled: boolean;
  zipEnabled: boolean;
  proEnabled: boolean;
  enterpriseEnabled: boolean;
};

export function toPublicEntitlementPayload(
  snap: EntitlementSnapshotInput,
): PublicEntitlementPayload {
  return {
    planId: snap.planId,
    effectiveLevel: snap.effectiveLevel,
    planEnabled: true,
    budgetEnabled: snap.budgetEnabled,
    zipEnabled: snap.zipEnabled,
    proEnabled: snap.proEnabled,
    enterpriseEnabled: snap.enterpriseEnabled,
  };
}

/** 可安全返回给前端的排查信息（无密钥、无 email、无 license id） */
export type SafeEntitlementsDebug = {
  version: typeof ENTITLEMENTS_API_VERSION;
  planId: string;
  finalRank: number;
  finalLevel: string;
  winningSource: string;
  orderRank: number;
  licenseRank: number;
  paidOrderCount: number;
  licenseCandidateCount: number;
  priorityExplanation: string;
  /** L1 与 L2 原始 winner 档位不同；effective 仍取 max */
  sourcesDisagree: boolean;
  policyVersion: string;
};

export type EntitlementsApiSuccessBody = {
  ok: true;
  apiVersion: typeof ENTITLEMENTS_API_VERSION;
  entitlement: PublicEntitlementPayload;
  authenticated: boolean;
  user: { id: string; email: string; name: string | null } | null;
  planId: string;
  effectiveLevel: PublicEntitlementPayload["effectiveLevel"];
  planEnabled: true;
  proEnabled: boolean;
  budgetEnabled: boolean;
  enterpriseEnabled: boolean;
  zipEnabled: boolean;
  source: string;
  userId: string | null;
  bindings: unknown[];
  /** 生产也返回「安全摘要」便于对齐前后端；不含敏感字段 */
  diagnostic: SafeEntitlementsDebug;
};

export function toSafeEntitlementsDebug(
  debug: EntitlementDebug,
): SafeEntitlementsDebug {
  return {
    version: ENTITLEMENTS_API_VERSION,
    planId: debug.planId,
    finalRank: debug.finalRank,
    finalLevel: debug.finalLevel,
    winningSource: debug.winningSource,
    orderRank: debug.orderRank,
    licenseRank: debug.licenseRank,
    paidOrderCount: debug.paidOrders.length,
    licenseCandidateCount: debug.licenseCandidates.length,
    priorityExplanation: debug.priorityExplanation,
    sourcesDisagree: debug.sourcesDisagree,
    policyVersion: debug.policyVersion,
  };
}

function normalizeEffectiveLevel(raw: unknown): "free" | "pro" | "enterprise" {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (v === "enterprise") return "enterprise";
  if (v === "pro") return "pro";
  return "free";
}

function maxEffectiveLevel(
  a: "free" | "pro" | "enterprise",
  b: "free" | "pro" | "enterprise",
): "free" | "pro" | "enterprise" {
  const r = (x: typeof a) => (x === "enterprise" ? 2 : x === "pro" ? 1 : 0);
  return r(a) >= r(b) ? a : b;
}

/** 解析 GET /api/entitlements 成功 JSON → 与后端 entitlement 块一致 */
export function parseEntitlementsSuccessPayload(
  d: Record<string, unknown>,
): PublicEntitlementPayload | null {
  if (d.ok === false) return null;
  const ent =
    (d.entitlement as Record<string, unknown> | undefined) ?? undefined;
  const src = ent ?? d;
  const fromNested = normalizeEffectiveLevel(
    src.effectiveLevel ?? d.effectiveLevel,
  );
  const fromRoot = normalizeEffectiveLevel(d.effectiveLevel);
  const diag = d.diagnostic as Record<string, unknown> | undefined;
  const fromDiagnostic = normalizeEffectiveLevel(diag?.finalLevel);
  const effectiveLevel = maxEffectiveLevel(
    fromNested,
    maxEffectiveLevel(fromRoot, fromDiagnostic),
  );

  const budgetEnabled = Boolean(src.budgetEnabled ?? d.budgetEnabled ?? false);
  const zipEnabled =
    Boolean(src.zipEnabled ?? d.zipEnabled ?? false) ||
    effectiveLevel === "enterprise";
  const proEnabled = Boolean(src.proEnabled ?? d.proEnabled ?? false);
  const enterpriseEnabled =
    Boolean(src.enterpriseEnabled ?? d.enterpriseEnabled ?? false) ||
    effectiveLevel === "enterprise";

  return {
    planId: String(src.planId ?? d.planId ?? "").trim() || "attaguy-plan",
    effectiveLevel,
    planEnabled: true,
    budgetEnabled,
    zipEnabled,
    proEnabled,
    enterpriseEnabled,
  };
}
