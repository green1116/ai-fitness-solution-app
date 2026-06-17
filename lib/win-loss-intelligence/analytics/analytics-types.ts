import type { WLI_CANONICAL_ID } from "../shared/constants";
import type { TenderOutcome } from "../shared/types";
import type { ProcurementDecisionRecord } from "@/lib/procurement-intelligence";

export interface BrandWinRate {
  brandId: string;
  winCount: number;
  lossCount: number;
  pendingCount: number;
  winRate: number;
}

export interface SupplierWinRate {
  supplierId: string;
  winCount: number;
  lossCount: number;
  pendingCount: number;
  winRate: number;
}

export interface ProductWinRate {
  productId: string;
  winCount: number;
  lossCount: number;
  pendingCount: number;
  winRate: number;
}

export interface ProcurementWinRate {
  procurementLevel: string;
  winCount: number;
  lossCount: number;
  pendingCount: number;
  winRate: number;
}

export interface AnalyticsSummary {
  brandAnalyticsCount: number;
  supplierAnalyticsCount: number;
  productAnalyticsCount: number;
  procurementAnalyticsCount: number;
  totalOutcomes: number;
  mode: typeof WLI_CANONICAL_ID;
}

export interface WinLossAnalyticsContext {
  contextId: string;
  outcomes: TenderOutcome[];
  brands: BrandWinRate[];
  suppliers: SupplierWinRate[];
  products: ProductWinRate[];
  procurement: ProcurementWinRate[];
  decisions: ProcurementDecisionRecord[];
  summary: AnalyticsSummary;
  mode: typeof WLI_CANONICAL_ID;
}

export interface WinLossAnalyticsValidation {
  valid: boolean;
  brandAnalyticsReady: boolean;
  supplierAnalyticsReady: boolean;
  productAnalyticsReady: boolean;
  procurementAnalyticsReady: boolean;
  brandAnalyticsCount: number;
  supplierAnalyticsCount: number;
  productAnalyticsCount: number;
  procurementAnalyticsCount: number;
  summary: string;
}

export function computeWinRate(
  winCount: number,
  lossCount: number,
  pendingCount: number,
): number {
  const total = winCount + lossCount + pendingCount;
  if (total === 0) return 0;
  return Math.round((winCount / total) * 100);
}
