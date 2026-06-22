/**
 * V59 SaaS — Invoice service
 */

import { saasDb } from "@/lib/saas/types";

export async function createInvoice(input: {
  organizationId: string;
  subscriptionId?: string;
  amount: number;
  currency?: string;
  stripeInvoiceId?: string;
}) {
  return saasDb().saasInvoice.create({
    data: {
      organizationId: input.organizationId,
      subscriptionId: input.subscriptionId,
      amount: input.amount,
      currency: input.currency ?? "usd",
      status: "DRAFT",
      stripeInvoiceId: input.stripeInvoiceId,
    },
  });
}

export async function markInvoicePaid(invoiceId: string) {
  return saasDb().saasInvoice.update({
    where: { id: invoiceId },
    data: { status: "PAID" },
  });
}

export async function listInvoicesForOrganization(organizationId: string) {
  return saasDb().saasInvoice.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
