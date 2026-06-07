/** 面向客户/生产环境的统一文案（不暴露工程细节） */

export const DOWNLOAD_SERVICE_UNAVAILABLE =
  "下载服务暂时不可用，请稍后重试。";

export const TENDER_INTAKE_RETRY =
  "招标文件暂未完成解析，请重新上传文件后重试。";

const INTERNAL_ERROR_PATTERNS = [
  /transaction api/i,
  /unable to start a transaction/i,
  /transaction.*timeout/i,
  /prisma/i,
  /P1001/i,
  /P2028/i,
  /connection pool/i,
  /pgbouncer/i,
  /PDF_PARSE_FAILED/i,
  /DOCX_PARSE_FAILED/i,
  /Invalid PDF/i,
  /Invalid root reference/i,
  /PDFDocument/i,
  /nested transaction/i,
  /ENOENT/i,
  /test\/data/i,
  /文件路径无效/i,
  /请不要使用测试路径/i,
  /stack/i,
  /at\s+\w+\(/i,
  /projectLoadState/i,
  /PROJECT_NOT_FOUND/i,
  /SOLUTION_NOT_READY/i,
  /[A-Z]:\\Users\\/i,
  /\/Users\//i,
  /\/tmp\//i,
  /\/var\//i,
];

export function isInternalClientError(message: string): boolean {
  const m = message.trim();
  if (!m) return false;
  return INTERNAL_ERROR_PATTERNS.some((re) => re.test(m));
}

/** 生产环境将工程错误替换为友好提示；开发环境保留原文便于调试 */
export function toClientFacingError(
  message: string | null | undefined,
  fallback = DOWNLOAD_SERVICE_UNAVAILABLE,
): string {
  const raw = String(message ?? "").trim();
  if (!raw) return fallback;
  if (process.env.NODE_ENV !== "production") return raw;
  if (isInternalClientError(raw)) return fallback;
  return raw;
}

export function toTenderIntakeClientError(
  message: string | null | undefined,
): string {
  const raw = String(message ?? "").trim();
  if (!raw) return TENDER_INTAKE_RETRY;
  if (isInternalClientError(raw)) return TENDER_INTAKE_RETRY;
  if (process.env.NODE_ENV !== "production") return raw;
  return TENDER_INTAKE_RETRY;
}
