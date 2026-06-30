/**
 * V64 P2 — Currency metadata (read-only)
 */
import type { CommercialCurrencyCode, CommercialCurrencyMetadata } from "./pricing.types";

export const DEFAULT_COMMERCIAL_CURRENCY: CommercialCurrencyCode = "CNY";

export const COMMERCIAL_CURRENCY_METADATA: Record<
  CommercialCurrencyCode,
  CommercialCurrencyMetadata
> = {
  CNY: {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    minorUnit: 2,
    locale: "zh-CN",
  },
};

export function getCommercialCurrencyMetadata(
  code: CommercialCurrencyCode = DEFAULT_COMMERCIAL_CURRENCY,
): CommercialCurrencyMetadata {
  return COMMERCIAL_CURRENCY_METADATA[code];
}

export function formatCnyYuan(amount: number, opts?: { suffix?: string }): string {
  const suffix = opts?.suffix ?? "";
  const yuan = Math.round(Number(amount) || 0);
  return `¥${yuan.toLocaleString("zh-CN")}${suffix}`;
}

export function formatCnyFromCents(cents: number): string {
  const yuan = Math.round(Number(cents) || 0) / 100;
  const text = Number.isInteger(yuan) ? String(yuan) : yuan.toFixed(2);
  return `¥${text}`;
}
