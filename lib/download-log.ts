// lib/download-log.ts
import { logPdfDownloadSafe } from "@/lib/audit/pdfLog";

type LogDownloadInput = {
  planId: string;

  // ✅ DB 必填
  ok: boolean;

  // ✅ 可选：给失败或特殊情况做标记
  reason?: string | null;
  error?: string | null;

  // ✅ 常用网络信息
  ip?: string | null;
  ua?: string | null; // 统一用 ua（匹配 schema）

  // ✅ 业务维度（按你 schema.prisma）
  route?: string | null; // /api/pdf or /api/tender-pack
  method?: string | null; // GET/HEAD
  mode?: string | null; // full/budget/preview/pack...
  level?: string | null; // brand/enterprise/government
  format?: string | null; // merged/zip/links
  theme?: string | null; // brand/tender

  // ✅ 版本/签名/统计
  pdfVersion?: string | null;
  planVersion?: string | null;
  budgetVersion?: string | null;
  reqsig?: string | null;
  docSeq?: string | null;
  pages?: number | null;
  bytes?: number | null;

  // ✅ 扩展信息
  extra?: any;
};

/**
 * 写下载日志：失败不影响主流程
 * 注意：schema 里字段名是 ua，不是 userAgent
 */
export async function logDownload(input: LogDownloadInput) {
  await logPdfDownloadSafe({
    planId: input.planId,
    ok: input.ok,
    reason: input.reason ?? null,
    route: input.route ?? null,
    method: input.method ?? null,
    mode: input.mode ?? null,
    level: input.level ?? null,
    format: input.format ?? null,
    theme: input.theme ?? null,
    pdfVersion: input.pdfVersion ?? null,
    planVersion: input.planVersion ?? null,
    budgetVersion: input.budgetVersion ?? null,
    reqsig: input.reqsig ?? null,
    docSeq: input.docSeq ?? null,
    pages: input.pages ?? null,
    bytes: input.bytes ?? null,
    ip: input.ip ?? null,
    ua: input.ua ?? null,
    extra: { ...(input.extra as object), ...(input.error != null ? { error: input.error } : {}) },
  });
}

/**
 * 兼容旧调用：有人传 userAgent 的话，转成 ua
 */
export async function logDownloadCompat(input: {
  planId: string;
  ok: boolean;
  reason?: string | null;
  error?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}) {
  return logDownload({
    planId: input.planId,
    ok: input.ok,
    reason: input.reason ?? null,
    error: input.error ?? null,
    ip: input.ip ?? null,
    ua: input.userAgent ?? null,
  });
}