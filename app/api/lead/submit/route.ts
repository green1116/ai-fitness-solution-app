import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`ENV_MISSING:${name}`);
  }
  return String(v).trim();
}

function pickModeByIntent(intent: string) {
  switch (intent) {
    case "unlock_pro":
      return "full";
    case "unlock_budget":
      return "budget";
    case "unlock_tender":
      return "pack";
    default:
      return "full";
  }
}

async function signDownloadToken(params: {
  planId: string;
  mode: string;
  email?: string;
}) {
  const secret = mustEnv("DOWNLOAD_TOKEN_SECRET");
  const expiresInSec = Number(
    process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || 1800
  );

  const key = new TextEncoder().encode(secret);
  const now = Math.floor(Date.now() / 1000);

  const reqsig = crypto
    .createHash("sha256")
    .update(`${params.planId}|${params.mode}|${params.email || ""}|${now}`)
    .digest("hex")
    .slice(0, 12);

  const token = await new SignJWT({
    scope: "pdf_download",
    planId: params.planId,
    mode: params.mode,
    level: "pro",
    email: params.email || "",
    reqsig,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSec)
    .sign(key);

  return { token, reqsig, expiresInSec };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const email = String(body?.email || "").trim().toLowerCase();
    const planId = String(body?.planId || "").trim();
    const intent = String(body?.intent || "unlock_pro").trim();

    if (!email) {
      return json(400, {
        ok: false,
        code: "EMAIL_REQUIRED",
        message: "email is required",
      });
    }

    if (!planId) {
      return json(400, {
        ok: false,
        code: "PLAN_ID_REQUIRED",
        message: "planId is required",
      });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return json(400, {
        ok: false,
        code: "EMAIL_INVALID",
        message: "email invalid",
      });
    }

    const mode = pickModeByIntent(intent);

    console.log("[LEAD_SUBMIT]", {
      email,
      planId,
      intent,
      mode,
      at: new Date().toISOString(),
    });

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const ua = req.headers.get("user-agent") || null;

    await prisma.lead.create({
      data: {
        email,
        planId: planId || null,
        intent,
        payload: {
          source: "unlock_pro",
          ip,
          ua,
        },
      },
    });

    const signed = await signDownloadToken({
      planId,
      mode,
      email,
    });

    const downloadUrl =
      `/api/pdf?download=1` +
      `&planId=${encodeURIComponent(planId)}` +
      `&mode=${encodeURIComponent(mode)}` +
      `&downloadToken=${encodeURIComponent(signed.token)}`;

    return json(200, {
      ok: true,
      code: "LEAD_CAPTURED_AND_TOKEN_ISSUED",
      message: "lead captured and token issued",
      planId,
      intent,
      mode,
      email,
      downloadToken: signed.token,
      downloadUrl,
      reqsig: signed.reqsig,
      expiresInSec: signed.expiresInSec,
    });
  } catch (err: any) {
    console.error("[LEAD_SUBMIT_ERROR]", err);
    return json(500, {
      ok: false,
      code: "LEAD_SUBMIT_INTERNAL_ERROR",
      message: err?.message || "internal error",
    });
  }
}
