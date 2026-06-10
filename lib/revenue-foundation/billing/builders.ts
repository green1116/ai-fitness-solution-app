import type {
  BillingHistory,
  BillingHistoryEvent,
  BillingSnapshot,
  BillingSummary,
} from "./types";

function offsetMinutes(isoDate: string, minutes: number): string {
  return new Date(new Date(isoDate).getTime() + minutes * 60_000).toISOString();
}

export function buildBillingSnapshot(input?: {
  deploymentId?: string;
}): BillingSnapshot {
  const deploymentId = input?.deploymentId ?? "billing-default";
  return {
    snapshotId: `billing-snapshot-${deploymentId}`,
    customerId: `customer-${deploymentId}`,
    activeSubscriptions: 2,
    outstandingBalance: 31754,
    collectedRevenue: 1328540,
    currency: "CNY",
    lastInvoiceStatus: "issued",
    asOf: new Date().toISOString(),
  };
}

export function buildBillingHistory(input?: {
  deploymentId?: string;
}): BillingHistory {
  const deploymentId = input?.deploymentId ?? "billing-default";
  const base = new Date().toISOString();

  const events: BillingHistoryEvent[] = [
    {
      eventId: `billing-event-${deploymentId}-0`,
      kind: "subscription-started",
      amount: 299000,
      currency: "CNY",
      occurredAt: offsetMinutes(base, -43200),
      referenceId: `subscription-annual-${deploymentId}`,
      note: "Pro 年付订阅开通",
    },
    {
      eventId: `billing-event-${deploymentId}-1`,
      kind: "invoice-issued",
      amount: 299000,
      currency: "CNY",
      occurredAt: offsetMinutes(base, -43100),
      referenceId: `invoice-${deploymentId}-1`,
      note: "年付发票已开具",
    },
    {
      eventId: `billing-event-${deploymentId}-2`,
      kind: "payment-received",
      amount: 317540,
      currency: "CNY",
      occurredAt: offsetMinutes(base, -43000),
      referenceId: `invoice-${deploymentId}-1`,
      note: "支付到账（描述层占位）",
    },
    {
      eventId: `billing-event-${deploymentId}-3`,
      kind: "renewal-scheduled",
      amount: 299000,
      currency: "CNY",
      occurredAt: offsetMinutes(base, -10080),
      referenceId: `renewal-subscription-annual-${deploymentId}`,
      note: "续费已排期",
    },
    {
      eventId: `billing-event-${deploymentId}-4`,
      kind: "renewal-completed",
      amount: 299000,
      currency: "CNY",
      occurredAt: offsetMinutes(base, -1440),
      referenceId: `renewal-subscription-annual-${deploymentId}`,
      note: "续费完成",
    },
  ];

  return {
    historyId: `billing-history-${deploymentId}`,
    customerId: `customer-${deploymentId}`,
    events,
  };
}

export function buildBillingSummary(input?: {
  deploymentId?: string;
  snapshot?: BillingSnapshot;
  history?: BillingHistory;
}): BillingSummary {
  const deploymentId = input?.deploymentId ?? "billing-default";
  const snapshot = input?.snapshot ?? buildBillingSnapshot({ deploymentId });
  const history = input?.history ?? buildBillingHistory({ deploymentId });

  const totalCollected = history.events
    .filter((event) => event.kind === "payment-received" || event.kind === "renewal-completed")
    .reduce((sum, event) => sum + event.amount, 0);

  return {
    summaryId: `billing-summary-${deploymentId}`,
    totalEvents: history.events.length,
    totalCollected,
    outstandingBalance: snapshot.outstandingBalance,
    currency: snapshot.currency,
    summary: `billing-summary events=${history.events.length} collected=${totalCollected} outstanding=${snapshot.outstandingBalance}`,
  };
}
