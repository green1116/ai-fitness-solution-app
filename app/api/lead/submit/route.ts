import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueStatefulDownloadToken } from "@/lib/download-token";
import { signUnlockToken } from "@/lib/unlock-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function pickModeByIntent(intent: string): "full" | "budget" | "pack" {
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const email = String(body?.email || "").trim().toLowerCase();
    const planId = String(body?.planId || "").trim();
    const intent = String(body?.intent || "unlock_pro").trim() as
      | "unlock_pro"
      | "unlock_budget"
      | "unlock_tender";

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
    const variant = intent === "unlock_tender" ? "tender" : "sales";

    console.log("[LEAD_SUBMIT]", {
      email,
      planId,
      intent,
      mode,
      variant,
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
          source: "unlock",
          ip,
          ua,
        },
      },
    });

    // V6: 签发 download token（带 variant）
    const downloadToken = await issueStatefulDownloadToken({
      planId,
      mode,
      variant,
      email,
      ttlSec: Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || "1800"),
      maxUses: 1,
    });

    // V6: 签发 unlockToken（24h 有效，用于后续申请更多 download token）
    const unlockToken = await signUnlockToken({
      planId,
      email,
      intent,
    });

    // 构建下载 URL
    let downloadUrl = "";
    if (mode === "pack") {
      downloadUrl =
        `/api/tender-pack?format=merged` +
        `&planId=${encodeURIComponent(planId)}` +
        `&level=enterprise` +
        `&theme=tender` +
        `&variant=tender` +
        `&downloadToken=${encodeURIComponent(downloadToken)}`;
    } else {
      downloadUrl =
        `/api/pdf?download=1` +
        `&planId=${encodeURIComponent(planId)}` +
        `&mode=${encodeURIComponent(mode)}` +
        `&variant=${encodeURIComponent(variant)}` +
        `&downloadToken=${encodeURIComponent(downloadToken)}`;
    }

    return json(200, {
      ok: true,
      verified: true,
      code: "LEAD_CAPTURED_AND_TOKEN_ISSUED",
      message: "lead captured and token issued",
      planId,
      intent,
      mode,
      variant,
      email,
      downloadToken,
      downloadUrl,
      unlockToken,
      expiresInSec: Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || "1800"),
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
