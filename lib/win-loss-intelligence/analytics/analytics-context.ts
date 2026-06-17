import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { WLI_CANONICAL_ID } from "../shared/constants";
import { buildOutcomeRegistry } from "../win-loss-foundation/outcome-registry";
import { buildBrandWinRateAnalytics } from "./brand-winrate-analytics";
import { buildProductWinRateAnalytics } from "./product-winrate-analytics";
import { buildProcurementWinRateAnalytics } from "./procurement-winrate-analytics";
import { buildSupplierWinRateAnalytics } from "./supplier-winrate-analytics";
import type { WinLossAnalyticsContext } from "./analytics-types";

let cachedContext: WinLossAnalyticsContext | undefined;

export function buildWinLossAnalyticsContext(): WinLossAnalyticsContext {
  if (cachedContext) return cachedContext;

  const outcomes = buildOutcomeRegistry().records;
  const brands = buildBrandWinRateAnalytics();
  const suppliers = buildSupplierWinRateAnalytics();
  const products = buildProductWinRateAnalytics();
  const procurement = buildProcurementWinRateAnalytics();
  const decisions = runProcurementDecisionEngine();

  cachedContext = {
    contextId: "wli-analytics-context-v44-p2",
    outcomes,
    brands,
    suppliers,
    products,
    procurement,
    decisions,
    summary: {
      brandAnalyticsCount: brands.length,
      supplierAnalyticsCount: suppliers.length,
      productAnalyticsCount: products.length,
      procurementAnalyticsCount: procurement.length,
      totalOutcomes: outcomes.length,
      mode: WLI_CANONICAL_ID,
    },
    mode: WLI_CANONICAL_ID,
  };

  return cachedContext;
}
