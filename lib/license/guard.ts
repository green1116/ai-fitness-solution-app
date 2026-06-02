/**
 * 套餐 × 文档类型 下载权限（服务端唯一口径）
 * - free：仅 plan
 * - pro：plan、budget
 * - enterprise：plan、budget、zip
 */

export type PlanLevel = "free" | "pro" | "enterprise";

export type DocType = "plan" | "budget" | "zip";

export function normalizeDocType(raw: unknown): DocType {
  const v = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (v === "budget") return "budget";
  if (v === "zip") return "zip";
  return "plan";
}

/**
 * @param planLevel 请求档位（与 body tier / header x-mode 归一后一致）
 * @param docType 本次下载的文档类型
 */
export function canDownloadDocument(planLevel: PlanLevel, docType: DocType): boolean {
  switch (docType) {
    case "plan":
      return planLevel === "free" || planLevel === "pro" || planLevel === "enterprise";
    case "budget":
      return planLevel === "pro" || planLevel === "enterprise";
    case "zip":
      return planLevel === "enterprise";
    default:
      return false;
  }
}
