/**
 * V59 SaaS — Invoice service
 */

import { prisma } from "@/lib/prisma";

export async function createInvoice(input: {
  organizationId: string;
  subscriptionId?: string;
  amount: number;
  currency?: string;
  stripeInvoiceId?: string;
}) {
  let subscriptionId = input.subscriptionId;
  if (!subscriptionId) {
    const sub = await prisma.subscription.findFirst({
      where: { organizationId: input.organizationId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    subscriptionId = sub?.id;
  }
  if (!subscriptionId) {
    throw new Error("subscriptionId required for invoice");
  }

  return prisma.saasInvoice.create({
    data: {
      organizationId: input.organizationId,
      subscriptionId,
      amount: input.amount,
      currency: input.currency ?? "USD",
      status: "DRAFT",
    },
  });
}

export async function markInvoicePaid(invoiceId: string) {
  return prisma.saasInvoice.update({
    where: { id: invoiceId },
    data: { status: "PAID" },
  });
}

export async function listInvoicesForOrganization(organizationId: string) {
  return prisma.saasInvoice.findMany({
    where: { subscription: { organizationId } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
