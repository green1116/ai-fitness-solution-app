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

function nowMs() {
  return Date.now();
}

function isExpired(expiresAt: Date | null) {
  return !!expiresAt && expiresAt.getTime() <= nowMs();
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
    if (!secret) return json(500, "TOKEN_SECRET_MISSING", "服务端未配置 DOWNLOAD_TOKEN_SECRET，拒绝签发下载凭证");

    // ✅ TTL
    const ttlSecRaw = Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || "1800");
    const ttlSec = Number.isFinite(ttlSecRaw) && ttlSecRaw > 0 ? ttlSecRaw : 1800;

    // ========= 关键：权益校验（PAID 或 licenseKey） =========
    const licenseKeyPlain = (searchParams.get("licenseKey") || "").trim() || null;

    const result = await prisma.$transaction(async (tx) => {
      // 1) 优先：用“已支付订单”找到 license
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

      // 2) 兜底：允许传明文 licenseKey（用于支付成功页展示/人工发放）
      if (!license && licenseKeyPlain) {
        const keyHash = sha256Hex(licenseKeyPlain);
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

      if (!license) {
        return { ok: false as const, status: 402, code: "PAYMENT_REQUIRED", message: "未检测到已支付订单或有效 LicenseKey" };
      }

      // planId 限制：license.planId 为空表示通用 license；不为空则必须匹配
      if (license.planId && license.planId !== planId) {
        return { ok: false as const, status: 403, code: "LICENSE_PLAN_MISMATCH", message: "License 不匹配该方案" };
      }

      if (isExpired(license.expiresAt)) {
        return { ok: false as const, status: 403, code: "LICENSE_EXPIRED", message: "License 已过期" };
      }

      if (license.maxDownloads > 0 && license.usedCount >= license.maxDownloads) {
        return { ok: false as const, status: 403, code: "LICENSE_EXHAUSTED", message: "下载次数已用完" };
      }

      // ========= 扣减次数（幂等）=========
      // 两份 PDF：按 mode 单独扣一次，所以 fingerprint 包含 mode
      const fingerprint = sha256Hex(`${planId}|${email}|${mode}`);

      let consumedNew = false;
      try {
        await tx.licenseConsume.create({
          data: { licenseId: license.id, planId, fingerprint },
          select: { id: true },
        });
        consumedNew = true;
      } catch (e: any) {
        // P2002 = unique constraint hit -> 幂等命中：不重复扣
        if (e?.code !== "P2002") throw e;
      }

      if (consumedNew) {
        // 仅在“首次消费”时扣次数
        // maxDownloads=0 表示不限制（你 schema 默认 0），此处也不扣
        if (license.maxDownloads > 0) {
          const upd = await tx.licenseKey.updateMany({
            where: {
              id: license.id,
              usedCount: { lt: license.maxDownloads },
              ...(license.expiresAt ? { expiresAt: { gt: new Date() } } : {}),
            },
            data: { usedCount: { increment: 1 } },
          });

          if (upd.count === 0) {
            return { ok: false as const, status: 403, code: "LICENSE_EXHAUSTED", message: "下载次数已用完" };
          }

          // 重新读一次最新 usedCount（可选，但便于前端展示）
          license = await tx.licenseKey.findUnique({
            where: { id: license.id },
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
      }

      return { ok: true as const, license };
    });

    if (!result.ok) {
      return json(result.status, result.code, result.message);
    }

    // ========= 签发 downloadToken =========
    const key = new TextEncoder().encode(secret);
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttlSec;

    const downloadToken = await new SignJWT({
      scope: "pdf_download",
      planId,
      mode,
      email,
      licenseId: result.license?.id ?? null,
      iat: now,
      exp,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(key);

    return NextResponse.json({
      ok: true,
      downloadToken,
      // 给前端可选展示：剩余次数（如果 maxDownloads=0 表示不限）
      license: result.license,
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
