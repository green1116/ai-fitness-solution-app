/**
 * 商业档位默认单价（分）。实际下单金额可由环境变量在
 * `lib/upgradeUnlock.ts` 的 `upgradeAmountForLevel` 中覆盖。
 */
const PRO_AMOUNT_CENTS_DEFAULT = 9_900;
const ENTERPRISE_AMOUNT_CENTS_DEFAULT = 49_900;

export function commercialTierAmountCents(level: "pro" | "enterprise"): number {
  return level === "enterprise"
    ? ENTERPRISE_AMOUNT_CENTS_DEFAULT
    : PRO_AMOUNT_CENTS_DEFAULT;
}
