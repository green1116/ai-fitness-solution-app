/**
 * V60 P2 — Deal value calculation
 */

import type { DealRow, OpportunityRow } from "../types";

export function calculateDealValue(input: {
  opportunity?: Pick<OpportunityRow, "value">;
  amount?: number;
  multiplier?: number;
}): number {
  const base = input.amount ?? input.opportunity?.value ?? 0;
  const multiplier = input.multiplier ?? 1;
  return Math.round(base * multiplier);
}

export function sumDealRevenue(deals: Pick<DealRow, "amount" | "status">[]): number {
  return deals
    .filter((d) => d.status === "CLOSED_WON")
    .reduce((sum, d) => sum + d.amount, 0);
}

export function averageDealSize(deals: Pick<DealRow, "amount" | "status">[]): number {
  const won = deals.filter((d) => d.status === "CLOSED_WON");
  if (won.length === 0) return 0;
  return Math.round(sumDealRevenue(won) / won.length);
}
