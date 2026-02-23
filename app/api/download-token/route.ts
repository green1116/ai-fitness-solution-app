// app/api/download-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 🔥 开发模式自动绕过数据库校验
 * 生产环境仍走完整逻辑
 */
const DEV_MODE = process.env.NODE_ENV !== "production";

function json(status: number, code: string, message: string, extra?: any) {
  return NextResponse.json(
    { ok: false, code, message, ...(extra ? { extra } : {}) },
    { status }
  );
}

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function hmacSha256Hex(secret: string, s: string) {
  return crypto.createHmac("sha256", secret).update(s).digest("hex");
}

async function findByTokenHash(tokenHash: string) {
  return prisma.session.findUnique({
    where: { tokenHash },
    select: { email: true, expiresAt: true },
  });
}

type Mode = "full" | "preview" | "budget";
function parseMode(x: string | null): Mode {
  if (x === "preview" || x === "full" || x === "budget") return x;
  return "full";
}

async function getEmailFromSessionCookie(
  req: NextRequest
): Promise<string | null> {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  const raw = m?.[1] ? decodeURIComponent(m[1]) : null;
  if (!raw) return null;

  const direct = await findByTokenHash(raw);
  if (direct && direct.expiresAt.getTime() > Date.now())
    return direct.email;

  const secrets: Array<{ name: string; value: string }> = [];
  const pushSecret = (name: string) => {
    const v = (process.env[name] || "").trim();
    if (v) secrets.push({ name, value: v });
  };

  pushSecret("SESSION_TOKEN_SECRET");
  pushSecret("SESSION_SECRET");
  pushSecret("AUTH_SECRET");
  pushSecret("DOWNLOAD_TOKEN_SECRET");

  for (const s of secrets) {
    const candidates = [
      { tokenHash: sha256Hex(`${raw}:${s.value}`) },
      { tokenHash: sha256Hex(`${s.value}:${raw}`) },
      { tokenHash: hmacSha256Hex(s.value, raw) },
    ];

    for (const c of candidates) {
      const row = await findByTokenHash(c.tokenHash);
      if (row) {
        if (row.expiresAt.getTime() <= Date.now()) return null;
        return row.email;
      }
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const planId = (searchParams.get("planId") || "").trim();
    if (!planId) return json(400, "MISSING_PLAN_ID", "缺少 planId");

    const mode = parseMode(searchParams.get("mode"));

    /**
     * 🟢 开发环境：直接签发 DEV token
     */
    if (DEV_MODE) {
      return NextResponse.json({
        ok: true,
        downloadToken: "DEV_MODE_TOKEN",
        planId,
        mode,
      });
    }

    /**
     * 🔒 生产环境：完整安全校验
     */
    const email = await getEmailFromSessionCookie(req);
    if (!email)
      return json(401, "LOGIN_REQUIRED", "请先登录后再下载");

    const secret = (process.env.DOWNLOAD_TOKEN_SECRET || "").trim();
    if (!secret)
      return json(
        500,
        "TOKEN_SECRET_MISSING",
        "服务端未配置 DOWNLOAD_TOKEN_SECRET"
      );

    const ttlSecRaw = Number(
      process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || "1800"
    );
    const ttlSec =
      Number.isFinite(ttlSecRaw) && ttlSecRaw > 0
        ? ttlSecRaw
        : 1800;

    const key = new TextEncoder().encode(secret);
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttlSec;

    const downloadToken = await new SignJWT({
      scope: "pdf_download",
      planId,
      mode,
      email,
      iat: now,
      exp,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(key);

    return NextResponse.json({
      ok: true,
      downloadToken,
    });
  } catch (e: any) {
    console.error("[/api/download-token] ERROR:", e);
    return json(500, "INTERNAL_ERROR", e?.message || "Internal Server Error");
  }
}
