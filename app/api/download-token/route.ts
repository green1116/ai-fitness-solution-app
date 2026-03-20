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
  if (x === "preview" || x === "full" || x === "budget" || x === "pack") return x;
  return "full";
}

async function upsertTokenState(opts: {
  downloadToken: string;
  planId: string;
  mode: Mode;
  expAt: Date;
  maxUses: number;
}) {
  const tokenHash = sha256Hex(opts.downloadToken);

  return prisma.pdfDownloadTokenState.upsert({
    where: { tokenHash },
    update: {
      planId: opts.planId,
      mode: opts.mode,
      expAt: opts.expAt,
      maxUses: opts.maxUses,
      revoked: false,
    },
    create: {
      tokenHash,
      planId: opts.planId,
      mode: opts.mode,
      expAt: opts.expAt,
      maxUses: opts.maxUses,
      usedCount: 0,
      revoked: false,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const planId = (searchParams.get("planId") || "").trim();
    if (!planId) return json(400, "MISSING_PLAN_ID", "缺少 planId");

    const mode = parseMode(searchParams.get("mode"));

    // ---------------- DEV ----------------
    if (DEV_MODE) {
      return NextResponse.json({
        ok: true,
        downloadToken: "DEV_MODE_TOKEN",
        planId,
        mode,
      });
    }

    // ---------------- PROD ----------------
    const secret = (process.env.DOWNLOAD_TOKEN_SECRET || "").trim();
    if (!secret)
      return json(500, "TOKEN_SECRET_MISSING", "未配置 DOWNLOAD_TOKEN_SECRET");

    const ttlSec = 1800; // 30分钟

    const key = new TextEncoder().encode(secret);
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttlSec;

    const downloadToken = await new SignJWT({
      scope: "pdf_download",
      planId,
      mode,
      iat: now,
      exp,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(key);

    // ✅ 关键：落库 tokenState（用于扣次/撤销/过期控制）
    const tokenHash = sha256Hex(downloadToken);

    // 默认 maxUses=1（或可配置）：按环境变量优先，没配就 1
    const maxUsesRaw = Number(process.env.DOWNLOAD_TOKEN_MAX_USES || "1");
    const maxUses =
      Number.isFinite(maxUsesRaw) && maxUsesRaw > 0 ? Math.floor(maxUsesRaw) : 1;

    // expAt：用 JWT exp 秒转 Date
    const expAt = new Date(exp * 1000);

    // upsert：重复签发同 token（几乎不会）也不怕
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
    });
  } catch (e: any) {
    return json(500, "INTERNAL_ERROR", e?.message || "Internal Error");
  }
}