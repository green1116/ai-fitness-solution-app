import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { hashLicenseKey } from "@/lib/license";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/license/create
 * 生成随机 licenseKey，sha256 后写入 keyHash；生产环境请用网关 / 鉴权保护此路由。
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    planLevel?: string;
  };

  const planLevel =
    typeof body.planLevel === "string" && body.planLevel.trim()
      ? body.planLevel.trim()
      : "pro";

  const licenseKey = randomUUID();
  const keyHash = hashLicenseKey(licenseKey);

  try {
    const row = await prisma.licenseKey.create({
      data: {
        keyHash,
        planLevel,
        maxDownloads: 5,
        usedCount: 0,
      },
    });

    return NextResponse.json({
      ok: true,
      licenseKey,
      id: row.id,
      planLevel: row.planLevel,
      maxDownloads: row.maxDownloads,
      usedCount: row.usedCount,
      createdAt: row.createdAt,
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
