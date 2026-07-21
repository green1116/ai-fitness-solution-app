/**
 * E12-P4 — Invoice Model
 */

import { INVOICE_STATUSES } from "./billing.constants";
import { getPricingPlan } from "./billing.plan";
import { evaluateAllQuotaBilling } from "./billing.quota";
import { getBillingSubscription } from "./billing.subscription";
import type {
  GenerateInvoiceInput,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
} from "./billing.types";

const invoices = new Map<string, Invoice>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneInvoice(invoice: Invoice): Invoice {
  return {
    ...invoice,
    lineItems: invoice.lineItems.map((li) => ({ ...li })),
    metadata: { ...invoice.metadata },
  };
}

export function generateInvoice(input: GenerateInvoiceInput): Invoice {
  const productTenantId = input.productTenantId.trim();
  const billingSubscriptionId = input.billingSubscriptionId.trim();

  const sub = getBillingSubscription(billingSubscriptionId);
  if (!sub || sub.productTenantId !== productTenantId) {
    throw new Error(`billing subscription not found: ${billingSubscriptionId}`);
  }
  if (sub.status !== "ACTIVE" && sub.status !== "PAST_DUE") {
    throw new Error(`invoice requires ACTIVE subscription (current=${sub.status})`);
  }

  const plan = getPricingPlan(sub.pricingPlanId);
  if (!plan) throw new Error(`pricing plan not found: ${sub.pricingPlanId}`);

  const lineItems: InvoiceLineItem[] = [
    {
      description: `${plan.name} (${plan.billingCycle})`,
      quantity: 1,
      unitPrice: plan.basePrice,
      amount: plan.basePrice,
    },
  ];

  const quotaResults = evaluateAllQuotaBilling(billingSubscriptionId);
  for (const qr of quotaResults) {
    if (qr.overageCharge > 0) {
      lineItems.push({
        description: `${qr.meter} overage (${qr.overage} units)`,
        quantity: qr.overage,
        unitPrice: qr.overageCharge / qr.overage,
        amount: qr.overageCharge,
      });
    }
  }

  const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);
  const taxRate = input.taxRate ?? 0;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const id = input.id?.trim() || createId("inv");
  if (invoices.has(id)) throw new Error(`invoice already exists: ${id}`);

  const invoice: Invoice = {
    id,
    productTenantId,
    billingSubscriptionId,
    pricingPlanId: plan.id,
    status: "DRAFT",
    currency: plan.currency,
    subtotal,
    tax,
    total,
    lineItems,
    periodStart: input.periodStart ?? sub.currentPeriodStart,
    periodEnd: input.periodEnd ?? sub.currentPeriodEnd,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  invoices.set(id, invoice);
  return cloneInvoice(invoice);
}

export function issueInvoice(id: string): Invoice {
  const invoice = invoices.get(id.trim());
  if (!invoice) throw new Error(`invoice not found: ${id}`);
  if (invoice.status !== "DRAFT") {
    throw new Error(`issue requires DRAFT (current=${invoice.status})`);
  }
  invoice.status = "ISSUED";
  invoice.issuedAt = nowIso();
  invoices.set(invoice.id, invoice);
  return cloneInvoice(invoice);
}

export function markInvoicePaid(id: string): Invoice {
  const invoice = invoices.get(id.trim());
  if (!invoice) throw new Error(`invoice not found: ${id}`);
  if (invoice.status !== "ISSUED") {
    throw new Error(`pay requires ISSUED (current=${invoice.status})`);
  }
  invoice.status = "PAID";
  invoice.paidAt = nowIso();
  invoices.set(invoice.id, invoice);
  return cloneInvoice(invoice);
}

export function getInvoice(id: string): Invoice | undefined {
  const invoice = invoices.get(id.trim());
  return invoice ? cloneInvoice(invoice) : undefined;
}

export function listInvoices(filter?: {
  productTenantId?: string;
  billingSubscriptionId?: string;
  status?: InvoiceStatus;
}): Invoice[] {
  let result = [...invoices.values()];
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((i) => i.productTenantId === tid);
  }
  if (filter?.billingSubscriptionId) {
    const sid = filter.billingSubscriptionId.trim();
    result = result.filter((i) => i.billingSubscriptionId === sid);
  }
  if (filter?.status) result = result.filter((i) => i.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneInvoice);
}

export function clearInvoices(): void {
  invoices.clear();
}
