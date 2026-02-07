// app/api/download-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, code: string, message: string, extra?: any) {
  return NextResponse.json({ ok: false, code, message, ...(extra ? { extra } : {}) }, { status });
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

// ✅ mode 支持 budget（否则你永远签发 full，会影响后面做“预算单独限额”）
type Mode = "full" | "preview" | "budget";
function parseMode(x: string | null): Mode {
  if (x === "preview" || x === "full" || x === "budget") return x;
  return "full";
}

async function getEmailFromSessionCookie(req: NextRequest): Promise<string | null> {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  const raw = m?.[1] ? decodeURIComponent(m[1]) : null;
  if (!raw) return null;

  // 先试“raw 直接就是 tokenHash”的情况
  const direct = await findByTokenHash(raw);
  if (direct && direct.expiresAt.getTime() > Date.now()) return direct.email;

  // 收集候选 secret
  const secrets: Array<{ name: string; value: string }> = [];
  const pushSecret = (name: string) => {
    const v = (process.env[name] || "").trim();
    if (v) secrets.push({ name, value: v });
  };
  pushSecret("SESSION_TOKEN_SECRET");
  pushSecret("SESSION_SECRET");
  pushSecret("AUTH_SECRET");
  pushSecret("DOWNLOAD_TOKEN_SECRET");

  // 逐个算法尝试命中
  for (const s of secrets) {
    const candidates = [
      { label: "sha256(raw:secret)", tokenHash: sha256Hex(`${raw}:${s.value}`) },
      { label: "sha256(secret:raw)", tokenHash: sha256Hex(`${s.value}:${raw}`) },
      { label: "hmacSha256(secret, raw)", tokenHash: hmacSha256Hex(s.value, raw) },
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

    // ✅ 门禁：必须已登录（否则 401）
    const email = await getEmailFromSessionCookie(req);
    if (!email) return json(401, "LOGIN_REQUIRED", "请先登录/完成验证码验证后再下载");

    // ✅ DOWNLOAD_TOKEN_SECRET 必须存在（用于签发 downloadToken）
    const secret = (process.env.DOWNLOAD_TOKEN_SECRET || "").trim();
    if (!secret) return json(500, "TOKEN_SECRET_MISSING", "服务端未配置 DOWNLOAD_TOKEN_SECRET，拒绝签发下载凭证");

    // ✅ TTL
    const ttlSecRaw = Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || "1800");
    const ttlSec = Number.isFinite(ttlSecRaw) && ttlSecRaw > 0 ? ttlSecRaw : 1800;

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

    return NextResponse.json({ ok: true, downloadToken });
  } catch (e: any) {
    console.error("[/api/download-token] ERROR:", e);
    return json(500, "INTERNAL_ERROR", e?.message || "Internal Server Error", {
      name: e?.name,
      stack: e?.stack,
    });
  }
}
