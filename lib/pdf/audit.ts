import { logPdfDownloadSafe } from "@/lib/audit/pdfLog";

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

  await logPdfDownloadSafe({
    planId,
    route: "/api/pdf",
    method: "GET",
    mode,
    ok,
    reason: reason ?? null,
    ip,
    ua,
    extra: { email, licenseId },
  });
}

