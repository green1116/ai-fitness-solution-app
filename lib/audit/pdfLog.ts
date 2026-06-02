import { prisma } from "@/lib/prisma";

type PdfDownloadLogInput = {
  planId: string;
  ok: boolean;
  route: string;
  method: string;
  mode?: string | null;
  level?: string | null;
  format?: string | null;
  theme?: string | null;
  pdfVersion?: string | null;
  planVersion?: string | null;
  budgetVersion?: string | null;
  reqsig?: string | null;
  docSeq?: string | null;
  pages?: number | null;
  bytes?: number | null;
  ip?: string | null;
  ua?: string | null;
  reason?: string | null;
  extra?: any;
};

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timeout after ${ms}ms`));
    }, ms);

    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export function getReqIp(req: Request) {
  const forwardedFor =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("X-Forwarded-For") ||
    "";

  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp =
    req.headers.get("x-real-ip") ||
    req.headers.get("X-Real-IP") ||
    "";

  if (realIp) return realIp.trim();

  return "::1";
}

export async function logPdfDownloadSafe(data: PdfDownloadLogInput) {
  try {
    const payload = {
      planId: data.planId,
      ok: data.ok,
      route: data.route,
      method: data.method,
      mode: data.mode ?? null,
      level: data.level ?? null,
      format: data.format ?? null,
      theme: data.theme ?? null,
      pdfVersion: data.pdfVersion ?? null,
      planVersion: data.planVersion ?? null,
      budgetVersion: data.budgetVersion ?? null,
      reqsig: data.reqsig ?? null,
      docSeq: data.docSeq ?? null,
      pages: data.pages ?? null,
      bytes: data.bytes ?? null,
      ip: data.ip ?? null,
      ua: data.ua ?? null,
      reason: data.reason ?? null,
      extra: data.extra ?? null,
    };

    await withTimeout(
      prisma.pdfDownloadLog.create({ data: payload }),
      1500,
      "pdfDownloadLog.create"
    );
  } catch (e) {
    console.warn("[PdfDownloadLog] write failed:", e);
  }
}