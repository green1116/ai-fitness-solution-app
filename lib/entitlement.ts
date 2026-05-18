/**
 * 基于数据库的 plan 权益（单一事实来源）。
 *
 * **优先级（稳定、可解释）**
 * 1. **L1 — UpgradeOrder（按 planId）**：在内存中筛出「已支付」状态（大小写不敏感）的订单，取其中 `targetLevel` 的最高档 → `orderRank`。
 * 2. **L2 — LicenseKey**：合并以下候选后取最高档 → `licenseRank`：
 *    - plan-scope：`planId` 精确匹配或 `planId IS NULL`（通配），未过期、非 free；
 *    - binding：当前登录用户 `userId` 的绑定（匿名时本路径为空）；
 *    - header-key：请求头 `x-license-key` 哈希命中行（**仅作 DB 定位信号**，不是「header 即权限」）。
 * 3. **finalRank = max(orderRank, licenseRank)**；enterprise 时 `zipEnabled/budgetEnabled/enterpriseEnabled` 等与快照一致。
 *
 * **明确不做的事**：不把 `X-Mode` / `X-Paid` 当作权限来源；不把「未登录」单独降级为 free（匿名仍可走 L1+L2 的 license/order）。
 */
import { hashLicenseKey } from "@/lib/license";
import type { PlanEntitlementSnapshot } from "@/lib/entitlements/planEntitlement";
import { prisma } from "@/lib/prisma";

export type EntitlementLevel = "free" | "pro" | "enterprise";

export type LicenseCandidateSource =
  | "plan-scope"
  | "binding"
  | "header-key"
  | "upgrade-order";

export type LicenseCandidate = {
  id: string;
  planId: string | null;
  level: EntitlementLevel;
  rawPlanLevel: string;
  createdAt: Date;
  source: LicenseCandidateSource;
};

export type GetEntitlementContext = {
  userId?: string | null;
  headerLicenseKey?: string;
};

export type EntitlementDebug = {
  planId: string;
  allOrders: Array<{
    id: string;
    status: string;
    targetLevel: string;
    createdAt: string;
  }>;
  paidOrders: Array<{
    id: string;
    status: string;
    targetLevel: string;
    createdAt: string;
  }>;
  /** 参与 orderRank 的那条已支付订单（若有） */
  orderWinner: { id: string; status: string; targetLevel: string } | null;
  /** 参与 licenseRank 的那条 License 候选（若有） */
  licenseWinner: Pick<
    LicenseCandidate,
    "id" | "source" | "level" | "rawPlanLevel"
  > | null;
  orderRank: number;
  licenseRank: number;
  finalRank: number;
  finalLevel: EntitlementLevel;
  /** 同档时 UpgradeOrder 优先于 License */
  winningSource: "upgrade-order" | "license" | "none";
  licenseCandidates: LicenseCandidate[];
  /** 稳定、可审计的档位合成说明（写入日志 / 安全 diagnostic） */
  priorityExplanation: string;
  /**
   * L1 订单 winner 与 L2 license winner 的档位不一致（历史数据或履约延迟）。
   * **有效档位仍以 finalLevel = max(order, license)**，本字段仅用于监控与对账。
   */
  sourcesDisagree: boolean;
  /** 策略版本号，便于前后端与日志对齐 */
  policyVersion: "v1-max-order-license";
};

const PAID_ORDER_STATUSES = new Set([
  "paid",
  "paid_confirmed",
  "completed",
  "success",
  "done",
  "client_complete",
  "webhook_done",
  "license_issued",
]);

function isPaidOrderStatus(status: string): boolean {
  const s = String(status ?? "").trim().toLowerCase();
  return PAID_ORDER_STATUSES.has(s);
}

export function normalizeLevel(raw: string): EntitlementLevel {
  const v = String(raw ?? "").trim().toLowerCase();
  if (v === "enterprise") return "enterprise";
  if (v === "pro") return "pro";
  if (v === "tender") return "enterprise";
  return "free";
}

function levelRank(level: EntitlementLevel): number {
  return level === "enterprise" ? 2 : level === "pro" ? 1 : 0;
}

function rankToLevel(rank: number): EntitlementLevel {
  if (rank >= 2) return "enterprise";
  if (rank >= 1) return "pro";
  return "free";
}

function snapshotFromLevel(
  level: EntitlementLevel,
  planId: string,
): PlanEntitlementSnapshot {
  return {
    planId,
    effectiveLevel: level,
    planEnabled: true,
    proEnabled: level === "pro" || level === "enterprise",
    budgetEnabled: level === "pro" || level === "enterprise",
    enterpriseEnabled: level === "enterprise",
    zipEnabled: level === "enterprise",
  };
}

function isLicenseValid(expiresAt: Date | null): boolean {
  return !expiresAt || expiresAt.getTime() > Date.now();
}

function licenseMatchesPlan(licPlanId: string | null, planId: string): boolean {
  return !licPlanId || licPlanId === planId;
}

async function collectLicenseCandidates(params: {
  planId: string;
  userId: string | null;
  headerLicenseKey: string;
}): Promise<LicenseCandidate[]> {
  const { planId, userId, headerLicenseKey } = params;
  const out: LicenseCandidate[] = [];

  const scopeRows = await prisma.licenseKey.findMany({
    where: {
      OR: [{ planId }, { planId: null }],
    },
    select: {
      id: true,
      planId: true,
      planLevel: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  for (const r of scopeRows) {
    if (!isLicenseValid(r.expiresAt)) continue;
    if (!licenseMatchesPlan(r.planId, planId)) continue;
    const level = normalizeLevel(r.planLevel);
    if (level === "free") continue;
    out.push({
      id: r.id,
      planId: r.planId,
      level,
      rawPlanLevel: r.planLevel,
      createdAt: r.createdAt,
      source: "plan-scope",
    });
  }

  if (userId) {
    const bindings = await prisma.licenseBinding.findMany({
      where: { userId },
      include: {
        license: {
          select: {
            id: true,
            planId: true,
            planLevel: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
    });

    for (const b of bindings) {
      const lic = b.license;
      if (!isLicenseValid(lic.expiresAt)) continue;
      if (!licenseMatchesPlan(lic.planId, planId)) continue;
      const level = normalizeLevel(lic.planLevel);
      if (level === "free") continue;
      out.push({
        id: lic.id,
        planId: lic.planId,
        level,
        rawPlanLevel: lic.planLevel,
        createdAt: lic.createdAt,
        source: "binding",
      });
    }
  }

  if (headerLicenseKey) {
    try {
      const keyHash = hashLicenseKey(headerLicenseKey);
      const lic = await prisma.licenseKey.findUnique({
        where: { keyHash },
        select: {
          id: true,
          planId: true,
          planLevel: true,
          expiresAt: true,
          createdAt: true,
        },
      });
      if (
        lic &&
        isLicenseValid(lic.expiresAt) &&
        licenseMatchesPlan(lic.planId, planId)
      ) {
        const level = normalizeLevel(lic.planLevel);
        if (level !== "free") {
          out.push({
            id: lic.id,
            planId: lic.planId,
            level,
            rawPlanLevel: lic.planLevel,
            createdAt: lic.createdAt,
            source: "header-key",
          });
        }
      }
    } catch {
      // ignore invalid key material
    }
  }

  return out;
}

function maxLicenseRank(candidates: LicenseCandidate[]): {
  rank: number;
  winner: LicenseCandidate | null;
} {
  let winner: LicenseCandidate | null = null;
  for (const c of candidates) {
    if (!winner) {
      winner = c;
      continue;
    }
    const rc = levelRank(c.level);
    const rb = levelRank(winner.level);
    if (rc > rb) winner = c;
    else if (rc === rb && rc > 0 && c.createdAt.getTime() > winner.createdAt.getTime()) {
      winner = c;
    }
  }
  const rank = winner ? levelRank(winner.level) : 0;
  return { rank, winner };
}

/**
 * 从数据库解析某 planId 的权益快照。
 * - **优先**统计 UpgradeOrder：凡 `status` 视为已支付且 `targetLevel` 非 free，参与档位计算。
 * - 再与 LicenseKey（plan 范围 / 用户绑定 / header key）取 **最高档**。
 * - 同档时 **订单优先**（用于调试展示 winningSource）。
 */
export async function getEntitlement(
  planId: string,
  ctx: GetEntitlementContext = {},
): Promise<{ entitlement: PlanEntitlementSnapshot; debug: EntitlementDebug }> {
  const pid = String(planId ?? "").trim() || "attaguy-plan";
  const userId = ctx.userId ?? null;
  const headerLicenseKey = (ctx.headerLicenseKey ?? "").trim();

  const allOrders = await prisma.upgradeOrder.findMany({
    where: { planId: pid },
    select: {
      id: true,
      status: true,
      targetLevel: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const paidOrders = allOrders.filter((o) => isPaidOrderStatus(o.status));

  let orderRank = 0;
  let orderWinner: (typeof paidOrders)[0] | null = null;
  for (const o of paidOrders) {
    const r = levelRank(normalizeLevel(o.targetLevel));
    if (r > orderRank) {
      orderRank = r;
      orderWinner = o;
    }
  }

  const licenseCandidates = await collectLicenseCandidates({
    planId: pid,
    userId,
    headerLicenseKey,
  });

  const { rank: licenseRank, winner: licenseWinner } =
    maxLicenseRank(licenseCandidates);

  const finalRank = Math.max(orderRank, licenseRank);
  const finalLevel = rankToLevel(finalRank);

  const orderWinnerLevel = orderWinner
    ? normalizeLevel(orderWinner.targetLevel)
    : ("free" as EntitlementLevel);
  const licenseWinnerLevel = licenseWinner?.level ?? ("free" as EntitlementLevel);
  const sourcesDisagree =
    orderWinner != null &&
    licenseWinner != null &&
    orderWinnerLevel !== licenseWinnerLevel;

  let winningSource: EntitlementDebug["winningSource"] = "none";
  if (finalRank > 0) {
    if (orderRank > licenseRank) winningSource = "upgrade-order";
    else if (licenseRank > orderRank) winningSource = "license";
    else winningSource = orderRank > 0 ? "upgrade-order" : "license";
  }

  const entitlement = snapshotFromLevel(finalLevel, pid);

  const priorityExplanation =
    "L1=paid UpgradeOrder.targetLevel(max rank for planId); L2=max LicenseKey(plan-scope|binding|header-hash) non-free; final=max(L1,L2); tie prefers L1 in winningSource; X-Mode/X-Paid ignored.";

  const debug: EntitlementDebug = {
    planId: pid,
    allOrders: allOrders.map((o) => ({
      id: o.id,
      status: o.status,
      targetLevel: o.targetLevel,
      createdAt: o.createdAt.toISOString(),
    })),
    paidOrders: paidOrders.map((o) => ({
      id: o.id,
      status: o.status,
      targetLevel: o.targetLevel,
      createdAt: o.createdAt.toISOString(),
    })),
    orderWinner: orderWinner
      ? {
          id: orderWinner.id,
          status: orderWinner.status,
          targetLevel: orderWinner.targetLevel,
        }
      : null,
    licenseWinner: licenseWinner
      ? {
          id: licenseWinner.id,
          source: licenseWinner.source,
          level: licenseWinner.level,
          rawPlanLevel: licenseWinner.rawPlanLevel,
        }
      : null,
    orderRank,
    licenseRank,
    finalRank,
    finalLevel,
    winningSource,
    licenseCandidates,
    priorityExplanation,
    sourcesDisagree,
    policyVersion: "v1-max-order-license",
  };

  if (sourcesDisagree) {
    console.warn("[getEntitlement] L1/L2 档位不一致，已按 max 合成 effective", {
      planId: pid,
      orderWinnerLevel,
      licenseWinnerLevel,
      finalLevel,
      winningSource,
    });
  }

  const verboseEntLog =
    process.env.ENTITLEMENT_DEBUG_LOG === "1" ||
    process.env.NODE_ENV !== "production";

  if (verboseEntLog) {
    console.log("[DEBUG][getEntitlement][ORDERS]", {
      planId: pid,
      totalOrders: allOrders.length,
      paidCount: paidOrders.length,
      paidOrders: debug.paidOrders,
      orderRank,
      orderWinnerId: orderWinner?.id ?? null,
    });

    console.log("[DEBUG][getEntitlement][LICENSES]", {
      planId: pid,
      count: licenseCandidates.length,
      rows: licenseCandidates.map((c) => ({
        id: c.id,
        source: c.source,
        level: c.level,
        raw: c.rawPlanLevel,
      })),
      licenseRank,
      licenseWinnerId: licenseWinner?.id ?? null,
    });

    console.log("[DEBUG][getEntitlement][FINAL]", {
      planId: pid,
      finalLevel,
      finalRank,
      winningSource,
      sourcesDisagree,
      policyVersion: debug.policyVersion,
      zipEnabled: entitlement.zipEnabled,
      budgetEnabled: entitlement.budgetEnabled,
      enterpriseEnabled: entitlement.enterpriseEnabled,
    });
  }

  return { entitlement, debug };
}
