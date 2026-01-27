// app/api/pay/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const planId = String(body?.planId || "").trim();
    const amount = Number(body?.amount || 0);
    const email = body?.email ? String(body.email).trim() : null;

    if (!planId) {
      return NextResponse.json({ ok: false, message: "缺少 planId" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ ok: false, message: "amount 必须是正整数" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        planId,
        amount: Math.floor(amount),
        email,
        status: "PENDING",
      },
      select: {
        id: true,
        planId: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    // 返回 orderId，前端可拿它去 confirm
    return NextResponse.json({ ok: true, order }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/pay/create] error:", err);
    return NextResponse.json({ ok: false, message: "服务器错误" }, { status: 500 });
  }
}

