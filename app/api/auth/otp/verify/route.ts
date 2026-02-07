// app/api/auth/otp/verify/route.ts
import { NextRequest } from "next/server";
import crypto from "crypto";
import { issuePdfDownloadToken, getClientIp } from "@/lib/pdfDownloadToken";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/session";
import { fail, ok, requestIdFromHeaders } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { getIp } from "@/lib/http";
import { safeLog } from "@/lib/log";

export const runtime = "nodejs";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function verifyOtp(email: string, code: string): Promise<boolean> {
  // ✅ 验证码校验（与 app/api/auth/email/verify/route.ts 保持一致）
  const row = await (prisma as any).emailOtp.findUnique({
    where: { email },
  });

  if (!row) {
    return false;
  }

  if (new Date(row.expiresAt).getTime() <= Date.now()) {
    // 删除过期验证码
    await (prisma as any).emailOtp.delete({ where: { email } }).catch(() => {});
    return false;
  }

  // 比较 hash（request 路由存储的是 codeHash）
  if (row.codeHash) {
    const codeHash = sha256(code);
    if (row.codeHash !== codeHash) {
      return false;
    }
  } else if (row.code) {
    // 兼容旧数据：如果有 code 字段，直接比较
    if (String(row.code).trim() !== code.trim()) {
      return false;
    }
  } else {
    // 既没有 codeHash 也没有 code，数据异常
    return false;
  }

  // ✅ 一次性验证码：删除
  await (prisma as any).emailOtp.delete({ where: { email } }).catch(() => {});
  return true;
}

export async function POST(req: NextRequest) {
  const requestId = requestIdFromHeaders(req.headers);
  const ip = getIp(req.headers);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail("BAD_REQUEST", "Invalid JSON", 400, requestId);
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const code = String(body?.code || "").trim();
  const planId = String(body?.planId || "").trim();
  const mode = (body?.mode ? String(body.mode) : null) as string | null;

  if (!email || !email.includes("@") || !code) {
    return fail("BAD_REQUEST", "Email/code required", 400, requestId);
  }

  if (!isEmail(email)) {
    return fail("BAD_REQUEST", "Email invalid", 400, requestId);
  }

  if (!planId) {
    return fail("BAD_REQUEST", "planId required", 400, requestId);
  }

  // 限流：10 分钟最多 5 次验证尝试
  const rl = rateLimit(`otp:verify:${ip}:${email}`, 5, 10 * 60_000);
  if (!rl.ok) {
    safeLog("otp_verify_rate_limited", { requestId, email, ip, planId });
    return fail(
      "RATE_LIMITED",
      `Too many attempts. Retry after ${rl.retryAfterSec}s`,
      429,
      requestId,
      { retryAfterSec: rl.retryAfterSec }
    );
  }

  try {
    const okVerify = await verifyOtp(email, code);

    if (!okVerify) {
      safeLog("otp_verify_failed", { requestId, email, ip, planId });
      return fail("FORBIDDEN", "OTP invalid", 403, requestId);
    }

    // ✅ 获取 IP 和 User-Agent（用于日志记录）
    const clientIp = getClientIp(req.headers);
    const userAgent = req.headers.get("user-agent") || undefined;

    // ✅ 验证成功后签发 downloadToken（写入 PdfDownloadTokenState）
    const issued = await issuePdfDownloadToken({
      planId,
      mode: mode ?? "basic",
      // ttlSeconds 可用 env 默认，不传也行
      // maxUses 可用 env 默认，不传也行
    });

    // ✅ 创建 session cookie（用于后续的 session 验证）
    const res = ok({
      requestId,
      downloadToken: issued.downloadToken, // 关键：返回"数据库型 token"（base64url 格式）
      expAt: issued.expAt,
      maxUses: issued.maxUses,
      mode: mode ?? "basic",
    });
    await createSessionCookie(res, email, 30);

    safeLog("otp_verify_ok", { requestId, email, ip, planId });
    return res;
  } catch (e: any) {
    safeLog("otp_verify_error", { requestId, email, ip, planId, err: e?.message });
    return fail("INTERNAL_ERROR", "Verify failed", 500, requestId);
  }
}
