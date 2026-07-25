/**
 * Product Invoice — Document registry
 */

import { DOCUMENT_STATUSES } from "../engine/engine.constants";
import type {
  CreateDocumentInput,
  DocumentStatus,
  InvoiceDocument,
  IssueDocumentInput,
  VoidDocumentInput,
} from "./document.types";

const documents = new Map<string, InvoiceDocument>();
let numberSeq = 0;

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDocument(document: InvoiceDocument): InvoiceDocument {
  return { ...document, metadata: { ...document.metadata } };
}

export function createDocument(
  input: CreateDocumentInput,
): InvoiceDocument {
  const accountId = input.accountId.trim();
  const currency = (input.currency ?? "USD").trim().toUpperCase();
  if (!accountId) throw new Error("document.accountId is required");
  if (!currency) throw new Error("document.currency is required");

  const id = input.id?.trim() || createId("invdoc");
  if (documents.has(id)) throw new Error(`document already exists: ${id}`);

  numberSeq += 1;
  const number =
    input.number?.trim() ||
    `INV-${new Date().getUTCFullYear()}-${String(numberSeq).padStart(4, "0")}`;

  const document: InvoiceDocument = {
    id,
    accountId,
    number,
    currency,
    status: DOCUMENT_STATUSES[0],
    subtotalCents: 0,
    taxCents: 0,
    totalCents: 0,
    detail: `status=DRAFT number=${number}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  documents.set(id, document);
  return cloneDocument(document);
}

export function issueDocument(input: IssueDocumentInput): InvoiceDocument {
  const documentId = input.documentId.trim();
  if (!documentId) throw new Error("document.documentId is required");
  const existing = documents.get(documentId);
  if (!existing) throw new Error(`document not found: ${documentId}`);
  if (existing.status !== "DRAFT") {
    throw new Error(`document not draft: ${documentId}`);
  }
  if (existing.totalCents <= 0) {
    throw new Error(`document has no amount: ${documentId}`);
  }

  const now = nowIso();
  const updated: InvoiceDocument = {
    ...existing,
    status: "ISSUED",
    detail: `status=ISSUED total=${existing.totalCents}`,
    metadata: { ...existing.metadata },
    issuedAt: now,
  };
  documents.set(documentId, updated);
  return cloneDocument(updated);
}

export function voidDocument(input: VoidDocumentInput): InvoiceDocument {
  const documentId = input.documentId.trim();
  if (!documentId) throw new Error("document.documentId is required");
  const existing = documents.get(documentId);
  if (!existing) throw new Error(`document not found: ${documentId}`);
  if (existing.status === "VOID") {
    throw new Error(`document already void: ${documentId}`);
  }
  if (existing.status === "SETTLED") {
    throw new Error(`document already settled: ${documentId}`);
  }

  const updated: InvoiceDocument = {
    ...existing,
    status: "VOID",
    detail: `status=VOID number=${existing.number}`,
    metadata: { ...existing.metadata },
  };
  documents.set(documentId, updated);
  return cloneDocument(updated);
}

export function recalculateDocumentTotals(
  documentId: string,
  subtotalCents: number,
  taxCents: number,
): InvoiceDocument {
  const existing = documents.get(documentId.trim());
  if (!existing) throw new Error(`document not found: ${documentId}`);
  if (existing.status !== "DRAFT") {
    throw new Error(`document not editable: ${documentId}`);
  }

  const updated: InvoiceDocument = {
    ...existing,
    subtotalCents,
    taxCents,
    totalCents: subtotalCents + taxCents,
    detail: `status=DRAFT total=${subtotalCents + taxCents}`,
    metadata: { ...existing.metadata },
  };
  documents.set(documentId, updated);
  return cloneDocument(updated);
}

export function markDocumentSettled(documentId: string): InvoiceDocument {
  const existing = documents.get(documentId.trim());
  if (!existing) throw new Error(`document not found: ${documentId}`);
  if (existing.status !== "ISSUED") {
    throw new Error(`document not issued: ${documentId}`);
  }

  const now = nowIso();
  const updated: InvoiceDocument = {
    ...existing,
    status: "SETTLED",
    detail: `status=SETTLED total=${existing.totalCents}`,
    metadata: { ...existing.metadata },
    settledAt: now,
  };
  documents.set(documentId, updated);
  return cloneDocument(updated);
}

export function getDocument(id: string): InvoiceDocument | undefined {
  const document = documents.get(id.trim());
  return document ? cloneDocument(document) : undefined;
}

export function listDocuments(filter?: {
  accountId?: string;
  status?: DocumentStatus;
}): InvoiceDocument[] {
  let result = [...documents.values()];
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((d) => d.accountId === accountId);
  }
  if (filter?.status) {
    result = result.filter((d) => d.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDocument);
}

export function clearDocuments(): void {
  documents.clear();
  numberSeq = 0;
}
