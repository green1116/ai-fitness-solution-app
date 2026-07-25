/**
 * Product Invoice — Settlement types
 */

import type { SETTLEMENT_RESULTS } from "../engine/engine.constants";

export type SettlementResult = (typeof SETTLEMENT_RESULTS)[number];
export type SettlementMetadata = Record<string, unknown>;

export type InvoiceSettlement = {
  id: string;
  documentId: string;
  amountCents: number;
  result: SettlementResult;
  detail: string;
  metadata: SettlementMetadata;
  settledAt: string;
};

export type SettleDocumentInput = {
  id?: string;
  documentId: string;
  amountCents?: number;
  metadata?: SettlementMetadata;
};
