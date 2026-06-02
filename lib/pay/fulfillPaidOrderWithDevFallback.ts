import crypto from "crypto";
import type { PayConfirmPaidHints } from "@/lib/payments/types";
import { fulfillPaidOrder } from "@/lib/pay/fulfill";
import { prisma } from "@/lib/prisma";
import {
  devPayGetPending,
  devPayIsLikelyMockOrderId,
  type DevPayPendingOrder,
} from "@/lib/pay/devPayMockOrders";

const isDev = () => process.env.NODE_ENV !== "production";

type FulfillResult = Awaited<ReturnType<typeof fulfillPaidOrder>>;

function syntheticLicenseResult(
  orderId: string,
  meta: DevPayPendingOrder,
  licenseKeyPlain: string,
): Extract<FulfillResult, { ok: true }> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const planLevel = meta.targetLevel === "enterprise" ? "enterprise" : "pro";
  return {
    ok: true,
    order: {
      id: orderId,
      planId: meta.planId,
      targetLevel: meta.targetLevel,
      status: "paid",
      amount: meta.amount,
    },
    license: {
      id: "dev-synthetic",
      planId: meta.planId,
      planLevel,
      maxDownloads: 5,
      usedCount: 0,
      expiresAt,
      requireLogin: false,
      note: `order:${orderId}`,
      createdAt: new Date(),
    },
    licenseKeyPlain,
    note: "dev synthetic license（数据库不可用时的兜底）",
  };
}

/**
 * 先走正式 fulfill；dev 下订单不存在时尝试用内存元数据补种 upgrade_order 再履约；
 * 仍失败则返回可给前端的临时明文 key（仅开发态）。
 */
export async function fulfillPaidOrderWithDevFallback(
  orderId: string,
  hints?: PayConfirmPaidHints,
): Promise<FulfillResult> {
  const first = await fulfillPaidOrder(orderId);
  if (first.ok) return first;
  if (first.code !== "ORDER_NOT_FOUND") return first;

  const pending = devPayGetPending(orderId);
  const hintedPlan = (hints?.fallbackPlanId || "").trim();
  const hintedTier = String(hints?.fallbackTargetLevel ?? "").trim().toLowerCase();
  const hintedLevel: "pro" | "enterprise" | null =
    hintedTier === "enterprise"
      ? "enterprise"
      : hintedTier === "pro"
        ? "pro"
        : null;

  const meta: DevPayPendingOrder | null =
    pending ??
    (isDev() && devPayIsLikelyMockOrderId(orderId)
      ? {
          planId: hintedPlan || "__unknown__",
          targetLevel: hintedLevel ?? "pro",
          amount: 100,
          projectId: "",
        }
      : null);

  if (isDev() && devPayIsLikelyMockOrderId(orderId) && !pending && hintedLevel) {
    console.info("[pay] fulfill fallback seed using webhook hints", {
      orderId,
      planId: hintedPlan || "__unknown__",
      targetLevel: hintedLevel,
    });
  }

  /** 无内存元数据且非 dev 的 order_* 占位：视为真实丢单 */
  if (!meta) return first;

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.upgradeOrder.findUnique({
        where: { id: orderId },
        select: { id: true },
      });
      if (!existing) {
        await tx.upgradeOrder.create({
          data: {
            id: orderId,
            planId: meta.planId,
            projectId: meta.projectId || null,
            targetLevel: meta.targetLevel,
            status: "pending",
            amount: meta.amount,
          },
        });
      }
    });
  } catch (e) {
    console.warn("[pay] webhook dev: seed upgrade_order failed", e);
    const licenseKeyPlain =
      "dev_mock_" + crypto.randomBytes(24).toString("base64url");
    return syntheticLicenseResult(orderId, meta, licenseKeyPlain);
  }

  const second = await fulfillPaidOrder(orderId);
  if (second.ok) return second;

  const licenseKeyPlain =
    "dev_mock_" + crypto.randomBytes(24).toString("base64url");
  return syntheticLicenseResult(orderId, meta, licenseKeyPlain);
}
