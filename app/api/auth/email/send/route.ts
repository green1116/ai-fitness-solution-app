import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function j(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function sendWithRetry(
  resend: Resend,
  payload: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text: string;
  }
) {
  let lastResp: any = null;
  let lastErr: any = null;

  for (let i = 0; i < 2; i++) {
    try {
      const resp = await resend.emails.send(payload);

      if (!(resp as any)?.error) {
        if (i > 0) {
          console.log("[EMAIL_SEND] retry success on attempt", i + 1);
        }
        return resp;
      }

      lastResp = resp;
      console.error(
        "[EMAIL_SEND] resend error attempt",
        i + 1,
        "=",
        (resp as any).error
      );

      if (i === 0) {
        await sleep(1200);
        continue;
      }

      return resp;
    } catch (err) {
      lastErr = err;
      console.error("[EMAIL_SEND] exception attempt", i + 1, "=", err);

      if (i === 0) {
        await sleep(1200);
        continue;
      }

      throw err;
    }
  }

  if (lastErr) throw lastErr;
  return lastResp;
}

function getDomainFromEmail(email: string) {
  const parts = String(email || "").trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

function isBlockedSenderDomain(domain: string) {
  const blocked = new Set([
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "qq.com",
    "163.com",
    "126.com",
    "sina.com",
    "yahoo.com",
    "icloud.com",
  ]);
  return blocked.has(domain);
}

function isValidMode(mode: string) {
  return ["full", "budget", "pack"].includes(mode);
}

function isValidPlanLevel(
  v: string
): v is "free" | "pro" | "enterprise" {
  return v === "free" || v === "pro" || v === "enterprise";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const mode = String(body?.mode || "full").trim().toLowerCase();
    const planId = String(body?.planId || "").trim();
    const planLevelRaw = String(body?.planLevel || "pro").trim().toLowerCase();
    const planLevel = isValidPlanLevel(planLevelRaw)
      ? planLevelRaw
      : "pro";

    console.log(
      "[EMAIL_SEND] request email =",
      email || "(empty)",
      "mode =",
      mode,
      "planId =",
      planId || "(empty)",
      "planLevel =",
      planLevel
    );

    if (!email) {
      return j(400, {
        ok: false,
        code: "EMAIL_REQUIRED",
        message: "email is required",
      });
    }

    if (!isValidEmail(email)) {
      return j(400, {
        ok: false,
        code: "EMAIL_INVALID",
        message: "invalid email format",
      });
    }

    if (!planId) {
      return j(400, {
        ok: false,
        code: "PLAN_ID_REQUIRED",
        message: "planId is required",
      });
    }

    if (!isValidMode(mode)) {
      return j(400, {
        ok: false,
        code: "MODE_INVALID",
        message: "mode must be one of: full, budget, pack",
      });
    }

    const apiKey = process.env.RESEND_API_KEY?.trim() || "";
    const from = process.env.EMAIL_FROM?.trim() || "";
    const fromDomain = getDomainFromEmail(from);

    console.log("[EMAIL_SEND] env check", {
      RESEND_API_KEY: !!apiKey,
      EMAIL_FROM: !!from,
      EMAIL_FROM_VALUE: from || "(empty)",
    });

    if (!apiKey || !from) {
      return j(500, {
        ok: false,
        code: "RESEND_NOT_CONFIGURED",
        message: "Please set RESEND_API_KEY and EMAIL_FROM in .env.local",
      });
    }

    if (!isValidEmail(from)) {
      return j(500, {
        ok: false,
        code: "EMAIL_FROM_INVALID",
        message: "EMAIL_FROM is invalid",
      });
    }

    if (isBlockedSenderDomain(fromDomain) && from !== "onboarding@resend.dev") {
      return j(500, {
        ok: false,
        code: "EMAIL_FROM_DOMAIN_NOT_ALLOWED",
        message:
          "EMAIL_FROM cannot use public mailbox domains like outlook.com/gmail.com. Please use onboarding@resend.dev for testing, or a sender address under your verified domain.",
      });
    }

    const resend = new Resend(apiKey);

    const code = makeCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailVerifyCode.deleteMany({
      where: {
        email,
        mode,
        planId,
        planLevel,
        usedAt: null,
      },
    });

    await prisma.emailVerifyCode.create({
      data: {
        email,
        code,
        mode,
        planId,
        planLevel,
        expiresAt,
      },
    });

    const subject = "AI Fitness Solution 邮箱验证码";
    const html = `
      <div style="font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;line-height:1.7;color:#111;">
        <h2 style="margin:0 0 12px;">AI Fitness Solution</h2>
        <p>您好，您的邮箱验证码为：</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:4px;margin:16px 0;">
          ${code}
        </div>
        <p>该验证码 <strong>10 分钟内有效</strong>。</p>
        <p>如非本人操作，请忽略此邮件。</p>
      </div>
    `;
    const text = `您的验证码是：${code}，10分钟内有效。`;

    const resp = await sendWithRetry(resend, {
      from,
      to: email,
      subject,
      html,
      text,
    });

    if ((resp as any)?.error) {
      console.error("[EMAIL_SEND] resend error =", (resp as any).error);
      return j(500, {
        ok: false,
        code: "RESEND_SEND_FAILED",
        message: (resp as any).error?.message || "resend send failed",
      });
    }

    console.log("[EMAIL_SEND] success", {
      email,
      resendId: (resp as any)?.data?.id,
      expiresAt,
    });

    return j(200, {
      ok: true,
      code: "EMAIL_CODE_SENT",
      message: "verification code sent",
      email,
      expiresInSec: 600,
    });
  } catch (err: any) {
    console.error("[EMAIL_SEND] FATAL", err);
    console.error("[EMAIL_SEND] message =", err?.message);
    console.error("[EMAIL_SEND] stack =", err?.stack);

    return j(500, {
      ok: false,
      code: "EMAIL_SEND_FATAL",
      message: err?.message || "internal error",
    });
  }
}