/**
 * Product Invoice — Tax registry
 */

import {
  getDocument,
  recalculateDocumentTotals,
} from "../document/document.registry";
import { TAX_MODES } from "../engine/engine.constants";
import type { ApplyTaxInput, InvoiceTax, TaxMode } from "./tax.types";

const taxes = new Map<string, InvoiceTax>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTax(tax: InvoiceTax): InvoiceTax {
  return { ...tax, metadata: { ...tax.metadata } };
}

export function applyTax(input: ApplyTaxInput): InvoiceTax {
  const documentId = input.documentId.trim();
  if (!documentId) throw new Error("tax.documentId is required");
  if (!Number.isFinite(input.rateBps) || input.rateBps < 0) {
    throw new Error("tax.rateBps must be >= 0");
  }

  const mode = input.mode ?? TAX_MODES[0];
  if (!(TAX_MODES as readonly string[]).includes(mode)) {
    throw new Error(`invalid tax mode: ${mode}`);
  }

  const document = getDocument(documentId);
  if (!document) throw new Error(`document not found: ${documentId}`);
  if (document.status !== "DRAFT") {
    throw new Error(`document not draft: ${documentId}`);
  }

  const existing = [...taxes.values()].find(
    (t) => t.documentId === documentId,
  );
  if (existing) {
    throw new Error(`tax already applied: ${documentId}`);
  }

  let amountCents = 0;
  let subtotalCents = document.subtotalCents;
  if (mode === "EXCLUSIVE") {
    amountCents = Math.floor((document.subtotalCents * input.rateBps) / 10000);
  } else if (mode === "INCLUSIVE") {
    const total = document.subtotalCents;
    amountCents = Math.floor((total * input.rateBps) / (10000 + input.rateBps));
    subtotalCents = total - amountCents;
  } else {
    amountCents = 0;
  }

  const id = input.id?.trim() || createId("invtax");
  if (taxes.has(id)) throw new Error(`tax already exists: ${id}`);

  const tax: InvoiceTax = {
    id,
    documentId,
    mode,
    rateBps: input.rateBps,
    amountCents,
    detail: `mode=${mode} rateBps=${input.rateBps}`,
    metadata: { ...(input.metadata ?? {}) },
    appliedAt: nowIso(),
  };
  taxes.set(id, tax);
  recalculateDocumentTotals(documentId, subtotalCents, amountCents);
  return cloneTax(tax);
}

export function getTax(id: string): InvoiceTax | undefined {
  const tax = taxes.get(id.trim());
  return tax ? cloneTax(tax) : undefined;
}

export function listTaxes(filter?: {
  documentId?: string;
  mode?: TaxMode;
}): InvoiceTax[] {
  let result = [...taxes.values()];
  if (filter?.documentId) {
    const documentId = filter.documentId.trim();
    result = result.filter((t) => t.documentId === documentId);
  }
  if (filter?.mode) result = result.filter((t) => t.mode === filter.mode);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTax);
}

export function clearTaxes(): void {
  taxes.clear();
}
