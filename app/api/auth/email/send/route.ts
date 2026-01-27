// app/api/auth/email/send/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { maskEmail, maskToken } from "@/lib/mask";
// import { sendEmail } from "@/lib/email"; // 你原来的发信方法（resend）保持不变即可

const resend = new Resend(process.env.RESEND_API_KEY);

function normalizeEmail(email: any) {
  return String(email || "").trim().toLowerCase();
}
function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);

    if (!email || !isEmail(email)) {
      return NextResponse.json({ ok: false, code: "BAD_EMAIL", message: "请输入有效邮箱" }, { status: 400 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6位
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟

    // ✅ 关键：写进数据库（稳定，不会因为热更新丢失）
    await (prisma as any).emailOtp.upsert({
      where: { email },
      update: { code, expiresAt },
      create: { email, code, expiresAt },
    });

    // 发送邮件
    console.log(`[Send] 发送验证码到: ${maskEmail(email)}, 验证码: ${maskToken(code)}`);
    let emailId: string | undefined;
    try {
      const from = process.env.EMAIL_FROM || "Attaguy <noreply@mail.attaguy.net>";
      const result = await resend.emails.send({
        from,
        to: email,
        subject: "Attaguy 验证码（10分钟有效）",
        html: `<p>你的验证码是：</p><h2 style="letter-spacing:2px">${code}</h2><p>10 分钟内有效。如非本人操作请忽略。</p>`,
      });

      emailId = result.data?.id;
      console.log(`[Resend] 邮件发送成功 - ID: ${emailId}, Email: ${maskEmail(email)}, Code: ${maskToken(code)}`);
    } catch (resendError: any) {
      console.error("[Resend] 邮件发送失败:", resendError?.message || resendError);
      throw new Error(`Resend API 错误: ${resendError?.message || "unknown_error"}`);
    }

    return NextResponse.json({ ok: true, message: "sent" });
  } catch (e: any) {
    console.error("[Send] 发送失败:", e?.message || e);
    return NextResponse.json(
      { ok: false, code: "SEND_FAILED", message: e?.message || "发送失败" },
      { status: 500 }
    );
  }
}
