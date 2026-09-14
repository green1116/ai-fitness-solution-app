/**
 * 商业档位默认单价（分）。
 * PRO 权威默认 = 49_900（¥499）；实际下单可由 `upgradeAmountForLevel` 的环境变量覆盖。
 */
const PRO_AMOUNT_CENTS_DEFAULT = 49_900;
const ENTERPRISE_AMOUNT_CENTS_DEFAULT = 49_900;

export function commercialTierAmountCents(level: "pro" | "enterprise"): number {
  return level === "enterprise"
    ? ENTERPRISE_AMOUNT_CENTS_DEFAULT
    : PRO_AMOUNT_CENTS_DEFAULT;
}
