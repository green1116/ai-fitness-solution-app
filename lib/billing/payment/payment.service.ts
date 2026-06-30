/**
 * V59.4 — Payment persistence
 */

import { prisma } from "@/lib/prisma";
import type { SaasPlan } from "@/lib/saas/types";

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
  return prisma.payment.create({
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
  const existing = await prisma.payment.findUnique({ where: { stripeSessionId } });
  if (!existing) return null;
  return prisma.payment.update({
    where: { stripeSessionId },
    data: { status: "paid" },
  });
}

export async function getPaymentBySessionId(stripeSessionId: string) {
  return prisma.payment.findUnique({ where: { stripeSessionId } });
}

export async function recordCheckoutPayment(input: {
  organizationId: string;
  stripeSessionId: string;
  amount: number;
  currency: string;
  plan: SaasPlan;
}) {
  const existing = await prisma.payment.findUnique({
    where: { stripeSessionId: input.stripeSessionId },
  });
  if (existing) return existing;

  return createPendingPayment({
    organizationId: input.organizationId,
    stripeSessionId: input.stripeSessionId,
    amount: input.amount,
    currency: input.currency,
  });
}
