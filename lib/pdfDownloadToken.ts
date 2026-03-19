// DEPRECATED: use "@/lib/download-token" only
// lib/pdfDownloadToken.ts
import crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { logPdfDownloadSafe } from "@/lib/audit/pdfLog";

const SECRET = process.env.DOWNLOAD_TOKEN_SECRET || "";
if (!SECRET) throw new Error("Missing env DOWNLOAD_TOKEN_SECRET");

const DEFAULT_TTL = Number(process.env.DOWNLOAD_TOKEN_TTL_SECONDS || "1800");
const DEFAULT_MAX_USES = Number(process.env.DOWNLOAD_TOKEN_MAX_USES || "1");

export type GateFailCode =
  | "MISSING_TOKEN"
  | "TOKEN_DENIED"
  | "TOKEN_NOT_FOUND"
  | "TOKEN_REVOKED"
  | "TOKEN_EXPIRED"
  | "TOKEN_EXHAUSTED"
  | "PLAN_MISMATCH"
  | "INTERNAL_ERROR";

function hashToken(raw: string) {
  return crypto.createHmac("sha256", SECRET).update(raw).digest("hex");
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function getClientIp(headers: Headers): string | undefined {
  const xf = headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim();
  return headers.get("x-real-ip") || undefined;
}

export async function logPdfDownload(params: {
  planId: string;
  mode?: string | null;
  ok: boolean;
  reason?: string | null;
  error?: string | null;
  ip?: string;
  userAgent?: string;
  tokenId?: string | null;
  code?: string | null;
}) {
  await logPdfDownloadSafe({
    planId: params.planId,
    mode: params.mode ?? null,
    ok: params.ok,
    ip: params.ip ?? null,
    ua: params.userAgent ?? null,
    reason: params.reason ?? null,
    extra: {
      tokenId: params.tokenId ?? null,
      denyCode: params.code ?? params.reason ?? null,
      ...(params.error != null ? { error: params.error } : {}),
    },
  });
}

export async function issuePdfDownloadToken(params: {
  planId: string;
  mode?: string | null; // 可选：basic/full 等
  ttlSeconds?: number;
  maxUses?: number;
}) {
  const raw = randomToken(32);
  const tokenHash = hashToken(raw);

  const ttl = Number.isFinite(params.ttlSeconds) ? Number(params.ttlSeconds) : DEFAULT_TTL;
  const maxUses = Number.isFinite(params.maxUses) ? Number(params.maxUses) : DEFAULT_MAX_USES;

  const expAt = new Date(Date.now() + Math.max(60, ttl) * 1000);

  await prisma.pdfDownloadTokenState.create({
    data: {
      tokenHash,
      planId: params.planId,
      mode: params.mode ?? null,
      expAt,
      maxUses: Math.max(1, maxUses),
      usedCount: 0,
      revoked: false,
    },
  });

  return { downloadToken: raw, expAt, maxUses };
}

export async function revokePdfDownloadToken(params: {
  rawToken: string;
  reason?: string;
  planId?: string;
}) {
  const tokenHash = hashToken(params.rawToken);

  // deny 记录（你库里已有 PdfDownloadTokenDeny）
  await prisma.pdfDownloadTokenDeny.upsert({
    where: { tokenHash },
    update: { reason: params.reason ?? "revoked", planId: params.planId ?? undefined },
    create: { tokenHash, reason: params.reason ?? "revoked", planId: params.planId ?? undefined },
  });

  // 同时把 state 标成 revoked（如果存在）
  await prisma.pdfDownloadTokenState.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });

  return { ok: true as const };
}

type GateOk = { ok: true; mode?: "basic" | "full" };
type GateFail = { ok: false; code: "MISSING_TOKEN" | "TOKEN_INVALID" | "TOKEN_EXPIRED" | "TOKEN_NOT_FOUND" | "TOKEN_EXHAUSTED" };

export async function verifyAndConsumePdfToken(opts: {
  planId: string;
  rawToken: string | null;
  ip?: string;
  userAgent?: string;
}): Promise<GateOk | GateFail> {
  const { planId, rawToken } = opts;

  if (!rawToken) {
    await safeLog(planId, false, "MISSING_TOKEN", opts);
    return { ok: false, code: "MISSING_TOKEN" };
  }

  // ✅ 1) 优先按 JWT 验证（与你的 createDownloadToken 对齐）
  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret) {
    await safeLog(planId, false, "TOKEN_INVALID", opts);
    return { ok: false, code: "TOKEN_INVALID" };
  }

  try {
    const payload = jwt.verify(rawToken, secret) as any;

    // payload 里必须有 planId 且匹配
    if (!payload?.planId || payload.planId !== planId) {
      await safeLog(planId, false, "TOKEN_INVALID", opts);
      return { ok: false, code: "TOKEN_INVALID" };
    }

    // 可选：如果你想用 payload.mode
    const mode = (payload?.mode as "basic" | "full" | undefined) ?? "basic";

    // ✅ 2)（可选）实现"次数限制/消费"：用 JWT 的 jti 做幂等消费
    // 如果你目前没有下载次数限制，可以先跳过这一段，直接放行。
    //
    // 需要 createDownloadToken 签发时带 jti（JWT 标准字段），或你自己加一个 tokenId。
    const tokenId = payload?.jti;
    if (tokenId) {
      // 这里假设你有一张表记录消费，名字你按实际表改：
      // model PdfTokenConsume { id String @id ... tokenId String @unique planId String createdAt DateTime }
      // 没有这个表就先注释掉这段
      try {
        const existed = await (prisma as any).pdfTokenConsume?.findUnique?.({ where: { tokenId } });
        if (existed) {
          await safeLog(planId, false, "TOKEN_EXHAUSTED", opts);
          return { ok: false, code: "TOKEN_EXHAUSTED" };
        }
        await (prisma as any).pdfTokenConsume?.create?.({ data: { tokenId, planId } });
      } catch (e) {
        // 如果表不存在，忽略错误继续执行
      }
    }

    await safeLog(planId, true, "FULL_OK", opts);
    return { ok: true, mode };
  } catch (e: any) {
    const msg = String(e?.message || "");
    const code: GateFail["code"] =
      msg.includes("jwt expired") ? "TOKEN_EXPIRED" : "TOKEN_INVALID";
    await safeLog(planId, false, code, opts);
    return { ok: false, code };
  }
}

// 你项目里已有 logPdfDownload 就用它；这里写一个安全包装避免递归报错
async function safeLog(planId: string, ok: boolean, reason: string, opts: any) {
  try {
    // 如果你已有 logPdfDownload 就替换下面这行
    await logPdfDownload({ planId, ok, reason, ip: opts.ip, userAgent: opts.userAgent });
  } catch {}
}

