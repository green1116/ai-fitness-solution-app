// lib/pay/fulfill.ts
/**
 * 支付成功后的履约入口（应由 webhook 调用）。
 *
 * 查找顺序：
 * 1) UpgradeOrder（/api/pay/create-order、/api/upgrade/create-order）
 * 2) Order（历史 /api/pay/create）
 *
 * License 写入统一走 lib/license/issue.issueLicenseKeyInTransaction
 */
import { Prisma } from "@prisma/client";
import { normalizeEmail } from "@/lib/auth";
import { issueLicenseKeyInTransaction } from "@/lib/license/issue";
import { prisma } from "@/lib/prisma";
import type { UpgradeTargetLevel } from "@/lib/upgradeUnlock";

/**
 * planLevel → entitlement 权限位（与 lib/entitlements/planEntitlement 一致）。
 * 仅用于日志可读性，真正的判断仍走 entitlement 派生。
 */
function entitlementFlagsFromPlanLevel(planLevel: string) {
  const v = String(planLevel || "").trim().toLowerCase();
  if (v === "enterprise") {
    return { planEnabled: true, budgetEnabled: true, zipEnabled: true };
  }
  if (v === "pro") {
    return { planEnabled: true, budgetEnabled: true, zipEnabled: false };
  }
  return { planEnabled: false, budgetEnabled: false, zipEnabled: false };
}

function targetFromUpgradeOrder(raw: string): UpgradeTargetLevel {
  const v = String(raw || "").trim().toLowerCase();
  if (v === "enterprise") return "enterprise";
  return "pro";
}

const PLAN_LEVEL_RANK: Record<string, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

function planLevelRank(raw: string): number {
  return PLAN_LEVEL_RANK[String(raw || "").trim().toLowerCase()] ?? 0;
}

const existingLicenseSelect = {
  id: true,
  planId: true,
  planLevel: true,
  maxDownloads: true,
  usedCount: true,
  expiresAt: true,
  requireLogin: true,
  note: true,
  createdAt: true,
} as const;

async function alignLicenseWithOrderTier(
  tx: Prisma.TransactionClient,
  existing: {
    id: string;
    planId: string | null;
    planLevel: string;
    maxDownloads: number;
    usedCount: number;
    expiresAt: Date | null;
    requireLogin: boolean;
    note: string | null;
    createdAt: Date;
  },
  upgradeOrderTargetLevel: string,
) {
  const desired = targetFromUpgradeOrder(upgradeOrderTargetLevel);
  if (planLevelRank(desired) <= planLevelRank(existing.planLevel)) {
    return existing;
  }
  await tx.licenseKey.update({
    where: { id: existing.id },
    data: { planLevel: desired },
  });
  const refreshed = await tx.licenseKey.findUnique({
    where: { id: existing.id },
    select: existingLicenseSelect,
  });
  return refreshed ?? { ...existing, planLevel: desired };
}

async function syncLicenseBindingForPaidOrder(
  tx: Prisma.TransactionClient,
  params: {
    userId: string | null | undefined;
    clientFingerprint: string | null | undefined;
    licenseId: string;
  },
) {
  const uid =
    typeof params.userId === "string" ? params.userId.trim() : "";
  if (!uid) return;
  const exists = await tx.user.findUnique({
    where: { id: uid },
    select: { id: true },
  });
  if (!exists) return;

  const fp = params.clientFingerprint?.trim() || null;

  await tx.licenseBinding.upsert({
    where: {
      userId_licenseId: { userId: uid, licenseId: params.licenseId },
    },
    create: {
      userId: uid,
      licenseId: params.licenseId,
      fingerprint: fp,
    },
    update: fp ? { fingerprint: fp } : {},
  });
}

/**
 * 幂等：LicenseKey.note === `order:${orderId}`
 */
export async function fulfillPaidOrder(orderId: string) {
  const maxDownloads = Number(process.env.DEFAULT_MAX_DOWNLOADS || "5");
  const ttlDays = Number(process.env.LICENSE_TTL_DAYS || "30");

  if (!Number.isFinite(maxDownloads) || maxDownloads <= 0) {
    throw new Error("DEFAULT_MAX_DOWNLOADS invalid");
  }
  if (!Number.isFinite(ttlDays) || ttlDays <= 0) {
    throw new Error("LICENSE_TTL_DAYS invalid");
  }

  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  const note = `order:${orderId}`;

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const upgradeOrder = await tx.upgradeOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        planId: true,
        targetLevel: true,
        status: true,
        amount: true,
        userId: true,
        clientFingerprint: true,
      },
    });

    if (upgradeOrder) {
      const st = String(upgradeOrder.status || "").toLowerCase();
      if (st === "failed" || st === "canceled") {
        return {
          ok: false as const,
          code: "ORDER_NOT_PAYABLE",
          message: "订单已关闭，无法履约",
        };
      }

      const existing = await tx.licenseKey.findFirst({
        where: { note },
        select: existingLicenseSelect,
      });

      if (st === "paid" && existing) {
        const lic = await alignLicenseWithOrderTier(
          tx,
          existing,
          upgradeOrder.targetLevel,
        );
        await syncLicenseBindingForPaidOrder(tx, {
          userId: upgradeOrder.userId,
          clientFingerprint: upgradeOrder.clientFingerprint,
          licenseId: lic.id,
        });
        return {
          ok: true as const,
          order: {
            id: upgradeOrder.id,
            planId: upgradeOrder.planId,
            targetLevel: upgradeOrder.targetLevel,
            status: "paid" as const,
            amount: upgradeOrder.amount,
          },
          license: lic,
          licenseKeyPlain: null as string | null,
          note: "license 已存在（命中幂等），明文 key 不可再次返回",
        };
      }

      if (st === "paid" && !existing) {
        return {
          ok: false as const,
          code: "ORDER_PAID_BUT_NO_LICENSE",
          message: "订单已标记支付但未找到 license 记录，请联系支持",
        };
      }

      await tx.upgradeOrder.update({
        where: { id: orderId },
        data: { status: "paid" },
      });

      if (existing) {
        const lic = await alignLicenseWithOrderTier(
          tx,
          existing,
          upgradeOrder.targetLevel,
        );
        await syncLicenseBindingForPaidOrder(tx, {
          userId: upgradeOrder.userId,
          clientFingerprint: upgradeOrder.clientFingerprint,
          licenseId: lic.id,
        });
        return {
          ok: true as const,
          order: {
            id: upgradeOrder.id,
            planId: upgradeOrder.planId,
            targetLevel: upgradeOrder.targetLevel,
            status: "paid" as const,
            amount: upgradeOrder.amount,
          },
          license: lic,
          licenseKeyPlain: null as string | null,
          note: "license 已存在（命中幂等），明文 key 不可再次返回",
        };
      }

      const planLevel = targetFromUpgradeOrder(upgradeOrder.targetLevel);
      const { licenseKeyPlain, license } = await issueLicenseKeyInTransaction(tx, {
        planId: upgradeOrder.planId,
        planLevel,
        maxDownloads,
        expiresAt,
        note,
        source: "formal-upgrade-order",
      });

      await syncLicenseBindingForPaidOrder(tx, {
        userId: upgradeOrder.userId,
        clientFingerprint: upgradeOrder.clientFingerprint,
        licenseId: license.id,
      });

      console.info("[access-write]", {
        source: "upgrade-order",
        orderId,
        userId: upgradeOrder.userId ?? null,
        planId: upgradeOrder.planId,
        planLevel,
        entitlement: entitlementFlagsFromPlanLevel(planLevel),
      });

      return {
        ok: true as const,
        order: {
          id: upgradeOrder.id,
          planId: upgradeOrder.planId,
          targetLevel: upgradeOrder.targetLevel,
          status: "paid" as const,
          amount: upgradeOrder.amount,
        },
        license,
        licenseKeyPlain,
        note: "首次发放 license（UpgradeOrder），仅本次返回明文 key",
      };
    }

    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        planId: true,
        email: true,
        status: true,
        amount: true,
      },
    });

    if (!order) {
      return {
        ok: false as const,
        code: "ORDER_NOT_FOUND",
        message: "订单不存在",
      };
    }

    const existingLegacy = await tx.licenseKey.findFirst({
      where: { note },
      select: {
        id: true,
        planId: true,
        planLevel: true,
        maxDownloads: true,
        usedCount: true,
        expiresAt: true,
        requireLogin: true,
        note: true,
        createdAt: true,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    if (existingLegacy) {
      if (order.email) {
        const u = await tx.user.findUnique({
          where: { email: normalizeEmail(order.email) },
          select: { id: true },
        });
        if (u) {
          await syncLicenseBindingForPaidOrder(tx, {
            userId: u.id,
            clientFingerprint: null,
            licenseId: existingLegacy.id,
          });
        }
      }
      return {
        ok: true as const,
        order: { ...order, status: "PAID" as const },
        license: existingLegacy,
        licenseKeyPlain: null as string | null,
        note: "license 已存在（命中幂等），明文 key 不可再次返回",
      };
    }

    const { licenseKeyPlain, license } = await issueLicenseKeyInTransaction(tx, {
      planId: order.planId,
      planLevel: "pro",
      maxDownloads,
      expiresAt,
      note,
      source: "formal-order-legacy",
    });

    if (order.email) {
      const u = await tx.user.findUnique({
        where: { email: normalizeEmail(order.email) },
        select: { id: true },
      });
      if (u) {
        await syncLicenseBindingForPaidOrder(tx, {
          userId: u.id,
          clientFingerprint: null,
          licenseId: license.id,
        });
      }
    }

    return {
      ok: true as const,
      order: { ...order, status: "PAID" as const },
      license,
      licenseKeyPlain,
      note: "首次发放 license（Order 兼容路径），仅本次返回明文 key",
    };
  });
}
