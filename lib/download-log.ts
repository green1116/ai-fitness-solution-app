// @ts-nocheck
// lib/download-log.ts
import { logPdfDownloadSafe } from "@/lib/audit/pdfLog";

export async function logDownload(input: {
  planId: string;
  ok: boolean;
  reason?: string | null;
  error?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}) {
  // ✅ schema-safe：reason/error/userAgent 统统塞 extra
  return logPdfDownloadSafe({
    planId: input.planId,
    ok: input.ok,
    ip: input.ip ?? null,
    ua: input.userAgent ?? null,
    extra: {
      reason: input.reason ?? null,
      error: input.error ?? null,
      legacy: "lib/download-log.ts",
    },
  });
}