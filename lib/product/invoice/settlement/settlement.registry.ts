/**
 * Product Invoice — Settlement registry
 */

import {
  getDocument,
  markDocumentSettled,
} from "../document/document.registry";
import type {
  InvoiceSettlement,
  SettleDocumentInput,
  SettlementResult,
} from "./settlement.types";

const settlements = new Map<string, InvoiceSettlement>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSettlement(
  settlement: InvoiceSettlement,
): InvoiceSettlement {
  return { ...settlement, metadata: { ...settlement.metadata } };
}

export function settleDocument(
  input: SettleDocumentInput,
): InvoiceSettlement {
  const documentId = input.documentId.trim();
  if (!documentId) throw new Error("settlement.documentId is required");

  const document = getDocument(documentId);
  if (!document) throw new Error(`document not found: ${documentId}`);
  if (document.status !== "ISSUED") {
    throw new Error(`document not issued: ${documentId}`);
  }

  const amountCents = input.amountCents ?? document.totalCents;
  if (!Number.isFinite(amountCents) || amountCents < 0) {
    throw new Error("settlement.amountCents must be >= 0");
  }

  let result: SettlementResult = "FAILED";
  if (amountCents <= 0) {
    result = "FAILED";
  } else if (amountCents >= document.totalCents) {
    result = "SETTLED";
    markDocumentSettled(documentId);
  } else {
    result = "PARTIAL";
  }

  const id = input.id?.trim() || createId("invset");
  if (settlements.has(id)) {
    throw new Error(`settlement already exists: ${id}`);
  }

  const settlement: InvoiceSettlement = {
    id,
    documentId,
    amountCents,
    result,
    detail: `result=${result} amount=${amountCents}`,
    metadata: { ...(input.metadata ?? {}) },
    settledAt: nowIso(),
  };
  settlements.set(id, settlement);
  return cloneSettlement(settlement);
}

export function getSettlement(id: string): InvoiceSettlement | undefined {
  const settlement = settlements.get(id.trim());
  return settlement ? cloneSettlement(settlement) : undefined;
}

export function listSettlements(filter?: {
  documentId?: string;
  result?: SettlementResult;
}): InvoiceSettlement[] {
  let result = [...settlements.values()];
  if (filter?.documentId) {
    const documentId = filter.documentId.trim();
    result = result.filter((s) => s.documentId === documentId);
  }
  if (filter?.result) {
    result = result.filter((s) => s.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSettlement);
}

export function clearSettlements(): void {
  settlements.clear();
}
