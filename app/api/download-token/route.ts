import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyUnlockToken, type UnlockPlanLevel } from "@/lib/unlock-token";
import {
  issueStatefulDownloadToken,
  signDownloadJwt,
  DOWNLOAD_TOKEN_DEFAULT_TTL_SEC,
  PLAN_LEVEL_FORBIDDEN_MESSAGE,
} from "@/lib/download-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEV_MODE = (process.env.DEV_DOWNLOAD_TOKEN || "").trim() === "1";
const USE_STATEFUL_TOKEN =
  (process.env.DOWNLOAD_TOKEN_STATEFUL || "").trim() === "1";

const ALLOWED_MODES = new Set(["full", "budget", "pack", "preview"]);

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function json(
  status: number,
  body: { ok?: boolean; code: string; message: string; [k: string]: any }
) {
  return NextResponse.json(
    { ok: false, ...body },
    { status, headers: NO_STORE_HEADERS }
  );
}

function jsonOk(body: Record<string, any>) {
  return NextResponse.json({ ok: true, ...body }, { headers: NO_STORE_HEADERS });
}

type Mode = "full" | "preview" | "budget" | "pack";
type Variant = "sales" | "enterprise" | "tender";

function parseMode(x: string | null): Mode | null {
  const modeRaw = String(x || "")
    .trim()
    .toLowerCase();
  if (ALLOWED_MODES.has(modeRaw)) return modeRaw as Mode;
  return null;
}

function parseVariant(x: string | null): Variant {
  const v = String(x || "")
    .trim()
    .toLowerCase();

  if (v === "tender") return "tender";
  if (v === "enterprise") return "enterprise";
  return "sales";
}

async function issueDownloadToken(input: {
  planId: string;
  mode: Mode;
  variant: Variant;
  email?: string;
  ttlSec: number;
  maxUses?: number;
  planLevel: UnlockPlanLevel;
}) {
  if (DEV_MODE) {
    return "DEV_MODE_TOKEN";
  }

  const jti = crypto.randomUUID();
  const maxUses = Math.max(1, Number(input.maxUses ?? 1));

  if (USE_STATEFUL_TOKEN) {
    return await issueStatefulDownloadToken({
      planId: input.planId,
      mode: input.mode,
      variant: input.variant,
      email: input.email,
      ttlSec: input.ttlSec,
      maxUses,
      jti,
      planLevel: input.planLevel,
    });
  }

  return await signDownloadJwt({
    planId: input.planId,
    mode: input.mode,
    variant: input.variant,
    email: input.email,
    ttlSec: input.ttlSec,
    jti,
    maxUses,
    planLevel: input.planLevel,
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const planId = (searchParams.get("planId") || "").trim();
    const modeRaw = parseMode(searchParams.get("mode"));
    const variant = parseVariant(searchParams.get("variant"));
    const unlockToken = (searchParams.get("unlockToken") || "").trim();

    console.log("[download-token] params", {
      planId,
      mode: modeRaw,
      variant,
      hasUnlockToken: !!unlockToken,
      unlockTokenPreview: unlockToken ? `${unlockToken.slice(0, 12)}...` : "",
    });

    if (!planId) {
      console.log("[download-token] reject: missing planId");
      return json(400, { code: "MISSING_PLAN_ID", message: "缺少 planId" });
    }

    if (!modeRaw) {
      console.log("[download-token] reject: invalid mode", {
        raw: searchParams.get("mode"),
      });
      return json(400, {
        code: "INVALID_MODE",
        message: `mode 必须是 ${[...ALLOWED_MODES].join(", ")} 之一`,
      });
    }

    const mode = modeRaw;

    if (mode === "pack" && variant === "sales") {
      console.log("[download-token] reject: pack with sales variant");
      return json(403, {
        code: "PACK_VARIANT_INVALID",
        message: "投标包下载需要 variant=enterprise 或 variant=tender",
      });
    }

    const ttlSecRaw = Number(
      process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS ||
        String(DOWNLOAD_TOKEN_DEFAULT_TTL_SEC)
    );
    const ttlSec =
      Number.isFinite(ttlSecRaw) && ttlSecRaw > 0
        ? Math.max(30, Math.floor(ttlSecRaw))
        : DOWNLOAD_TOKEN_DEFAULT_TTL_SEC;

    if (mode === "preview") {
      const token = await issueDownloadToken({
        planId,
        mode: "preview",
        variant: "sales",
        ttlSec,
        maxUses: 1,
        planLevel: "free",
      });

      console.log("[download-token] issue preview token success", {
        planId,
        mode,
        variant: "sales",
      });

      return jsonOk({
        downloadToken: token,
        token,
        planId,
        mode,
        variant: "sales",
        tokenMode: DEV_MODE
          ? "dev"
          : USE_STATEFUL_TOKEN
          ? "stateful"
          : "stateless",
      });
    }

    if (!unlockToken) {
      console.log("[download-token] reject: missing unlockToken", {
        planId,
        mode,
        variant,
      });
      return json(403, {
        code: "DOWNLOAD_LOCKED",
        message: "需要先完成留资验证才能下载完整版",
      });
    }

    const payload = await verifyUnlockToken(unlockToken);

    console.log("[download-token] unlock payload", {
      ok: !!payload,
      scope: payload?.scope,
      payloadPlanId: payload?.planId,
      payloadMode: payload?.mode,
      payloadPlanLevel: payload?.planLevel,
      payloadEmail: payload?.email || "",
    });

    if (!payload || payload.scope !== "unlock") {
      console.log("[download-token] reject: invalid unlock token", {
        hasPayload: !!payload,
        scope: payload?.scope,
      });
      return json(403, {
        code: "DOWNLOAD_LOCKED",
        message: "解锁凭证无效或已过期",
      });
    }

    if (payload.planId !== planId) {
      console.log("[download-token] reject: planId mismatch", {
        requestPlanId: planId,
        tokenPlanId: payload.planId,
      });
      return json(403, {
        code: "UNLOCK_PLAN_MISMATCH",
        message: "解锁凭证与当前方案不匹配",
      });
    }

    if (payload.mode !== mode) {
      console.log("[download-token] reject: mode mismatch", {
        requestMode: mode,
        tokenMode: payload.mode,
      });
      return json(403, {
        code: "DOWNLOAD_LOCKED",
        message: "解锁权限与请求的下载类型不匹配",
      });
    }

    const unlockPlanLevel = payload.planLevel;
    if (unlockPlanLevel === "free") {
      return json(403, {
        code: "PLAN_LEVEL_FORBIDDEN",
        message: PLAN_LEVEL_FORBIDDEN_MESSAGE,
      });
    }

    const token = await issueDownloadToken({
      planId,
      mode,
      variant,
      email: payload.email,
      ttlSec,
      maxUses: 1,
      planLevel: unlockPlanLevel,
    });

    console.log("[download-token] issue success", {
      planId,
      mode,
      variant,
      email: payload.email || "",
      tokenMode: DEV_MODE
        ? "dev"
        : USE_STATEFUL_TOKEN
        ? "stateful"
        : "stateless",
    });

    return jsonOk({
      downloadToken: token,
      token,
      planId,
      mode,
      variant,
      tokenMode: DEV_MODE
        ? "dev"
        : USE_STATEFUL_TOKEN
        ? "stateful"
        : "stateless",
    });
  } catch (e: any) {
    console.error("[DOWNLOAD_TOKEN_ERROR]", e);

    return json(500, {
      code: "INTERNAL_ERROR",
      message: "下载凭证生成失败，请稍后重试",
    });
  }
}