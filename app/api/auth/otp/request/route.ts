import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { fail, ok, requestIdFromHeaders } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { getIp } from "@/lib/http";
import { safeLog } from "@/lib/log";

function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(email: string) {
  const code = genCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.emailOtp.upsert({
    where: { email },
    update: {
      code,
      expiresAt,
    },
    create: {
      email,
      code,
      expiresAt,
    },
  });

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!resendKey || !from) {
    throw new Error("邮件服务未配置：缺少 RESEND_API_KEY / EMAIL_FROM");
  }

  const resend = new Resend(resendKey);
  await resend.emails.send({
    from,
    to: email,
    subject: "您的验证码",
    text: `验证码：${code}\n10分钟内有效。若非本人操作请忽略。`,
  });
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
  const planId = String(body?.planId || "").trim();

  if (!email || !email.includes("@")) {
    return fail("BAD_REQUEST", "Email invalid", 400, requestId);
  }

  const rl = rateLimit(`otp:req:${ip}:${email}`, 1, 60_000);
  if (!rl.ok) {
    safeLog("otp_request_rate_limited", { requestId, email, ip, planId });
    return fail(
      "RATE_LIMITED",
      `Too many requests. Retry after ${rl.retryAfterSec}s`,
      429,
      requestId,
      { retryAfterSec: rl.retryAfterSec }
    );
  }

  try {
    await sendOtp(email);
    safeLog("otp_request_ok", { requestId, email, ip, planId });
    return ok({ requestId });
  } catch (e: any) {
    safeLog("otp_request_error", { requestId, email, ip, planId, err: e?.message });
    return fail("INTERNAL_ERROR", "Failed to send OTP", 500, requestId);
  }
}