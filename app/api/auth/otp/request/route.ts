import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function getResendClient() {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) return null;
  return new Resend(resendKey);
}

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const planId = String(body?.planId || "").trim();
    const code = genCode();

    if (!email) {
      return json(400, {
        ok: false,
        code: "EMAIL_REQUIRED",
        message: "Missing email",
      });
    }

    const resend = getResendClient();
    if (!resend) {
      return json(500, {
        ok: false,
        code: "RESEND_API_KEY_MISSING",
        message: "RESEND_API_KEY is not configured",
      });
    }

    const from = process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";

    const result = await resend.emails.send({
      from,
      to: email,
      subject: "Your OTP code",
      html: `
        <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
          <p>Your OTP code is:</p>
          <p style="font-size:24px;font-weight:700;letter-spacing:2px;">${code}</p>
          ${planId ? `<p>Plan ID: ${planId}</p>` : ""}
          <p>This code will expire soon.</p>
        </div>
      `,
    });

    return json(200, {
      ok: true,
      email,
      planId,
      code,
      id: result.data?.id || null,
    });
  } catch (e: any) {
    return json(500, {
      ok: false,
      code: "OTP_REQUEST_FAILED",
      message: e?.message || "Failed to request OTP",
    });
  }
}