// app/api/debug/new-license/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

// 生成给用户的一次性“明文 licenseKey”，库里只存 hash
function generateLicenseKeyPlain() {
  // 32 bytes => base64url 长度大约 43
  return crypto.randomBytes(32).toString("base64url");
}

function nowPlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json(415, {
        ok: false,
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Content-Type must be application/json",
      });
    }

    const body = await req.json().catch(() => null);
    const planId = (body?.planId ?? "").toString().trim();
    const maxDownloads = Number(body?.maxDownloads ?? 0);
    const days = Number(body?.days ?? 0);
    const requireLogin = Boolean(body?.requireLogin ?? false);
    const note = (body?.note ?? "").toString().trim();

    if (!planId) {
      return json(400, { ok: false, code: "MISSING_PLAN_ID", message: "Missing planId" });
    }
    if (!Number.isFinite(maxDownloads) || maxDownloads <= 0) {
      return json(400, {
        ok: false,
        code: "INVALID_MAX_DOWNLOADS",
        message: "maxDownloads must be a positive number",
      });
    }
    if (!Number.isFinite(days) || days <= 0) {
      return json(400, { ok: false, code: "INVALID_DAYS", message: "days must be a positive number" });
    }

    // 用一个“pepper”让 keyHash 更难被撞库
    // 没有就退化为 DOWNLOAD_TOKEN_SECRET（你项目里基本一定有）
    const pepper =
      process.env.LICENSE_KEY_SECRET ||
      process.env.DOWNLOAD_TOKEN_SECRET ||
      "";

    if (!pepper || pepper.length < 16) {
      // 不强制，但给个很明显的提示（否则你以为成功，其实安全性很弱）
      console.warn("[new-license] LICENSE_KEY_SECRET/DOWNLOAD_TOKEN_SECRET is too short or missing");
    }

    const licenseKey = generateLicenseKeyPlain();
    const keyHash = sha256Hex(`license:${licenseKey}:${pepper}`);

    const expiresAt = nowPlusDays(days);

    // ✅ 关键：你的 schema 里模型叫 LicenseKey，所以 client 是 prisma.licenseKey
    const row = await prisma.licenseKey.create({
      data: {
        keyHash,
        planId,
        maxDownloads,
        usedCount: 0,
        expiresAt,
        requireLogin,
        note: note || null,
      },
      select: {
        id: true,
        planId: true,
        maxDownloads: true,
        usedCount: true,
        expiresAt: true,
        requireLogin: true,
        createdAt: true,
      },
    });

    return json(200, {
      ok: true,
      licenseId: row.id,
      licenseKey, // ✅ 只在创建时返回一次明文
      planId: row.planId,
      maxDownloads: row.maxDownloads,
      usedCount: row.usedCount,
      requireLogin: row.requireLogin,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    });
  } catch (e: any) {
    // dev 下把错误带回去，避免你只能看到 500
    const message = e?.message || "Internal Error";
    const code = e?.code || "NEW_LICENSE_FAILED";

    // Prisma 常见：P2021(表不存在), P2002(唯一冲突) 等
    return json(500, {
      ok: false,
      code,
      message,
      extra:
        process.env.NODE_ENV === "development"
          ? {
              name: e?.name,
              stack: e?.stack,
            }
          : undefined,
    });
  }
}
