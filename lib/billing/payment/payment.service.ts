/**
 * V59.4 — Payment persistence
 */

import { saasDb, type SaasPlan } from "@/lib/saas/types";

export type PaymentRow = {
  id: string;
  organizationId: string;
  stripeSessionId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function createPendingPayment(input: {
  organizationId: string;
  stripeSessionId: string;
  amount: number;
  currency?: string;
}): Promise<PaymentRow> {
  return saasDb().payment.create({
    data: {
      organizationId: input.organizationId,
      stripeSessionId: input.stripeSessionId,
      amount: input.amount,
      currency: input.currency ?? "usd",
      status: "pending",
    },
  });
}

export async function markPaymentPaid(stripeSessionId: string): Promise<PaymentRow | null> {
  const existing = await saasDb().payment.findBySessionId(stripeSessionId);
  if (!existing) return null;
  return saasDb().payment.update({
    where: { stripeSessionId },
    data: { status: "paid" },
  });
}

export async function getPaymentBySessionId(stripeSessionId: string) {
  return saasDb().payment.findBySessionId(stripeSessionId);
}

export async function recordCheckoutPayment(input: {
  organizationId: string;
  stripeSessionId: string;
  amount: number;
  currency: string;
  plan: SaasPlan;
}) {
  const existing = await saasDb().payment.findBySessionId(input.stripeSessionId);
  if (existing) return existing;

  return createPendingPayment({
    organizationId: input.organizationId,
    stripeSessionId: input.stripeSessionId,
    amount: input.amount,
    currency: input.currency,
  });
}
