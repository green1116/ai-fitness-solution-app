// lib/download-log.ts
import { prisma } from "@/lib/prisma";

export async function logDownload(input: {
  planId: string;
  ok: boolean;
  reason?: string | null;
  error?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.pdfDownloadLog.create({
      data: {
        planId: input.planId,
        ok: input.ok,
        reason: input.reason ?? null,
        error: input.error ?? null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch {
    // 日志失败不影响下载主流程
  }
}

