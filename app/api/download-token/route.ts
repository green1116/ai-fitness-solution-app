// app/api/download-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

// ✅ mode 支持 budget
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

  // 先试 raw 直接就是 tokenHash
  const direct = await findByTokenHash(raw);
  if (direct && direct.expiresAt.getTime() > Date.now()) return direct.email;

  // 候选 secret
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

function nowMs() {
  return Date.now();
}
function isExpired(expiresAt: Date | null) {
  return !!expiresAt && expiresAt.getTime() <= nowMs();
}

/**
 * ✅ 仅当显式传 licenseKey 或启用强制付费开关时，才做权益校验/扣次。
 * - 默认：登录即可签发 downloadToken（不受 license 次数影响）
 * - 可通过环境变量强制：REQUIRE_ENTITLEMENT_FOR_DOWNLOAD_TOKEN=1
 */
const REQUIRE_ENTITLEMENT =
  (process.env.REQUIRE_ENTITLEMENT_FOR_DOWNLOAD_TOKEN || "").trim() === "1";

// 用于把“明文 licenseKey”变为库里的 keyHash（与你 new-license / pdf route 一致）
function licenseKeyToHash(licenseKeyPlain: string) {
  const pepper =
    (process.env.LICENSE_KEY_SECRET || "").trim() ||
    (process.env.DOWNLOAD_TOKEN_SECRET || "").trim() ||
    "";
  return sha256Hex(`license:${licenseKeyPlain}:${pepper}`);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const planId = (searchParams.get("planId") || "").trim();
    if (!planId) return json(400, "MISSING_PLAN_ID", "缺少 planId");

    const mode = parseMode(searchParams.get("mode"));

    // ✅ 门禁：必须已登录
    const email = await getEmailFromSessionCookie(req);
    if (!email) return json(401, "LOGIN_REQUIRED", "请先登录/完成验证码验证后再下载");

    // ✅ DOWNLOAD_TOKEN_SECRET 必须存在
    const secret = (process.env.DOWNLOAD_TOKEN_SECRET || "").trim();
    if (!secret)
      return json(
        500,
        "TOKEN_SECRET_MISSING",
        "服务端未配置 DOWNLOAD_TOKEN_SECRET，拒绝签发下载凭证"
      );

    // ✅ TTL
    const ttlSecRaw = Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || "1800");
    const ttlSec = Number.isFinite(ttlSecRaw) && ttlSecRaw > 0 ? ttlSecRaw : 1800;

    // ====== 可选：权益校验（只有两种情况会触发）======
    // 1) 显式传 licenseKey（例如你想在“发放 license 的下载链接”里直接走 token）
    // 2) 环境变量强制要求付费/权益才能签发 token
    const licenseKeyPlain = (searchParams.get("licenseKey") || "").trim() || null;

    let licenseId: string | null = null;
    let licenseForReturn: any = null;

    if (licenseKeyPlain || REQUIRE_ENTITLEMENT) {
      const result = await prisma.$transaction(async (tx) => {
        // 1) 已支付订单 -> 对应 license（按你原逻辑 note=order:xxx）
        const paidOrder = await tx.order.findFirst({
          where: { planId, email, status: "PAID" },
          orderBy: { updatedAt: "desc" },
          select: { id: true },
        });

        let license:
          | {
              id: string;
              planId: string | null;
              maxDownloads: number;
              usedCount: number;
              expiresAt: Date | null;
              requireLogin: boolean;
              note: string | null;
            }
          | null = null;

        if (paidOrder) {
          const note = `order:${paidOrder.id}`;
          license = await tx.licenseKey.findFirst({
            where: { note },
            select: {
              id: true,
              planId: true,
              maxDownloads: true,
              usedCount: true,
              expiresAt: true,
              requireLogin: true,
              note: true,
            },
          });
        }

        // 2) 兜底：明文 licenseKey
        if (!license && licenseKeyPlain) {
          const keyHash = licenseKeyToHash(licenseKeyPlain);
          license = await tx.licenseKey.findUnique({
            where: { keyHash },
            select: {
              id: true,
              planId: true,
              maxDownloads: true,
              usedCount: true,
              expiresAt: true,
              requireLogin: true,
              note: true,
            },
          });
        }

        // 如果强制权益，但找不到 license => 402
        if (!license) {
          return {
            ok: false as const,
            status: 402,
            code: "PAYMENT_REQUIRED",
            message: "未检测到已支付订单或有效 LicenseKey",
          };
        }

        if (license.planId && license.planId !== planId) {
          return {
            ok: false as const,
            status: 403,
            code: "LICENSE_PLAN_MISMATCH",
            message: "License 不匹配该方案",
          };
        }

        if (isExpired(license.expiresAt)) {
          return {
            ok: false as const,
            status: 403,
            code: "LICENSE_EXPIRED",
            message: "License 已过期",
          };
        }

        if (license.maxDownloads > 0 && license.usedCount >= license.maxDownloads) {
          return {
            ok: false as const,
            status: 403,
            code: "LICENSE_EXHAUSTED",
            message: "下载次数已用完",
          };
        }

        // ✅ 重要改动：download-token 不再“按 mode 扣次”
        // 只做校验，不做 consume/扣次数。
        // 次数扣减应由 /api/pdf 在真正输出 PDF 前完成（你已经做了 licenseKey 的限次）。
        return { ok: true as const, license };
      });

      if (!result.ok) {
        return json(result.status, result.code, result.message);
      }

      licenseId = result.license?.id ?? null;
      licenseForReturn = result.license ?? null;
    }

    // ====== 签发 downloadToken ======
    const key = new TextEncoder().encode(secret);
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttlSec;

    const downloadToken = await new SignJWT({
      scope: "pdf_download",
      planId,
      mode,
      email,
      licenseId, // 可选：带上，便于你后续审计/统计（不用于扣次）
      iat: now,
      exp,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(key);

    return NextResponse.json({
      ok: true,
      downloadToken,
      // 可选返回：仅当本次做过权益校验时才返回 license
      ...(licenseForReturn ? { license: licenseForReturn } : {}),
    });
  } catch (e: any) {
    console.error("[/api/download-token] ERROR:", e);
    return json(500, "INTERNAL_ERROR", e?.message || "Internal Server Error", {
      name: e?.name,
      code: e?.code,
      meta: e?.meta,
      stack: e?.stack,
    });
  }
}
