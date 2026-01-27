import { prisma } from "@/lib/prisma";

type AuditArgs = {
  planId: string;
  mode: "preview" | "full";
  ok?: boolean;
  reason?: string;        // preview / bypass / token / paid / license / error
  email?: string | null;
  licenseId?: string | null;
  ip?: string | null;
  ua?: string | null;
};

export async function logPdfDownload(args: AuditArgs) {
  const {
    planId,
    mode,
    ok = true,
    reason,
    email = null,
    licenseId = null,
    ip = null,
    ua = null,
  } = args;

  try {
    await prisma.pdfDownloadLog.create({
      data: {
        planId,
        mode,
        ok,
        reason,
        email,
        licenseId,
        ip,
        ua,
      },
    });
  } catch (e) {
    // ⚠️ 审计失败不应该影响主流程
    console.warn("[PdfDownloadLog] write failed:", e);
  }
}

