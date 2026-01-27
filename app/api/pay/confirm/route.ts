// app/api/pay/confirm/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = String(body?.orderId || "").trim();

    if (!orderId) {
      return NextResponse.json({ ok: false, message: "缺少 orderId" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
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
    // Prisma 找不到记录时会抛错
    console.error("[/api/pay/confirm] error:", err);
    return NextResponse.json({ ok: false, message: "订单不存在或更新失败" }, { status: 400 });
  }
}

