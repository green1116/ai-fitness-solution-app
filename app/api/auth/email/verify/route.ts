import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VerifyRecord = {
  code: string;
  expiresAt: number;
  email: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __EMAIL_VERIFY_STORE__: Map<string, VerifyRecord> | undefined;
}

const store =
  global.__EMAIL_VERIFY_STORE__ ||
  (global.__EMAIL_VERIFY_STORE__ = new Map<string, VerifyRecord>());

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

    const rec = store.get(email);

    if (!rec) {
      return j(400, {
        ok: false,
        code: "CODE_NOT_FOUND",
        message: "verification code not found, please resend",
      });
    }

    if (Date.now() > rec.expiresAt) {
      store.delete(email);
      return j(400, {
        ok: false,
        code: "CODE_EXPIRED",
        message: "verification code expired, please resend",
      });
    }

    if (rec.code !== code) {
      return j(400, {
        ok: false,
        code: "CODE_INVALID",
        message: "invalid verification code",
      });
    }

    store.delete(email);

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