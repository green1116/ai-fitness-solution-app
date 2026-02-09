import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function randomKeyPlain() {
  return crypto.randomBytes(32).toString("base64url");
}

export async function fulfillPaidOrder(orderId: string) {
  const maxDownloads = Number(process.env.DEFAULT_MAX_DOWNLOADS || "2");
  const ttlDays = Number(process.env.LICENSE_TTL_DAYS || "30");

  if (!Number.isFinite(maxDownloads) || maxDownloads <= 0) {
    throw new Error("DEFAULT_MAX_DOWNLOADS invalid");
  }
  if (!Number.isFinite(ttlDays) || ttlDays <= 0) {
    throw new Error("LICENSE_TTL_DAYS invalid");
  }

  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  const note = `order:${orderId}`;

  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { id: true, planId: true, email: true, status: true, amount: true },
    });

    if (!order) {
      return { ok: false as const, code: "ORDER_NOT_FOUND", message: "订单不存在" };
    }

    const existing = await tx.licenseKey.findFirst({
      where: { note },
      select: {
        id: true,
        planId: true,
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

    if (existing) {
      return {
        ok: true as const,
        order: { ...order, status: "PAID" },
        license: existing,
        licenseKeyPlain: null as string | null,
        note: "license 已存在（幂等命中），明文 key 不可回溯",
      };
    }

    const licenseKeyPlain = randomKeyPlain();
    const keyHash = sha256Hex(licenseKeyPlain);

    const license = await tx.licenseKey.create({
      data: {
        keyHash,
        planId: order.planId,
        maxDownloads,
        usedCount: 0,
        expiresAt,
        requireLogin: false,
        note,
      },
      select: {
        id: true,
        planId: true,
        maxDownloads: true,
        usedCount: true,
        expiresAt: true,
        requireLogin: true,
        note: true,
        createdAt: true,
      },
    });

    return {
      ok: true as const,
      order: { ...order, status: "PAID" },
      license,
      licenseKeyPlain,
      note: "首次发放 license（仅本次返回明文 key）",
    };
  });
}

export default fulfillPaidOrder;
