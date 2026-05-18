import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashLicenseKey } from "@/lib/license";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "请求体必须是 JSON 对象" }, { status: 400 });
  }

  const licenseKey = typeof body.licenseKey === "string" ? body.licenseKey.trim() : "";
  const fingerprint = typeof body.fingerprint === "string" ? body.fingerprint.trim() : "";
  const planId = typeof body.planId === "string" ? body.planId.trim() : "";

  if (!licenseKey) {
    return NextResponse.json({ ok: false, error: "licenseKey 不能为空" }, { status: 400 });
  }
  if (!fingerprint) {
    return NextResponse.json({ ok: false, error: "fingerprint 不能为空" }, { status: 400 });
  }
  if (!planId) {
    return NextResponse.json({ ok: false, error: "planId 不能为空" }, { status: 400 });
  }

  const keyHash = hashLicenseKey(licenseKey);

  try {
    const existing = await prisma.licenseKey.findUnique({ where: { keyHash } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "许可证不存在" }, { status: 404 });
    }
    if (existing.expiresAt && existing.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ ok: false, error: "许可证已过期" }, { status: 410 });
    }
    if (existing.maxDownloads > 0 && existing.usedCount >= existing.maxDownloads) {
      return NextResponse.json({ ok: false, error: "许可证下载次数已用尽" }, { status: 409 });
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const current = await tx.licenseKey.findUnique({ where: { id: existing.id } });
      if (!current) {
        throw new Error("LICENSE_NOT_FOUND");
      }
      if (current.expiresAt && current.expiresAt.getTime() <= Date.now()) {
        throw new Error("LICENSE_EXPIRED");
      }
      if (current.maxDownloads > 0 && current.usedCount >= current.maxDownloads) {
        throw new Error("LICENSE_QUOTA_EXCEEDED");
      }

      await tx.licenseConsume.create({
        data: {
          licenseId: current.id,
          planId,
          fingerprint,
        },
      });

      return tx.licenseKey.update({
        where: { id: current.id },
        data: { usedCount: { increment: 1 } },
      });
    });

    return NextResponse.json({
      ok: true,
      licenseId: updated.id,
      planLevel: updated.planLevel,
      maxDownloads: updated.maxDownloads,
      usedCount: updated.usedCount,
      requireLogin: updated.requireLogin,
      expiresAt: updated.expiresAt,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: false, error: "该设备指纹已消费过该许可证" }, { status: 409 });
    }

    if (error instanceof Error) {
      if (error.message === "LICENSE_NOT_FOUND") {
        return NextResponse.json({ ok: false, error: "许可证不存在" }, { status: 404 });
      }
      if (error.message === "LICENSE_EXPIRED") {
        return NextResponse.json({ ok: false, error: "许可证已过期" }, { status: 410 });
      }
      if (error.message === "LICENSE_QUOTA_EXCEEDED") {
        return NextResponse.json({ ok: false, error: "许可证下载次数已用尽" }, { status: 409 });
      }
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "许可证校验失败" },
      { status: 500 }
    );
  }
}
