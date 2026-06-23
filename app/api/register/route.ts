import { NextResponse } from "next/server";
import { completeRegistration } from "@/lib/portal/v57/register.service";
import { resolvePostRegisterPath } from "@/lib/portal/v57/journey.redirect";
import { createSessionCookie } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function allowRegister() {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ENABLE_COMMERCIAL_REGISTER === "1";
}

/**
 * V57 P2 — Canonical register: User + Organization + Membership + Session
 */
export async function POST(req: Request) {
  if (!allowRegister()) {
    return NextResponse.json(
      { ok: false, code: "REGISTER_DISABLED", message: "生产注册未启用（需 ENABLE_COMMERCIAL_REGISTER=1）" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim();
  const companyName = String(body?.companyName ?? body?.company ?? body?.name ?? "").trim();

  if (!email.includes("@")) {
    return NextResponse.json(
      { ok: false, code: "INVALID_EMAIL", message: "邮箱无效" },
      { status: 400 },
    );
  }

  if (!companyName) {
    return NextResponse.json(
      { ok: false, code: "COMPANY_REQUIRED", message: "请填写企业名称" },
      { status: 400 },
    );
  }

  try {
    const result = await completeRegistration({ email, companyName });

    const res = NextResponse.json({
      ok: true,
      user: result.user,
      organizationId: result.organizationId,
      membership: result.membership,
      isNewOrganization: result.isNewOrganization,
      nextPath: resolvePostRegisterPath(),
    });

    await createSessionCookie(res, result.user.email, 30);
    return res;
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      {
        ok: false,
        code: "REGISTER_FAILED",
        message: err instanceof Error ? err.message : "注册失败",
      },
      { status: 500 },
    );
  }
}
