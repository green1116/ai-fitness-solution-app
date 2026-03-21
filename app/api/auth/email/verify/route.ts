import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function j(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidMode(mode: string) {
  return ["full", "budget"].includes(mode);
}

function getSecret() {
  return process.env.DOWNLOAD_TOKEN_SECRET?.trim() || "";
}

async function makeDownloadToken(params: {
  planId: string;
  mode: "full" | "budget";
  email: string;
}) {
  const secret = getSecret();
  if (!secret) {
    throw new Error("DOWNLOAD_TOKEN_SECRET is missing");
  }

  const key = new TextEncoder().encode(secret);

  return await new SignJWT({
    scope: "pdf_download",
    planId: params.planId,
    mode: params.mode,
    email: params.email,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = String(body?.email || "").trim().toLowerCase();
    const code = String(body?.code || "").trim();
    const planId = String(body?.planId || "").trim();
    const mode = String(body?.mode || "full").trim().toLowerCase();

    console.log("[EMAIL_VERIFY] request", {
      email: email || "(empty)",
      planId: planId || "(empty)",
      mode,
      hasCode: !!code,
    });

    if (!email) {
      return j(400, {
        ok: false,
        code: "EMAIL_REQUIRED",
        message: "email is required",
      });
    }

    if (!isValidEmail(email)) {
      return j(400, {
        ok: false,
        code: "EMAIL_INVALID",
        message: "invalid email format",
      });
    }

    if (!code) {
      return j(400, {
        ok: false,
        code: "CODE_REQUIRED",
        message: "code is required",
      });
    }

    if (!planId) {
      return j(400, {
        ok: false,
        code: "PLAN_ID_REQUIRED",
        message: "planId is required",
      });
    }

    if (!isValidMode(mode)) {
      return j(400, {
        ok: false,
        code: "MODE_INVALID",
        message: "mode must be full or budget",
      });
    }

    const record = await prisma.emailVerifyCode.findFirst({
      where: {
        email,
        code,
        mode,
        planId,
        usedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return j(400, {
        ok: false,
        code: "CODE_NOT_FOUND",
        message: "verification code not found, please resend",
      });
    }

    if (record.expiresAt.getTime() < Date.now()) {
      return j(400, {
        ok: false,
        code: "CODE_EXPIRED",
        message: "verification code expired, please resend",
      });
    }

await prisma.emailVerifyCode.update({
  where: { id: record.id },
  data: { usedAt: new Date() },
});

await prisma.lead.create({
  data: {
    email,
    planId,
    intent: mode === "budget" ? "download_budget_verified" : "download_full_verified",
    payload: {
      source: "email_verify",
      mode,
      verifiedAt: new Date().toISOString(),
    },
  },
});

const downloadToken = await makeDownloadToken({
      planId,
      mode: mode as "full" | "budget",
      email,
    });

    console.log("[EMAIL_VERIFY] success", {
      email,
      planId,
      mode,
    });

    return j(200, {
      ok: true,
      code: "EMAIL_VERIFIED",
      message: "email verified",
      email,
      planId,
      mode,
      downloadToken,
    });
  } catch (err: any) {
    console.error("[EMAIL_VERIFY] FATAL", err);
    console.error("[EMAIL_VERIFY] message =", err?.message);
    console.error("[EMAIL_VERIFY] stack =", err?.stack);

    return j(500, {
      ok: false,
      code: "EMAIL_VERIFY_FATAL",
      message: err?.message || "internal error",
    });
  }
}