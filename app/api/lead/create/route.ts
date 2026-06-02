import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const planId = String(body?.planId || "").trim();
    const company = String(body?.company || "").trim();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const note = String(body?.note || "").trim();

    if (!planId || !company || !name || !email) {
      return NextResponse.json(
        { ok: false, message: "缺少必填字段" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, message: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        planId,
        email,
        company,
        name,
        note: note || null,
        // 兼容当前 Lead 模型的既有必填字段
        intent: "consult",
        source: "download",
        status: "new",
        score: 0,
        payload: {
          from: "lead_create_api",
          createdAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
    });
  } catch (err: unknown) {
    console.error("[lead/create]", err);
    return NextResponse.json(
      {
        ok: false,
        message: "系统繁忙，请稍后重试",
      },
      { status: 500 }
    );
  }
}
