/**
 * Product Invoice — Line item types
 */

import type { LINE_KINDS } from "../engine/engine.constants";

export type LineKind = (typeof LINE_KINDS)[number];
export type LineMetadata = Record<string, unknown>;

export type InvoiceLine = {
  id: string;
  documentId: string;
  kind: LineKind;
  description: string;
  quantity: number;
  unitCents: number;
  amountCents: number;
  detail: string;
  metadata: LineMetadata;
  addedAt: string;
};

export type AddLineInput = {
  id?: string;
  documentId: string;
  kind?: LineKind;
  description: string;
  quantity?: number;
  unitCents: number;
  metadata?: LineMetadata;
};
