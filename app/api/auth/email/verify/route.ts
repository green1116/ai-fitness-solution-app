// app/api/auth/email/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedCode = String(code || "").trim();

    if (!normalizedEmail || !isEmail(normalizedEmail) || !normalizedCode) {
      return NextResponse.json(
        { ok: false, code: "BAD_REQUEST", message: "请输入有效的邮箱和验证码" },
        { status: 400 }
      );
    }

    // ✅ 只从数据库读 EmailOtp
    const row = await (prisma as any).emailOtp.findUnique({
      where: { email: normalizedEmail },
    });

    if (!row) {
      return NextResponse.json(
        { ok: false, code: "CODE_EXPIRED", message: "验证码不存在或已过期，请重新获取" },
        { status: 403 }
      );
    }

    if (new Date(row.expiresAt).getTime() <= Date.now()) {
      await (prisma as any).emailOtp
        .delete({ where: { email: normalizedEmail } })
        .catch(() => {});
      return NextResponse.json(
        { ok: false, code: "CODE_EXPIRED", message: "验证码不存在或已过期，请重新获取" },
        { status: 403 }
      );
    }

    if (String(row.code).trim() !== normalizedCode) {
      return NextResponse.json(
        { ok: false, code: "INVALID_CODE", message: "验证码错误，请重试" },
        { status: 403 }
      );
    }

    // ✅ 一次性验证码：删除
    await (prisma as any).emailOtp
      .delete({ where: { email: normalizedEmail } })
      .catch(() => {});

    // ✅ 写 session cookie（注意：一定要用 NextResponse）
    const res = NextResponse.json({ ok: true, message: "verified" });
    
    try {
      await createSessionCookie(res, normalizedEmail, 30);
    } catch (sessionError: any) {
      console.error("[Verify] createSessionCookie failed:", sessionError?.message || sessionError);
      console.error("[Verify] session error stack:", sessionError?.stack);
      throw sessionError;
    }

    return res;
  } catch (e: any) {
    console.error("[Verify] failed:", e?.message || e);
    console.error("[Verify] error stack:", e?.stack);
    return NextResponse.json(
      { ok: false, code: "VERIFY_FAILED", message: e?.message || "验证失败" },
      { status: 500 }
    );
  }
}
