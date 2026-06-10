import type {
  CheckoutInput,
  CheckoutResult,
  PaymentGatewayAdapter,
  PaymentGatewayId,
  RefundPaymentInput,
  RefundPaymentResult,
  SyncSubscriptionInput,
  SyncSubscriptionResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./types";

const GATEWAY_META: Record<
  PaymentGatewayId,
  { displayName: string; urlPrefix: string }
> = {
  stripe: { displayName: "Stripe", urlPrefix: "https://checkout.stripe.com/stub" },
  paypal: { displayName: "PayPal", urlPrefix: "https://www.paypal.com/stub/checkout" },
  alipay: { displayName: "Alipay", urlPrefix: "https://openapi.alipay.com/stub" },
  wechat: { displayName: "WeChat Pay", urlPrefix: "https://pay.weixin.qq.com/stub" },
  "enterprise-procurement": {
    displayName: "Enterprise Procurement",
    urlPrefix: "https://procurement.enterprise.local/stub",
  },
};

function addMinutes(isoDate: string, minutes: number): string {
  return new Date(new Date(isoDate).getTime() + minutes * 60_000).toISOString();
}

function buildAdapter(gatewayId: PaymentGatewayId): PaymentGatewayAdapter {
  const meta = GATEWAY_META[gatewayId];

  return {
    gatewayId,
    displayName: meta.displayName,
    readinessLevel: "contract-ready",
    createCheckout(input: CheckoutInput): CheckoutResult {
      const checkoutId = `checkout-${gatewayId}-${input.orderId}`;
      return {
        mode: "readiness-stub",
        gatewayId,
        checkoutId,
        checkoutUrl: `${meta.urlPrefix}/${checkoutId}`,
        expiresAt: addMinutes(new Date().toISOString(), 30),
        status: "created",
      };
    },
    verifyPayment(input: VerifyPaymentInput): VerifyPaymentResult {
      return {
        mode: "readiness-stub",
        gatewayId,
        paymentId: input.paymentId,
        orderId: input.orderId,
        verified: true,
        status: "succeeded",
      };
    },
    refundPayment(input: RefundPaymentInput): RefundPaymentResult {
      return {
        mode: "readiness-stub",
        gatewayId,
        refundId: `refund-${gatewayId}-${input.paymentId}`,
        paymentId: input.paymentId,
        amount: input.amount,
        status: "pending",
      };
    },
    syncSubscription(input: SyncSubscriptionInput): SyncSubscriptionResult {
      return {
        mode: "readiness-stub",
        gatewayId,
        subscriptionId: input.subscriptionId,
        externalSubscriptionId: input.externalSubscriptionId,
        synced: true,
        status: "active",
      };
    },
  };
}

export const PAYMENT_GATEWAY_IDS: PaymentGatewayId[] = [
  "stripe",
  "paypal",
  "alipay",
  "wechat",
  "enterprise-procurement",
];

export function buildPaymentGatewayAdapters(): PaymentGatewayAdapter[] {
  return PAYMENT_GATEWAY_IDS.map(buildAdapter);
}

export function getPaymentGatewayAdapter(
  gatewayId: PaymentGatewayId,
): PaymentGatewayAdapter {
  return buildAdapter(gatewayId);
}
