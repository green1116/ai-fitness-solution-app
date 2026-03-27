import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";
import {
  verifyUnlockToken,
  intentAllowsFull,
  intentAllowsBudget,
  intentAllowsPack,
} from "@/lib/unlock-token";
import { issueStatefulDownloadToken } from "@/lib/download-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEV_MODE = (process.env.DEV_DOWNLOAD_TOKEN || "").trim() === "1";

const ALLOWED_MODES = new Set(["full", "budget", "pack", "preview"]);

function json(status: number, body: { ok?: boolean; code: string; message: string; [k: string]: any }) {
  return NextResponse.json({ ok: false, ...body }, { status });
}

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

type Mode = "full" | "preview" | "budget" | "pack";
type Variant = "sales" | "tender";

function parseMode(x: string | null): Mode | null {
  const modeRaw = String(x || "").trim().toLowerCase();
  if (ALLOWED_MODES.has(modeRaw)) return modeRaw as Mode;
  return null;
}

function parseVariant(x: string | null): Variant {
  return String(x || "").trim().toLowerCase() === "tender" ? "tender" : "sales";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const planId = (searchParams.get("planId") || "").trim();
    if (!planId) return json(400, { code: "MISSING_PLAN_ID", message: "缺少 planId" });

    const modeRaw = parseMode(searchParams.get("mode"));
    if (!modeRaw) {
      return json(400, {
        code: "INVALID_MODE",
        message: `mode 必须是 ${[...ALLOWED_MODES].join(", ")} 之一`,
      });
    }
    const mode = modeRaw;

    const variant = parseVariant(searchParams.get("variant"));

    // V6 判断 4：pack 必须 variant=tender
    if (mode === "pack" && variant !== "tender") {
      return json(403, {
        code: "PACK_REQUIRES_TENDER",
        message: "招标包下载需要 variant=tender",
      });
    }

    // preview：免费，无需验证
    if (mode === "preview") {
      if (DEV_MODE) {
        return NextResponse.json({
          ok: true,
          downloadToken: "DEV_MODE_TOKEN",
          planId,
          mode,
          variant: "sales",
        });
      }

      const token = await issueStatefulDownloadToken({
        planId,
        mode: "preview",
        variant: "sales",
        ttlSec: Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || "1800"),
        maxUses: 1,
      });

      return NextResponse.json({
        ok: true,
        downloadToken: token,
        token,
        planId,
        mode,
        variant: "sales",
      });
    }

    // full / budget / pack：需验证
    const unlockToken = (searchParams.get("unlockToken") || "").trim();
    if (!unlockToken) {
      return json(403, {
        code: "DOWNLOAD_LOCKED",
        message: "需要先完成留资验证才能下载完整版",
      });
    }

    const payload = await verifyUnlockToken(unlockToken);
    if (!payload || payload.scope !== "unlock") {
      return json(403, {
        code: "DOWNLOAD_LOCKED",
        message: "解锁凭证无效或已过期",
      });
    }

    if (payload.planId !== planId) {
      return json(403, {
        code: "UNLOCK_PLAN_MISMATCH",
        message: "解锁凭证与当前方案不匹配",
      });
    }

    // 判断 3：不同资源对应不同权限
    if (mode === "full" && !intentAllowsFull(payload.intent)) {
      return json(403, {
        code: "DOWNLOAD_LOCKED",
        message: "完整方案需要先解锁 Pro 版",
      });
    }
    if (mode === "budget" && !intentAllowsBudget(payload.intent)) {
      return json(403, {
        code: "DOWNLOAD_LOCKED",
        message: "预算版需要先解锁预算",
      });
    }
    if (mode === "pack" && !intentAllowsPack(payload.intent)) {
      return json(403, {
        code: "DOWNLOAD_LOCKED",
        message: "招标包需要先解锁 Tender 版",
      });
    }

    if (DEV_MODE) {
      return NextResponse.json({
        ok: true,
        downloadToken: "DEV_MODE_TOKEN",
        planId,
        mode,
        variant,
      });
    }

    const token = await issueStatefulDownloadToken({
      planId,
      mode,
      variant,
      email: payload.email,
      ttlSec: Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || "1800"),
      maxUses: 1,
    });

    return NextResponse.json({
      ok: true,
      downloadToken: token,
      token,
      planId,
      mode,
      variant,
    });
  } catch (e: any) {
    return json(500, {
      code: "INTERNAL_ERROR",
      message: e?.message || "Internal Error",
    });
  }
}
