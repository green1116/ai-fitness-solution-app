/**
 * Product Invoice — Tax types
 */

import type { TAX_MODES } from "../engine/engine.constants";

export type TaxMode = (typeof TAX_MODES)[number];
export type TaxMetadata = Record<string, unknown>;

export type InvoiceTax = {
  id: string;
  documentId: string;
  mode: TaxMode;
  rateBps: number;
  amountCents: number;
  detail: string;
  metadata: TaxMetadata;
  appliedAt: string;
};

export type ApplyTaxInput = {
  id?: string;
  documentId: string;
  mode?: TaxMode;
  rateBps: number;
  metadata?: TaxMetadata;
};
