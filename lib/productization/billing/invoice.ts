import type { Invoice, InvoiceStatus } from "./types";

function createInvoiceRecord(
  id: string,
  subscriptionId: string,
  status: InvoiceStatus,
  amount: number,
  dayOffset: number,
): Invoice {
  const issuedAt = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
  const dueAt = new Date(issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  const paidAt = status === "paid" ? dueAt.toISOString() : null;

  return {
    invoiceId: id,
    subscriptionId,
    status,
    amount,
    currency: "CNY",
    issuedAt: issuedAt.toISOString(),
    dueAt: dueAt.toISOString(),
    paidAt,
  };
}

export function buildInvoice(input?: {
  deploymentId?: string;
  subscriptionId?: string;
}): Invoice {
  const deploymentId = input?.deploymentId ?? "subscription-billing-default";
  const subscriptionId = input?.subscriptionId ?? `subscription-${deploymentId}`;
  return createInvoiceRecord(`invoice-${deploymentId}`, subscriptionId, "issued", 0, 0);
}

export function buildInvoices(input?: { deploymentId?: string }): Invoice[] {
  const deploymentId = input?.deploymentId ?? "subscription-billing-default";
  return [
    createInvoiceRecord(
      `invoice-draft-${deploymentId}`,
      `subscription-${deploymentId}-starter`,
      "draft",
      0,
      -5,
    ),
    createInvoiceRecord(
      `invoice-issued-${deploymentId}`,
      `subscription-${deploymentId}-professional`,
      "issued",
      0,
      0,
    ),
    createInvoiceRecord(
      `invoice-paid-${deploymentId}`,
      `subscription-${deploymentId}-enterprise`,
      "paid",
      0,
      -30,
    ),
    createInvoiceRecord(
      `invoice-overdue-${deploymentId}`,
      `subscription-${deploymentId}-starter`,
      "overdue",
      0,
      -45,
    ),
    createInvoiceRecord(
      `invoice-cancelled-${deploymentId}`,
      `subscription-${deploymentId}-professional`,
      "cancelled",
      0,
      -60,
    ),
  ];
}
