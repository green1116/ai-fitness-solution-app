/** 面向客户/生产环境的统一文案（不暴露工程细节） */

export const DOWNLOAD_SERVICE_UNAVAILABLE =
  "下载服务暂时不可用，请稍后再试。";

export const PAGE_UNAVAILABLE = "当前页面暂不可用，请稍后刷新后重试。";

export const TENDER_INTAKE_RETRY =
  "招标文件暂未完成解析，请重新上传文件后重试。";

export const PROJECT_NOT_READY =
  "方案尚未就绪，请返回填写页重新生成后再下载。";

export const MISSING_PROJECT_CONTEXT =
  "未找到有效方案记录，请从填写页重新生成方案后再进入本页。";

export const OPERATION_NOT_SUPPORTED =
  "当前版本不支持该操作，请联系管理员。";

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
  /pdf-parse/i,
  /Invalid PDF/i,
  /Invalid root reference/i,
  /PDFDocument/i,
  /nested transaction/i,
  /ENOENT/i,
  /test\/data/i,
  /文件路径无效/i,
  /请不要使用测试路径/i,
  /stack/i,
  /stack\s*trace/i,
  /at\s+\w+\(/i,
  /projectLoadState/i,
  /projectId/i,
  /PROJECT_NOT_FOUND/i,
  /SOLUTION_NOT_READY/i,
  /TENDER_INTAKE_FAILED/i,
  /internal server error/i,
  /internal api/i,
  /\/api\//i,
  /[A-Z]:\\Users\\/i,
  /\/Users\//i,
  /\/tmp\//i,
  /\/var\//i,
  /mode=engine/i,
  /engine mode/i,
  /SyntaxError/i,
  /TypeError/i,
  /ReferenceError/i,
  /fetch failed/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
];

export function isInternalClientError(message: string): boolean {
  const m = message.trim();
  if (!m) return false;
  return INTERNAL_ERROR_PATTERNS.some((re) => re.test(m));
}

/** 将工程错误替换为友好提示（控制台仍可看原始日志） */
export function toClientFacingError(
  message: string | null | undefined,
  fallback = DOWNLOAD_SERVICE_UNAVAILABLE,
): string {
  const raw = String(message ?? "").trim();
  if (!raw) return fallback;
  if (isInternalClientError(raw)) return fallback;
  return raw;
}

export function toTenderIntakeClientError(
  message: string | null | undefined,
): string {
  const raw = String(message ?? "").trim();
  if (!raw) return TENDER_INTAKE_RETRY;
  if (isInternalClientError(raw)) return TENDER_INTAKE_RETRY;
  return raw;
}
