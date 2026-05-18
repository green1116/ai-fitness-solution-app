import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { hashLicenseKey } from "@/lib/license";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * POST /api/license/dev-issue
 * 仅开发环境：签发测试用 License，不接支付。
 * 前端可将返回的 licenseKey 写入 localStorage（ai_license_key）做下载联调。
 */
export async function POST(req: Request) {
  if (!isDevEnvironment()) {
    return NextResponse.json({ ok: false, error: "Not available" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    planLevel?: string;
    maxDownloads?: unknown;
    note?: string;
  };

  const rawLevel = typeof body.planLevel === "string" ? body.planLevel.trim().toLowerCase() : "";
  if (rawLevel !== "pro" && rawLevel !== "enterprise") {
    return NextResponse.json(
      { ok: false, error: "planLevel 必须为 pro 或 enterprise" },
      { status: 400 },
    );
  }
  const planLevel = rawLevel as "pro" | "enterprise";

  let maxDownloads = 5;
  if (body.maxDownloads !== undefined && body.maxDownloads !== null && body.maxDownloads !== "") {
    const n = Number(body.maxDownloads);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      return NextResponse.json(
        { ok: false, error: "maxDownloads 必须为非负整数" },
        { status: 400 },
      );
    }
    maxDownloads = Math.floor(n);
  }

  const note =
    typeof body.note === "string" && body.note.trim()
      ? `[dev-issue] ${body.note.trim()}`
      : "[dev-issue]";

  const licenseKey = randomUUID();
  const keyHash = hashLicenseKey(licenseKey);

  try {
    const row = await prisma.licenseKey.create({
      data: {
        keyHash,
        planLevel,
        maxDownloads,
        usedCount: 0,
        note,
      },
    });

    return NextResponse.json({
      ok: true,
      licenseKey,
      planLevel: row.planLevel,
      maxDownloads: row.maxDownloads,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "创建 License 失败",
      },
      { status: 500 },
    );
  }
}
