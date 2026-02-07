import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth";

// 生成 session token（明文）+ hash 入库
function genSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

// 统一的 tokenHash 计算函数（导出供其他模块使用）
export function computeSessionTokenHash(token: string) {
  const secret = process.env.SESSION_SECRET ?? "sess";
  return sha256(`${token}:${secret}`);
}

// ✅ 接收 NextResponse，把 cookie 写进去
export async function createSessionCookie(
  res: NextResponse,
  email: string,
  days = 30
) {
  const token = genSessionToken();
  const tokenHash = sha256(`${token}:${process.env.SESSION_SECRET ?? "sess"}`);

  const expiresAt = new Date(Date.now() + days * 24 * 3600 * 1000);

  try {
    // 生成唯一的 session id（使用 cuid 格式）
    const sessionId = `sess_${crypto.randomBytes(16).toString("hex")}`;
    
    await (prisma as any).session.create({
      data: {
        id: sessionId,
        email,
        tokenHash,
        expiresAt,
      },
    });
  } catch (dbError: any) {
    console.error("[Session] 创建 session 失败:", dbError?.message || dbError);
    console.error("[Session] db error stack:", dbError?.stack);
    throw dbError;
  }

  // cookie 名叫 session（跟你 /api/pdf 的 requireEmail() 对齐）
  // 在 Next.js App Router 中，使用 res.cookies.set() 设置 cookie
  try {
    res.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });
  } catch (cookieError: any) {
    console.error("[Session] 设置 cookie 失败:", cookieError?.message || cookieError);
    console.error("[Session] cookie error stack:", cookieError?.stack);
    throw cookieError;
  }
}

export async function requireEmailFromSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session")?.value;
  if (!raw) return null;

  try {
    const tokenHash = computeSessionTokenHash(raw);
    const sess = await (prisma as any).session.findUnique({ where: { tokenHash } });

    if (!sess) return null;
    if (sess.expiresAt <= new Date()) return null;

    return sess.email;
  } catch (error: any) {
    console.error("[Session] 读取 session 失败:", error?.message || error);
    return null;
  }
}

