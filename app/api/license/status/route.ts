import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/license/status?orderId=
 * 查询升级订单支付状态及是否已存在 License 记录（不返回明文 licenseKey）。
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = (url.searchParams.get("orderId") || "").trim();
    if (!orderId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_ORDER_ID", message: "缺少 orderId" },
        { status: 400 },
      );
    }

    const order = await prisma.upgradeOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        planId: true,
        targetLevel: true,
        status: true,
        amount: true,
        userId: true,
        paymentProvider: true,
        externalPaymentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, code: "ORDER_NOT_FOUND", message: "订单不存在" },
        { status: 404 },
      );
    }

    const note = `order:${orderId}`;
    const license = await prisma.licenseKey.findFirst({
      where: { note },
      select: {
        id: true,
        planLevel: true,
        maxDownloads: true,
        usedCount: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      planId: order.planId,
      targetLevel: order.targetLevel,
      amount: order.amount,
      paymentStatus: order.status,
      licenseId: license?.id ?? null,
      userId: order.userId,
      paymentProvider: order.paymentProvider,
      externalPaymentId: order.externalPaymentId,
      licenseIssued: Boolean(license),
      license: license
        ? {
            id: license.id,
            planLevel: license.planLevel,
            maxDownloads: license.maxDownloads,
            usedCount: license.usedCount,
            expiresAt: license.expiresAt,
            createdAt: license.createdAt,
          }
        : null,
    });
  } catch (e) {
    console.error("[/api/license/status]", e);
    return NextResponse.json(
      { ok: false, code: "INTERNAL", message: "查询失败" },
      { status: 500 },
    );
  }
}
