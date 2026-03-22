import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function getIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = String(body?.email || "").trim().toLowerCase();
    const planId = String(body?.planId || "").trim();
    const intent = String(body?.intent || "unlock_pro").trim();

    if (!email) {
      return json(400, {
        ok: false,
        code: "MISSING_EMAIL",
        message: "缺少邮箱",
      });
    }

    if (!isValidEmail(email)) {
      return json(400, {
        ok: false,
        code: "INVALID_EMAIL",
        message: "邮箱格式不正确",
      });
    }

    const ip = getIp(req);
    const ua = req.headers.get("user-agent") || null;

    const lead = await prisma.lead.create({
      data: {
        email,
        planId: planId || null,
        intent,
        payload: {
          source: "unlock_pro",
          ip,
          ua,
        },
      },
    });

    return json(200, {
      ok: true,
      id: lead.id,
    });
  } catch (e: any) {
    return json(500, {
      ok: false,
      code: "LEAD_SUBMIT_ERROR",
      message: e?.message || "Internal error",
    });
  }
}