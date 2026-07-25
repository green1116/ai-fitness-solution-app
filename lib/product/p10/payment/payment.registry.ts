/**
 * Product P10 — Payment registry
 */

import { PAYMENT_STATUSES } from "../subscription/subscription.constants";
import { getInvoice } from "../invoice/invoice.registry";
import type {
  CapturePaymentInput,
  Payment,
  UpdatePaymentStatusInput,
} from "./payment.types";

const payments = new Map<string, Payment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePayment(payment: Payment): Payment {
  return { ...payment, metadata: { ...payment.metadata } };
}

export function capturePayment(input: CapturePaymentInput): Payment {
  const invoiceId = input.invoiceId.trim();
  if (!invoiceId) throw new Error("payment.invoiceId is required");
  const invoice = getInvoice(invoiceId);
  if (!invoice) throw new Error(`invoice not found: ${invoiceId}`);

  const id = input.id?.trim() || createId("p10pay");
  if (payments.has(id)) {
    throw new Error(`payment already exists: ${id}`);
  }

  const method = (input.method ?? "CARD").trim() || "CARD";
  const status = PAYMENT_STATUSES[1];
  const payment: Payment = {
    id,
    invoiceId,
    subscriptionId: invoice.subscriptionId,
    amount: invoice.amount,
    method,
    status,
    detail: `status=${status} method=${method} amount=${invoice.amount}`,
    metadata: { ...(input.metadata ?? {}) },
    attemptedAt: nowIso(),
    capturedAt: nowIso(),
  };
  payments.set(id, payment);
  return clonePayment(payment);
}

export function updatePaymentStatus(
  input: UpdatePaymentStatusInput,
): Payment {
  const paymentId = input.paymentId.trim();
  if (!paymentId) throw new Error("payment.paymentId is required");
  if (!(PAYMENT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid payment status: ${input.status}`);
  }
  const existing = payments.get(paymentId);
  if (!existing) throw new Error(`payment not found: ${paymentId}`);

  const updated: Payment = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} method=${existing.method} amount=${existing.amount}`,
    metadata: { ...existing.metadata },
    capturedAt:
      input.status === "CAPTURED" ? nowIso() : existing.capturedAt,
  };
  payments.set(paymentId, updated);
  return clonePayment(updated);
}

export function getPayment(id: string): Payment | undefined {
  const payment = payments.get(id.trim());
  return payment ? clonePayment(payment) : undefined;
}

export function listPayments(filter?: {
  subscriptionId?: string;
}): Payment[] {
  let result = [...payments.values()];
  if (filter?.subscriptionId) {
    const sid = filter.subscriptionId.trim();
    result = result.filter((p) => p.subscriptionId === sid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePayment);
}

export function clearPayments(): void {
  payments.clear();
}
