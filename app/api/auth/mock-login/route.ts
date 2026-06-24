import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function allowMockLogin() {
  return process.env.NODE_ENV !== "production";
}

/**
 * POST /api/auth/mock-login
 * 最小邮箱登录（仅开发环境；生产环境已禁用）。
 * Cookie 写入后请调用 GET /api/auth/me 拉取用户信息。
 */
export async function POST(req: Request) {
  if (!allowMockLogin()) {
    return NextResponse.json(
      { ok: false, code: "MOCK_AUTH_DISABLED", message: "mock 登录未启用" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(String(body?.email || ""));
  if (!email.includes("@")) {
    return NextResponse.json(
      { ok: false, code: "INVALID_EMAIL", message: "邮箱无效" },
      { status: 400 },
    );
  }

  const res = NextResponse.json({ ok: true });
  await createSessionCookie(res, email, 30);
  return res;
}
