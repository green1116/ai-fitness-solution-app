/** 商业档位排序：用于判断 license.planLevel 是否覆盖请求的 tier */

export function tierRank(level: string): number {
  const v = String(level || "").trim().toLowerCase();
  if (v === "enterprise") return 2;
  if (v === "pro") return 1;
  return 0;
}

export function licenseCoversRequestTier(
  licenseLevel: string,
  requestTier: string,
): boolean {
  return tierRank(licenseLevel) >= tierRank(requestTier);
}
