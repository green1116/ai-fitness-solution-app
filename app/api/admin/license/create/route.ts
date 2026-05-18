import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashLicenseKey } from "@/lib/license";

export const runtime = "nodejs";

function mustBeAdmin(req: Request) {
  const expected = process.env.INTERNAL_PACK_SECRET || "";
  const got = req.headers.get("x-admin-key") || "";
  return Boolean(expected) && got === expected;
}

export async function POST(req: Request) {
  if (!mustBeAdmin(req)) {
    return NextResponse.json({ ok: false, error: "管理员鉴权失败" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "请求体必须是 JSON 对象" }, { status: 400 });
  }

  const planId = typeof body.planId === "string" && body.planId.trim() ? body.planId.trim() : null;
  const planLevel =
    typeof body.planLevel === "string" && body.planLevel.trim() ? body.planLevel.trim() : "pro";
  const maxDownloadsRaw = body.maxDownloads ?? 0;
  const maxDownloads = Number(maxDownloadsRaw);
  const requireLogin = Boolean(body.requireLogin ?? false);
  const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;

  if (!Number.isFinite(maxDownloads) || maxDownloads < 0) {
    return NextResponse.json(
      { ok: false, error: "maxDownloads 必须是大于等于 0 的数字" },
      { status: 400 }
    );
  }

  let expiresAt: Date | null = null;
  if (body.expiresAt !== undefined && body.expiresAt !== null && body.expiresAt !== "") {
    const parsed = new Date(String(body.expiresAt));
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ ok: false, error: "expiresAt 不是有效时间" }, { status: 400 });
    }
    expiresAt = parsed;
  }

  try {
    const rawKey = randomUUID();
    const keyHash = hashLicenseKey(rawKey);
    const license = await prisma.licenseKey.create({
      data: {
        keyHash,
        planId,
        planLevel,
        maxDownloads: Math.floor(maxDownloads),
        expiresAt,
        requireLogin,
        note,
      },
    });

    return NextResponse.json({
      ok: true,
      rawKey,
      license,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "创建 License 失败" },
      { status: 500 }
    );
  }
}

