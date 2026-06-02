import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeEmail(input: unknown): string {
  return String(input ?? "")
    .trim()
    .toLowerCase();
}

function normalizeText(input: unknown): string | null {
  const v = String(input ?? "").trim();
  return v ? v : null;
}

function normalizePhone(input: unknown): string | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d+]/g, "");
  return cleaned || null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = String(body?.email || "").trim();
    const phone = String(body?.phone || "").trim();
    const company = String(body?.company || "").trim();
    const name = String(body?.name || "").trim();
    const title = String(body?.title || "").trim();
    const planId = String(body?.planId || "").trim();
    const intent = String(body?.intent || "unlock_enterprise").trim();
    const pendingDownloadKind = String(body?.pendingDownloadKind || "").trim();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "INVALID_EMAIL", message: "邮箱不能为空" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        email,
        planId: planId || null,
        intent,
        status: "new",
        score: 0,
        note: null,
        payload: {
          from: "result_page",
          mode: "enterprise",
          pendingDownloadKind,
          company,
          name,
          phone,
          title,
          source: "download",
        },
      },
      select: {
        id: true,
        email: true,
        planId: true,
        intent: true,
        status: true,
        score: true,
        createdAt: true,
        payload: true,
      },
    });

    return NextResponse.json({
      ok: true,
      code: "LEAD_SAVED",
      lead: {
        ...lead,
        company,
        name,
        phone,
        title,
        source: "download",
      },
    });
  } catch (error) {
    console.error("[/api/lead/submit] error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "线索提交失败",
      },
      { status: 500 }
    );
  }
}