import type { PaymentEventDefinition, PaymentEventKind, PaymentEventSample } from "./types";

export const PAYMENT_EVENT_KINDS: PaymentEventKind[] = [
  "checkout.created",
  "payment.succeeded",
  "payment.failed",
  "invoice.paid",
  "invoice.overdue",
  "subscription.created",
  "subscription.renewed",
  "subscription.cancelled",
];

const EVENT_META: Record<
  PaymentEventKind,
  { category: PaymentEventDefinition["category"]; description: string; idempotent: boolean }
> = {
  "checkout.created": {
    category: "checkout",
    description: "结账会话已创建，等待用户完成支付",
    idempotent: true,
  },
  "payment.succeeded": {
    category: "payment",
    description: "支付成功，触发权益开通",
    idempotent: true,
  },
  "payment.failed": {
    category: "payment",
    description: "支付失败，保留订单待重试",
    idempotent: true,
  },
  "invoice.paid": {
    category: "invoice",
    description: "发票已结清",
    idempotent: true,
  },
  "invoice.overdue": {
    category: "invoice",
    description: "发票逾期未付",
    idempotent: false,
  },
  "subscription.created": {
    category: "subscription",
    description: "订阅已创建",
    idempotent: true,
  },
  "subscription.renewed": {
    category: "subscription",
    description: "订阅已续费",
    idempotent: true,
  },
  "subscription.cancelled": {
    category: "subscription",
    description: "订阅已取消",
    idempotent: true,
  },
};

export function buildPaymentEventDefinitions(): PaymentEventDefinition[] {
  return PAYMENT_EVENT_KINDS.map((kind) => {
    const meta = EVENT_META[kind];
    return {
      kind,
      category: meta.category,
      description: meta.description,
      payloadSchema: `PaymentEventPayload.${kind.replace(/\./g, "_")}`,
      idempotent: meta.idempotent,
    };
  });
}

export function buildPaymentEventSamples(input?: {
  deploymentId?: string;
}): PaymentEventSample[] {
  const deploymentId = input?.deploymentId ?? "payment-events-default";
  const now = new Date().toISOString();

  return PAYMENT_EVENT_KINDS.map((kind, index) => ({
    eventId: `evt-${deploymentId}-${index}`,
    kind,
    occurredAt: now,
    referenceId: `ref-${kind}-${deploymentId}`,
    mode: "readiness-stub" as const,
  }));
}
