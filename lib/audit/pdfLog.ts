// lib/audit/pdfLog.ts
import { prisma } from "@/lib/prisma";

/** 兼容：传 Headers 或 NextRequest */
function asHeaders(x: any): Headers | null {
  if (!x) return null;
  if (typeof x.get === "function") return x as Headers; // already Headers
  if (x.headers && typeof x.headers.get === "function") return x.headers as Headers; // NextRequest
  return null;
}

/** ✅ 供 route.ts 调用：getReqIp(reqOrHeaders) */
export function getReqIp(reqOrHeaders: any): string | null {
  const h = asHeaders(reqOrHeaders);
  if (!h) return null;

  const xf = h.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();

  return (
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("x-client-ip") ||
    null
  );
}

/** ✅ 供 route.ts 调用：getReqUa(reqOrHeaders) */
export function getReqUa(reqOrHeaders: any): string | null {
  const h = asHeaders(reqOrHeaders);
  if (!h) return null;
  return h.get("user-agent") || null;
}

export type PdfLogInput = {
  planId: string;

  route?: string | null;
  method?: string | null;

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

  ok?: boolean; // 不传默认 true
  reason?: string | null;
  extra?: any;
};

export async function logPdfDownloadSafe(data: PdfLogInput) {
  try {
    // ✅ schema-safe：仅传 schema 存在的字段，ok 必填防 P2011
    const payload = {
      planId: data.planId,
      ok: typeof data.ok === "boolean" ? data.ok : true,
      route: (data.route ?? "/api/pdf").toString().trim() || "/api/pdf",
      method: (data.method ?? "GET").toString().trim() || "GET",
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
    await prisma.pdfDownloadLog.create({ data: payload });
  } catch (e) {
    console.warn("[PdfDownloadLog] write failed:", e);
  }
}