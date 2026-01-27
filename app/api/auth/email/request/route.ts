// app/api/auth/email/request/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { enforceLimit } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/ip";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY || "");

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const { email, planId } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !isEmail(normalizedEmail)) {
      return NextResponse.json(
        { ok: false, code: "BAD_EMAIL", message: "请输入有效的邮箱" },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);

    // 限流：同邮箱 & 同 IP
    const limEmail = await enforceLimit(`rl:otp:email:${normalizedEmail}`, 3600, 10);
    if (!limEmail.ok) {
      return NextResponse.json(
        { ok: false, code: "TOO_MANY_REQUESTS", message: "验证码发送过于频繁，请稍后再试" },
        { status: 429 }
      );
    }

    const limIp = await enforceLimit(`rl:otp:ip:${ip}`, 3600, 60);
    if (!limIp.ok) {
      return NextResponse.json(
        { ok: false, code: "TOO_MANY_REQUESTS", message: "请求过于频繁，请稍后再试" },
        { status: 429 }
      );
    }

    // 生成 6 位数字验证码
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 分钟

    // ✅ 统一：写入 EmailOtp 表
    // 模型假设为：
    // model EmailOtp {
    //   email     String   @id
    //   code      String
    //   expiresAt DateTime
    //   createdAt DateTime @default(now())
    // }
    await (prisma as any).emailOtp.upsert({
      where: { email: normalizedEmail },
      update: {
        code,
        expiresAt,
      },
      create: {
        email: normalizedEmail,
        code,
        expiresAt,
      },
    });

    console.log(
      `[EmailOtp] upsert ok: email=${normalizedEmail}, code=${code}, expiresAt=${expiresAt.toISOString()}`
    );

    // 开发期把验证码打在控制台，方便你对比
    console.log(`[DEV OTP] ${normalizedEmail} ${code}`);

    // 发送邮件
    const from = process.env.EMAIL_FROM || "Attaguy <noreply@mail.attaguy.net>";

    await resend.emails.send({
      from,
      to: normalizedEmail,
      subject: "验证码登录",
      text: `您的验证码是：${code}\n10 分钟内有效，请勿泄露给他人。`,
      html: `<p>您的验证码是：<strong>${code}</strong></p><p>10 分钟内有效，请勿泄露给他人。</p>`,
    });

    await notify(`[Attaguy] 发送登录验证码：${normalizedEmail} | ip=${ip} | planId=${planId || "-"}`);

    return NextResponse.json({
      ok: true,
      message: "验证码已发送，请查收邮箱（10 分钟内有效）",
    });
  } catch (e: any) {
    console.error("[Email Request] failed:", e?.message || e);
    return NextResponse.json(
      { ok: false, code: "SEND_FAILED", message: e?.message || "验证码发送失败" },
      { status: 500 }
    );
  }
}
