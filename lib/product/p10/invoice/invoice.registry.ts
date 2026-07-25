/**
 * Product P10 — Invoice registry
 */

import { INVOICE_STATUSES } from "../subscription/subscription.constants";
import { getBilling } from "../billing/billing.registry";
import type {
  Invoice,
  IssueInvoiceInput,
  UpdateInvoiceStatusInput,
} from "./invoice.types";

const invoices = new Map<string, Invoice>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneInvoice(invoice: Invoice): Invoice {
  return { ...invoice, metadata: { ...invoice.metadata } };
}

export function issueInvoice(input: IssueInvoiceInput): Invoice {
  const billingId = input.billingId.trim();
  if (!billingId) throw new Error("invoice.billingId is required");
  const billing = getBilling(billingId);
  if (!billing) throw new Error(`billing not found: ${billingId}`);

  const id = input.id?.trim() || createId("p10inv");
  if (invoices.has(id)) {
    throw new Error(`invoice already exists: ${id}`);
  }

  const number =
    (input.number ?? "").trim() || `INV-${id.toUpperCase()}`;
  const currency = (input.currency ?? "USD").trim() || "USD";
  const status = INVOICE_STATUSES[1];
  const invoice: Invoice = {
    id,
    billingId,
    subscriptionId: billing.subscriptionId,
    number,
    amount: billing.amount,
    currency,
    status,
    detail: `status=${status} amount=${billing.amount} ${currency}`,
    metadata: { ...(input.metadata ?? {}) },
    issuedAt: nowIso(),
  };
  invoices.set(id, invoice);
  return cloneInvoice(invoice);
}

export function updateInvoiceStatus(
  input: UpdateInvoiceStatusInput,
): Invoice {
  const invoiceId = input.invoiceId.trim();
  if (!invoiceId) throw new Error("invoice.invoiceId is required");
  if (!(INVOICE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid invoice status: ${input.status}`);
  }
  const existing = invoices.get(invoiceId);
  if (!existing) throw new Error(`invoice not found: ${invoiceId}`);

  const updated: Invoice = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} amount=${existing.amount} ${existing.currency}`,
    metadata: { ...existing.metadata },
    paidAt: input.status === "PAID" ? nowIso() : existing.paidAt,
  };
  invoices.set(invoiceId, updated);
  return cloneInvoice(updated);
}

export function getInvoice(id: string): Invoice | undefined {
  const invoice = invoices.get(id.trim());
  return invoice ? cloneInvoice(invoice) : undefined;
}

export function listInvoices(filter?: {
  subscriptionId?: string;
}): Invoice[] {
  let result = [...invoices.values()];
  if (filter?.subscriptionId) {
    const sid = filter.subscriptionId.trim();
    result = result.filter((i) => i.subscriptionId === sid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneInvoice);
}

export function clearInvoices(): void {
  invoices.clear();
}
