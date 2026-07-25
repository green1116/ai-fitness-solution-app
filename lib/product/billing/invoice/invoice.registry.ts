/**
 * Product Billing — Invoice registry
 */

import { getBillingAccount } from "../account/account.registry";
import { INVOICE_STATUSES } from "../foundation/foundation.constants";
import { getBillingPlan } from "../plan/plan.registry";
import type {
  BillingInvoice,
  InvoiceStatus,
  IssueInvoiceInput,
  UpdateInvoiceStatusInput,
} from "./invoice.types";

const invoices = new Map<string, BillingInvoice>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneInvoice(invoice: BillingInvoice): BillingInvoice {
  return { ...invoice, metadata: { ...invoice.metadata } };
}

export function issueInvoice(input: IssueInvoiceInput): BillingInvoice {
  const accountId = input.accountId.trim();
  const planId = input.planId.trim();
  if (!accountId) throw new Error("invoice.accountId is required");
  if (!planId) throw new Error("invoice.planId is required");

  const account = getBillingAccount(accountId);
  if (!account) throw new Error(`billing account not found: ${accountId}`);
  if (account.status !== "ACTIVE") {
    throw new Error(`billing account not active: ${accountId}`);
  }

  const plan = getBillingPlan(planId);
  if (!plan) throw new Error(`billing plan not found: ${planId}`);
  if (!plan.active) throw new Error(`billing plan not active: ${planId}`);

  const id = input.id?.trim() || createId("bilinv");
  if (invoices.has(id)) throw new Error(`invoice already exists: ${id}`);

  const now = nowIso();
  const invoice: BillingInvoice = {
    id,
    accountId,
    planId,
    amountCents: plan.amountCents,
    currency: plan.currency,
    status: "ISSUED",
    detail: `plan=${plan.code} amount=${plan.amountCents}`,
    metadata: { ...(input.metadata ?? {}) },
    issuedAt: now,
    updatedAt: now,
  };
  invoices.set(id, invoice);
  return cloneInvoice(invoice);
}

export function updateInvoiceStatus(
  input: UpdateInvoiceStatusInput,
): BillingInvoice {
  const invoiceId = input.invoiceId.trim();
  if (!invoiceId) throw new Error("invoice.invoiceId is required");
  if (!(INVOICE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid invoice status: ${input.status}`);
  }

  const existing = invoices.get(invoiceId);
  if (!existing) throw new Error(`invoice not found: ${invoiceId}`);

  const updated: BillingInvoice = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} amount=${existing.amountCents}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  invoices.set(invoiceId, updated);
  return cloneInvoice(updated);
}

export function getInvoice(id: string): BillingInvoice | undefined {
  const invoice = invoices.get(id.trim());
  return invoice ? cloneInvoice(invoice) : undefined;
}

export function listInvoices(filter?: {
  accountId?: string;
  status?: InvoiceStatus;
}): BillingInvoice[] {
  let result = [...invoices.values()];
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((i) => i.accountId === accountId);
  }
  if (filter?.status) {
    result = result.filter((i) => i.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneInvoice);
}

export function clearInvoices(): void {
  invoices.clear();
}
