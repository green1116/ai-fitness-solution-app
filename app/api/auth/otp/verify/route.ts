// app/api/auth/otp/verify/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { signDownloadToken } from "@/lib/download-token";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email, code, planId } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ ok: false, message: "参数缺失" }, { status: 400 });
    }

    if (!planId) {
      return NextResponse.json({ ok: false, message: "planId 是必需的" }, { status: 400 });
    }

    // 1️⃣ 验证码校验
    const codeHash = sha256(String(code).trim());
    const normalizedEmail = String(email).trim().toLowerCase();

    const otp = await prisma.emailOtp.findFirst({
      where: {
        email: normalizedEmail,
        codeHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
        ...(planId ? { planId: String(planId) } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json({ ok: false, message: "验证码无效或已过期" }, { status: 400 });
    }

    // 标记验证码已使用
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    // 创建 Session（用于后续的 session 验证）
    const rawToken = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + (Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || 1800) * 1000));

    await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        tokenHash,
        expiresAt,
      },
    });

    // 写 cookie
    const cookieStore = await cookies();
    cookieStore.set("session", rawToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false, // 本地开发必须 false；上生产再改 true
      maxAge: Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || 1800),
    });

    // 2️⃣ 生成 downloadToken
    const downloadToken = await signDownloadToken({
      planId: String(planId),
      scope: "pdf_download",
      mode: "full",
    });

    return NextResponse.json({
      ok: true,
      downloadToken,
    });
  } catch (e: any) {
    console.error("otp verify error:", e);
    return NextResponse.json({ ok: false, message: e?.message || "验证失败" }, { status: 500 });
  }
}
