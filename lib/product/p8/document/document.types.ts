/**
 * Product P8 — Document types
 */

import type { DOCUMENT_KINDS } from "../tender/tender.constants";

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
export type DocumentMetadata = Record<string, unknown>;

export type TenderDocument = {
  id: string;
  tenderId: string;
  kind: DocumentKind;
  title: string;
  sourceRef: string;
  detail: string;
  metadata: DocumentMetadata;
  createdAt: string;
};

export type CreateDocumentInput = {
  id?: string;
  tenderId: string;
  kind: DocumentKind;
  title: string;
  sourceRef?: string;
  metadata?: DocumentMetadata;
};
