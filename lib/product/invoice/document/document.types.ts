/**
 * Product Invoice — Document types
 */

import type { DOCUMENT_STATUSES } from "../engine/engine.constants";

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export type DocumentMetadata = Record<string, unknown>;

export type InvoiceDocument = {
  id: string;
  accountId: string;
  number: string;
  currency: string;
  status: DocumentStatus;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  detail: string;
  metadata: DocumentMetadata;
  createdAt: string;
  issuedAt?: string;
  settledAt?: string;
};

export type CreateDocumentInput = {
  id?: string;
  accountId: string;
  number?: string;
  currency?: string;
  metadata?: DocumentMetadata;
};

export type IssueDocumentInput = {
  documentId: string;
};

export type VoidDocumentInput = {
  documentId: string;
};
