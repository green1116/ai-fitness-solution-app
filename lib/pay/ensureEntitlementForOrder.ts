/**
 * webhook 履约后的最终一致性保障：
 *
 * 无论 fulfillPaidOrder 走的是「正式 / dev synthetic / fallback / 幂等命中」哪条路径，
 * 都用这个函数强制：
 *   1) 把 UpgradeOrder.status 写成 "paid"（让 entitlement 派生侧能从订单兜底）
 *   2) 用 upsert-by-planId 语义保证 LicenseKey 反映新档位（enterprise 覆盖 pro 覆盖 free）
 *   3) 把 LicenseKey 绑定到当前 session 的 user.id（或 UpgradeOrder.userId）
 *
 * 这样路由侧的 entitlement 派生就一定能命中 budget/zip。
 */
import { Prisma } from "@prisma/client";
import { ensureLicenseBinding } from "@/lib/license/binding";
import { issueLicenseKeyInTransaction } from "@/lib/license/issue";
import { prisma } from "@/lib/prisma";

export type EnsureEntitlementResult = {
  ok: boolean;
  reason?: string;
  planId: string | null;
  planLevel: "pro" | "enterprise" | null;
  licenseId: string | null;
  licenseKeyPlain: string | null;
  binding: { ok: boolean; created: boolean; reason?: string } | null;
  upgradeOrderUserId: string | null;
};

function normalizeTargetLevel(v: unknown): "pro" | "enterprise" | null {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "enterprise") return "enterprise";
  if (s === "pro") return "pro";
  return null;
}

function pickHigherCommercialLevel(
  a: "pro" | "enterprise" | null,
  b: "pro" | "enterprise" | null,
): "pro" | "enterprise" | null {
  const ra = a === "enterprise" ? 2 : a === "pro" ? 1 : 0;
  const rb = b === "enterprise" ? 2 : b === "pro" ? 1 : 0;
  const m = Math.max(ra, rb);
  if (m >= 2) return "enterprise";
  if (m >= 1) return "pro";
  return null;
}

const LEVEL_RANK: Record<string, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

export async function ensureEntitlementForOrder(params: {
  orderId: string;
  sessionUserId?: string | null;
  fallbackPlanId?: string | null;
  fallbackTargetLevel?: "pro" | "enterprise" | null;
}): Promise<EnsureEntitlementResult> {
  const orderId = (params.orderId || "").trim();
  if (!orderId) {
    return {
      ok: false,
      reason: "missing-orderId",
      planId: null,
      planLevel: null,
      licenseId: null,
      licenseKeyPlain: null,
      binding: null,
      upgradeOrderUserId: null,
    };
  }

  const fallbackLevel = normalizeTargetLevel(params.fallbackTargetLevel);
  let planId = (params.fallbackPlanId || "").trim();
  let planLevel: "pro" | "enterprise" | null = fallbackLevel;
  let upgradeOrderUserId: string | null = null;

  try {
    const uo = await prisma.upgradeOrder.findUnique({
      where: { id: orderId },
      select: { planId: true, targetLevel: true, userId: true, status: true },
    });
    if (uo) {
      const pid = (uo.planId || "").trim();
      if (pid) planId = pid;
      upgradeOrderUserId = uo.userId ?? null;
      const fromOrder = normalizeTargetLevel(uo.targetLevel);
      planLevel = pickHigherCommercialLevel(fromOrder, fallbackLevel);

      /** 若 DB 误写为 pro 而 webhook 已带 enterprise，则把订单行纠正为高档位（供 getEntitlement L1 读取） */
      if (
        planLevel &&
        fromOrder !== planLevel &&
        fallbackLevel === planLevel
      ) {
        try {
          await prisma.upgradeOrder.update({
            where: { id: orderId },
            data: { targetLevel: planLevel },
          });
          console.info("[ensure-entitlement] patched upgrade_order.targetLevel", {
            orderId,
            previousRaw: uo.targetLevel,
            next: planLevel,
            reason: "webhook-fallback-outranks-db",
          });
        } catch (e) {
          console.warn("[ensure-entitlement] patch targetLevel threw", {
            orderId,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }

      /** ★ 强制把 UpgradeOrder.status 写成 "paid"
       *   让 resolver 的 upgrade-order 兜底（where { status: "paid" }）一定能命中 */
      if (uo.status !== "paid") {
        try {
          await prisma.upgradeOrder.update({
            where: { id: orderId },
            data: { status: "paid" },
          });
          console.info("[ensure-entitlement] order status -> paid", {
            orderId,
            previousStatus: uo.status,
            resolvedTargetLevel: planLevel,
          });
        } catch (e) {
          console.warn("[ensure-entitlement] order status update threw", {
            orderId,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }
    }
  } catch (e) {
    console.warn("[ensure-entitlement] upgradeOrder read threw", {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  console.info("[ensure-entitlement] resolved", {
    orderId,
    planId: planId || null,
    planLevel,
    fallbackLevel,
  });

  if (!planId || !planLevel) {
    return {
      ok: false,
      reason: "missing-plan-or-target",
      planId: planId || null,
      planLevel,
      licenseId: null,
      licenseKeyPlain: null,
      binding: null,
      upgradeOrderUserId,
    };
  }

  const note = `order:${orderId}`;
  const maxDownloads = Number(process.env.DEFAULT_MAX_DOWNLOADS || "5");
  const ttlDays = Number(process.env.LICENSE_TTL_DAYS || "30");
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  let licenseId = "";
  let licenseKeyPlain: string | null = null;

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      /** —— upsert-by-planId 语义：
       *   1) 找 planId 下任一有效 LicenseKey（按 createdAt desc 取最新）
       *   2) 存在 → 升级 planLevel（只升不降；enterprise > pro > free）
       *   3) 不存在 → create 新行（note=order:${orderId}） */
      const candidateRows = await tx.licenseKey.findMany({
        where: {
          planId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      });

      const existing = candidateRows[0];
      if (existing) {
        const existingRank = LEVEL_RANK[String(existing.planLevel).toLowerCase()] ?? 0;
        const targetRank = LEVEL_RANK[planLevel as string] ?? 0;
        if (targetRank > existingRank) {
          await tx.licenseKey.update({
            where: { id: existing.id },
            data: { planLevel: planLevel as string },
          });
          console.info("[ensure-entitlement] upgraded existing license", {
            licenseId: existing.id,
            planId,
            from: existing.planLevel,
            to: planLevel,
          });
        } else {
          console.info("[ensure-entitlement] existing license is sufficient", {
            licenseId: existing.id,
            planId,
            level: existing.planLevel,
          });
        }
        return { licenseId: existing.id, plain: null as string | null };
      }

      const issued = await issueLicenseKeyInTransaction(tx, {
        planId,
        planLevel,
        maxDownloads,
        expiresAt,
        note,
        source: "webhook-ensure-entitlement",
      });
      return {
        licenseId: issued.license.id,
        plain: issued.licenseKeyPlain as string | null,
      };
    });
    licenseId = result.licenseId;
    licenseKeyPlain = result.plain;
  } catch (e) {
    console.error("[ensure-entitlement] issue/upsert threw", {
      error: e instanceof Error ? e.message : String(e),
    });
    return {
      ok: false,
      reason: "license-write-failed",
      planId,
      planLevel,
      licenseId: null,
      licenseKeyPlain: null,
      binding: null,
      upgradeOrderUserId,
    };
  }

  /** —— 覆盖语义（额外保险）：同 planId 下所有低档行也一起拉到本次 targetLevel ——
   *   规则：enterprise > pro > free；保证不存在"旧的 pro 拖累 enterprise" */
  try {
    const planLevelsToOverride =
      planLevel === "enterprise" ? ["free", "pro"] : ["free"];
    const overrideResult = await prisma.licenseKey.updateMany({
      where: {
        planId,
        planLevel: { in: planLevelsToOverride },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      data: { planLevel: planLevel as string },
    });
    if (overrideResult.count > 0) {
      console.info("[ensure-entitlement] overrode lower-tier licenses", {
        planId,
        targetLevel: planLevel,
        overrideCount: overrideResult.count,
      });
    }
  } catch (e) {
    console.warn("[ensure-entitlement] override lower-tier licenses threw", {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  const effectiveUserId =
    (params.sessionUserId || "").trim() || upgradeOrderUserId || "";
  let binding: EnsureEntitlementResult["binding"] = null;
  if (effectiveUserId) {
    binding = await ensureLicenseBinding({ userId: effectiveUserId, licenseId });
  }

  return {
    ok: true,
    planId,
    planLevel,
    licenseId,
    licenseKeyPlain,
    binding,
    upgradeOrderUserId,
  };
}
