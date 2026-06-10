import type {
  InvoiceSettlementRecord,
  InvoiceSettlementState,
  InvoiceSettlementStatus,
  InvoiceSettlementTransition,
} from "./types";

export const INVOICE_SETTLEMENT_STATUSES: InvoiceSettlementStatus[] = [
  "pending",
  "paid",
  "overdue",
  "refunded",
];

const STATE_DEFS: Record<
  InvoiceSettlementStatus,
  { label: string; description: string; terminal: boolean }
> = {
  pending: {
    label: "待结算",
    description: "发票已开具，等待付款",
    terminal: false,
  },
  paid: {
    label: "已结清",
    description: "付款已确认，发票结清",
    terminal: true,
  },
  overdue: {
    label: "逾期",
    description: "超过付款期限未结清",
    terminal: false,
  },
  refunded: {
    label: "已退款",
    description: "付款已退回，发票冲销",
    terminal: true,
  },
};

export function buildInvoiceSettlementStates(): InvoiceSettlementState[] {
  return INVOICE_SETTLEMENT_STATUSES.map((status) => ({
    status,
    ...STATE_DEFS[status],
  }));
}

export function buildInvoiceSettlementTransitions(): InvoiceSettlementTransition[] {
  return [
    { from: "pending", to: "paid", trigger: "payment.succeeded" },
    { from: "pending", to: "overdue", trigger: "invoice.overdue" },
    { from: "paid", to: "refunded", trigger: "refund.completed" },
    { from: "overdue", to: "paid", trigger: "payment.succeeded" },
  ];
}

export function buildInvoiceSettlementRecords(input?: {
  deploymentId?: string;
}): InvoiceSettlementRecord[] {
  const deploymentId = input?.deploymentId ?? "invoice-settlement-default";
  const now = new Date().toISOString();

  const specs: Array<{ status: InvoiceSettlementStatus; amount: number }> = [
    { status: "pending", amount: 29900 },
    { status: "paid", amount: 299000 },
    { status: "overdue", amount: 29900 },
    { status: "refunded", amount: 99900 },
  ];

  return specs.map((spec, index) => ({
    recordId: `settlement-${deploymentId}-${index}`,
    invoiceId: `invoice-${deploymentId}-${index}`,
    status: spec.status,
    amount: spec.amount,
    currency: "CNY",
    updatedAt: now,
    mode: "readiness-stub" as const,
  }));
}
