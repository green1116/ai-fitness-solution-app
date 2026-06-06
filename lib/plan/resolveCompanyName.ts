const DEFAULT_COMPANY_NAME = "示例企业";

/** 历史遗留占位名 / 邮箱前缀误用，不得作为投标单位展示 */
export function isLegacyBidderName(name: string | null | undefined): boolean {
  const v = String(name ?? "").trim();
  if (!v) return true;
  return /^(insport|投标企业|某企业|未命名企业)$/i.test(v);
}

/** 从 /plan 表单或 planJob.input 解析投标单位名称 */
export function resolveCompanyName(
  input?: Record<string, unknown> | null,
): string {
  const candidates = [
    input?.companyName,
    input?.company_name,
    input?.clientName,
  ]
    .map((v) => String(v ?? "").trim())
    .filter(Boolean);

  for (const raw of candidates) {
    if (!isLegacyBidderName(raw)) return raw;
  }
  return DEFAULT_COMPANY_NAME;
}

/** 替换正文中遗留的邮箱前缀 / 旧默认名（如 insport） */
export function replaceLegacyBidderNames(
  text: string,
  companyName: string,
): string {
  const company = companyName.trim() || DEFAULT_COMPANY_NAME;
  return text
    .replace(/\binsport\b/gi, company)
    .replace(/投标企业/g, company)
    .replace(/某企业/g, company);
}
