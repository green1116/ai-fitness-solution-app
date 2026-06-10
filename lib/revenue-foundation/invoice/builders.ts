import type { InvoiceModel, InvoiceStatus, InvoiceSummary } from "./types";

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function buildInvoices(input?: { deploymentId?: string }): InvoiceModel[] {
  const deploymentId = input?.deploymentId ?? "invoice-default";
  const baseDate = new Date().toISOString();

  const specs: Array<{
    status: InvoiceStatus;
    subtotal: number;
    paid: boolean;
    offsetDays: number;
  }> = [
    { status: "draft", subtotal: 29900, paid: false, offsetDays: 0 },
    { status: "issued", subtotal: 299000, paid: false, offsetDays: -5 },
    { status: "paid", subtotal: 999000, paid: true, offsetDays: -30 },
    { status: "overdue", subtotal: 29900, paid: false, offsetDays: -45 },
    { status: "cancelled", subtotal: 0, paid: false, offsetDays: -10 },
  ];

  return specs.map((spec, index) => {
    const issuedAt = addDays(baseDate, spec.offsetDays);
    const tax = Math.round(spec.subtotal * 0.06);
    const total = spec.subtotal + tax;

    return {
      invoiceId: `invoice-${deploymentId}-${index}`,
      orderId: `order-${deploymentId}-${index}`,
      subscriptionId: `subscription-${deploymentId}-${index}`,
      customerId: `customer-${deploymentId}`,
      status: spec.status,
      subtotal: spec.subtotal,
      tax,
      total,
      currency: "CNY",
      issuedAt,
      dueAt: addDays(issuedAt, 15),
      paidAt: spec.paid ? addDays(issuedAt, 3) : null,
    };
  });
}

export function buildInvoiceSummary(input?: {
  deploymentId?: string;
  invoices?: InvoiceModel[];
}): InvoiceSummary {
  const deploymentId = input?.deploymentId ?? "invoice-default";
  const invoices = input?.invoices ?? buildInvoices({ deploymentId });

  const paidCount = invoices.filter((inv) => inv.status === "paid").length;
  const overdueCount = invoices.filter((inv) => inv.status === "overdue").length;
  const draftCount = invoices.filter((inv) => inv.status === "draft").length;
  const totalBilled = invoices
    .filter((inv) => inv.status !== "cancelled" && inv.status !== "void")
    .reduce((sum, inv) => sum + inv.total, 0);
  const totalCollected = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  return {
    summaryId: `invoice-summary-${deploymentId}`,
    totalInvoices: invoices.length,
    paidCount,
    overdueCount,
    draftCount,
    totalBilled,
    totalCollected,
    currency: "CNY",
    summary: `invoice-summary total=${invoices.length} paid=${paidCount} overdue=${overdueCount} billed=${totalBilled} collected=${totalCollected}`,
  };
}
