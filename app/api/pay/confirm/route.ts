// app/api/pay/confirm/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * confirm 只表示“用户已确认/准备支付”
 * ✅ 不再把订单直接改成 PAID
 * PAID 必须由 webhook（真实/模拟）来置位
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = String(body?.orderId || "").trim();

    if (!orderId) {
      return NextResponse.json({ ok: false, message: "缺少 orderId" }, { status: 400 });
    }

    // 允许从 PENDING -> CONFIRMED；如果已 PAID/其他状态，则保持不变
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" },
      select: {
        id: true,
        planId: true,
        amount: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, order: updated }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/pay/confirm] error:", err);
    return NextResponse.json({ ok: false, message: "订单不存在或更新失败" }, { status: 400 });
  }
}
