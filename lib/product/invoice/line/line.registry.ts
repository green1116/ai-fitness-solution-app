/**
 * Product Invoice — Line item registry
 */

import {
  getDocument,
  recalculateDocumentTotals,
} from "../document/document.registry";
import { LINE_KINDS } from "../engine/engine.constants";
import type { AddLineInput, InvoiceLine, LineKind } from "./line.types";

const lines = new Map<string, InvoiceLine>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLine(line: InvoiceLine): InvoiceLine {
  return { ...line, metadata: { ...line.metadata } };
}

function recomputeSubtotal(documentId: string): void {
  const document = getDocument(documentId);
  if (!document) return;
  const docLines = [...lines.values()].filter(
    (l) => l.documentId === documentId,
  );
  const subtotalCents = docLines.reduce((sum, l) => {
    if (l.kind === "CREDIT") return sum - l.amountCents;
    return sum + l.amountCents;
  }, 0);
  recalculateDocumentTotals(
    documentId,
    Math.max(0, subtotalCents),
    document.taxCents,
  );
}

export function addLine(input: AddLineInput): InvoiceLine {
  const documentId = input.documentId.trim();
  const description = input.description.trim();
  if (!documentId) throw new Error("line.documentId is required");
  if (!description) throw new Error("line.description is required");

  const kind = input.kind ?? LINE_KINDS[0];
  if (!(LINE_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid line kind: ${kind}`);
  }
  if (kind === "TAX") {
    throw new Error("use tax registry for TAX lines");
  }

  const quantity = input.quantity ?? 1;
  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new Error("line.quantity must be >= 1");
  }
  if (!Number.isFinite(input.unitCents)) {
    throw new Error("line.unitCents is required");
  }

  const document = getDocument(documentId);
  if (!document) throw new Error(`document not found: ${documentId}`);
  if (document.status !== "DRAFT") {
    throw new Error(`document not draft: ${documentId}`);
  }

  const id = input.id?.trim() || createId("invln");
  if (lines.has(id)) throw new Error(`line already exists: ${id}`);

  const amountCents = Math.abs(input.unitCents) * quantity;
  const line: InvoiceLine = {
    id,
    documentId,
    kind,
    description,
    quantity,
    unitCents: input.unitCents,
    amountCents,
    detail: `kind=${kind} amount=${amountCents}`,
    metadata: { ...(input.metadata ?? {}) },
    addedAt: nowIso(),
  };
  lines.set(id, line);
  recomputeSubtotal(documentId);
  return cloneLine(line);
}

export function getLine(id: string): InvoiceLine | undefined {
  const line = lines.get(id.trim());
  return line ? cloneLine(line) : undefined;
}

export function listLines(filter?: {
  documentId?: string;
  kind?: LineKind;
}): InvoiceLine[] {
  let result = [...lines.values()];
  if (filter?.documentId) {
    const documentId = filter.documentId.trim();
    result = result.filter((l) => l.documentId === documentId);
  }
  if (filter?.kind) result = result.filter((l) => l.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneLine);
}

export function clearLines(): void {
  lines.clear();
}
