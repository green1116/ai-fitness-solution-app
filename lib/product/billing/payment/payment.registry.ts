/**
 * Product Billing — Payment registry
 */

import {
  getInvoice,
  updateInvoiceStatus,
} from "../invoice/invoice.registry";
import { PAYMENT_STATUSES } from "../foundation/foundation.constants";
import type {
  BillingPayment,
  CapturePaymentInput,
  PaymentStatus,
  UpdatePaymentStatusInput,
} from "./payment.types";

const payments = new Map<string, BillingPayment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePayment(payment: BillingPayment): BillingPayment {
  return { ...payment, metadata: { ...payment.metadata } };
}

export function capturePayment(input: CapturePaymentInput): BillingPayment {
  const invoiceId = input.invoiceId.trim();
  if (!invoiceId) throw new Error("payment.invoiceId is required");

  const invoice = getInvoice(invoiceId);
  if (!invoice) throw new Error(`invoice not found: ${invoiceId}`);
  if (invoice.status !== "ISSUED") {
    throw new Error(`invoice not payable: ${invoiceId}`);
  }

  const succeed = input.succeed ?? true;
  const status: PaymentStatus = succeed ? "CAPTURED" : "FAILED";

  const id = input.id?.trim() || createId("bilpay");
  if (payments.has(id)) throw new Error(`payment already exists: ${id}`);

  const now = nowIso();
  const payment: BillingPayment = {
    id,
    invoiceId,
    accountId: invoice.accountId,
    amountCents: invoice.amountCents,
    currency: invoice.currency,
    status,
    detail: `status=${status} invoice=${invoiceId}`,
    metadata: { ...(input.metadata ?? {}) },
    attemptedAt: now,
    updatedAt: now,
  };
  payments.set(id, payment);

  if (succeed) {
    updateInvoiceStatus({ invoiceId, status: "PAID" });
  }

  return clonePayment(payment);
}

export function updatePaymentStatus(
  input: UpdatePaymentStatusInput,
): BillingPayment {
  const paymentId = input.paymentId.trim();
  if (!paymentId) throw new Error("payment.paymentId is required");
  if (!(PAYMENT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid payment status: ${input.status}`);
  }

  const existing = payments.get(paymentId);
  if (!existing) throw new Error(`payment not found: ${paymentId}`);

  const updated: BillingPayment = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} invoice=${existing.invoiceId}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  payments.set(paymentId, updated);
  return clonePayment(updated);
}

export function getPayment(id: string): BillingPayment | undefined {
  const payment = payments.get(id.trim());
  return payment ? clonePayment(payment) : undefined;
}

export function listPayments(filter?: {
  accountId?: string;
  status?: PaymentStatus;
}): BillingPayment[] {
  let result = [...payments.values()];
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((p) => p.accountId === accountId);
  }
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePayment);
}

export function clearPayments(): void {
  payments.clear();
}
