import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEV_MODE = (process.env.DEV_DOWNLOAD_TOKEN || "").trim() === "1";

function json(status: number, code: string, message: string, extra?: any) {
  return NextResponse.json(
    { ok: false, code, message, ...(extra ? { extra } : {}) },
    { status }
  );
}

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

type Mode = "full" | "preview" | "budget" | "pack";

function parseMode(x: string | null): Mode {
  const modeRaw = String(x || "full").trim().toLowerCase();
  if (
    modeRaw === "full" ||
    modeRaw === "preview" ||
    modeRaw === "budget" ||
    modeRaw === "pack"
  ) {
    return modeRaw;
  }
  return "full";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const planId = (searchParams.get("planId") || "").trim();
    if (!planId) return json(400, "MISSING_PLAN_ID", "缺少 planId");

    const mode = parseMode(searchParams.get("mode"));

    const levelRaw = String(searchParams.get("level") || "pro")
      .trim()
      .toLowerCase();
    const level: "free" | "pro" = levelRaw === "free" ? "free" : "pro";

    if (DEV_MODE) {
      return NextResponse.json({
        ok: true,
        downloadToken: "DEV_MODE_TOKEN",
        planId,
        mode,
        level,
      });
    }

    const secret = (process.env.DOWNLOAD_TOKEN_SECRET || "").trim();
    if (!secret) {
      return json(500, "TOKEN_SECRET_MISSING", "未配置 DOWNLOAD_TOKEN_SECRET");
    }

    const ttlSecRaw = Number(
      process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || "1800"
    );
    const ttlSec =
      Number.isFinite(ttlSecRaw) && ttlSecRaw > 0
        ? Math.floor(ttlSecRaw)
        : 1800;

    const key = new TextEncoder().encode(secret);
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttlSec;

    const payload = {
      scope: "pdf_download",
      planId,
      mode,
      level,
    };

    const downloadToken = await new SignJWT({
      ...payload,
      iat: now,
      exp,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(key);

    const tokenHash = sha256Hex(downloadToken);

    const maxUsesRaw = Number(process.env.DOWNLOAD_TOKEN_MAX_USES || "1");
    const maxUses =
      Number.isFinite(maxUsesRaw) && maxUsesRaw > 0
        ? Math.floor(maxUsesRaw)
        : 1;

    const expAt = new Date(exp * 1000);

    await prisma.pdfDownloadTokenState.upsert({
      where: { tokenHash },
      update: {
        planId,
        mode,
        expAt,
        maxUses,
        revoked: false,
      },
      create: {
        tokenHash,
        planId,
        mode,
        expAt,
        maxUses,
        usedCount: 0,
        revoked: false,
      },
    });

    return NextResponse.json({
      ok: true,
      downloadToken,
      planId,
      mode,
      level,
      expiresIn: ttlSec,
      maxUses,
    });
  } catch (e: any) {
    return json(500, "INTERNAL_ERROR", e?.message || "Internal Error");
  }
}