/**
 * V61 P2 — ARR metric
 */

import { computeMRR } from "./mrr.metric";

export function computeARR(mrr?: number): number {
  return (mrr ?? computeMRR()) * 12;
}
