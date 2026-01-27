// app/api/auth/otp/request/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function genCode() {
  // 6位数字
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const planId = body?.planId ? String(body.planId) : null;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, message: "邮箱不合法" }, { status: 400 });
    }

    const code = genCode();
    const codeHash = sha256(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟

    await prisma.emailOtp.create({
      data: {
        id: crypto.randomUUID(),
        email,
        codeHash,
        planId,
        expiresAt,
      },
    });

    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!resendKey || !from) {
      return NextResponse.json(
        { ok: false, message: "邮件服务未配置：缺少 RESEND_API_KEY / EMAIL_FROM" },
        { status: 500 }
      );
    }

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from,
      to: email,
      subject: "您的验证码",
      text: `验证码：${code}\n10分钟内有效。若非本人操作请忽略。`,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("otp request error:", e);
    return NextResponse.json({ ok: false, message: e?.message || "发送失败" }, { status: 500 });
  }
}
