import { buildBrandWinRateAnalytics } from "./brand-winrate-analytics";
import { buildProductWinRateAnalytics } from "./product-winrate-analytics";
import { buildProcurementWinRateAnalytics } from "./procurement-winrate-analytics";
import { buildSupplierWinRateAnalytics } from "./supplier-winrate-analytics";
import type { WinLossAnalyticsValidation } from "./analytics-types";

function isWinRateRecordReady(record: {
  winCount: number;
  lossCount: number;
  pendingCount: number;
  winRate: number;
}): boolean {
  const total = record.winCount + record.lossCount + record.pendingCount;
  return total > 0 && record.winRate >= 0 && record.winRate <= 100;
}

let cachedValidation: WinLossAnalyticsValidation | undefined;

export function validateWinLossAnalytics(): WinLossAnalyticsValidation {
  if (cachedValidation) return cachedValidation;

  const brands = buildBrandWinRateAnalytics();
  const suppliers = buildSupplierWinRateAnalytics();
  const products = buildProductWinRateAnalytics();
  const procurement = buildProcurementWinRateAnalytics();

  const brandAnalyticsReady =
    brands.length > 0 && brands.every((record) => isWinRateRecordReady(record));
  const supplierAnalyticsReady =
    suppliers.length > 0 && suppliers.every((record) => isWinRateRecordReady(record));
  const productAnalyticsReady =
    products.length > 0 && products.every((record) => isWinRateRecordReady(record));
  const procurementAnalyticsReady =
    procurement.length > 0 && procurement.every((record) => isWinRateRecordReady(record));

  const valid =
    brandAnalyticsReady &&
    supplierAnalyticsReady &&
    productAnalyticsReady &&
    procurementAnalyticsReady;

  cachedValidation = {
    valid,
    brandAnalyticsReady,
    supplierAnalyticsReady,
    productAnalyticsReady,
    procurementAnalyticsReady,
    brandAnalyticsCount: brands.length,
    supplierAnalyticsCount: suppliers.length,
    productAnalyticsCount: products.length,
    procurementAnalyticsCount: procurement.length,
    summary: `win-loss-analytics brands=${brands.length} suppliers=${suppliers.length} products=${products.length} procurement=${procurement.length} valid=${valid}`,
  };

  return cachedValidation;
}
