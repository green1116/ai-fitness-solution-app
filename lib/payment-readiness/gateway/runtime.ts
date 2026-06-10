import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  PaymentReadinessRuntimeResult,
  PaymentReadinessStageResult,
} from "../shared/types";
import { PAYMENT_READINESS_VERSION } from "../shared/types";
import {
  buildPaymentGatewayAdapters,
  PAYMENT_GATEWAY_IDS,
} from "./adapters";
import type { PaymentGatewayRuntimePayload } from "./types";
import { PAYMENT_GATEWAY_RUNTIME_VERSION } from "./types";

const SAMPLE_CHECKOUT = {
  orderId: "order-readiness-sample",
  amount: 29900,
  currency: "CNY",
  customerId: "customer-readiness-sample",
  returnUrl: "https://app.local/result",
};

export function validatePaymentGatewayRuntime(): {
  adaptersValid: boolean;
  interfaceValid: boolean;
} {
  const adapters = buildPaymentGatewayAdapters();

  const interfaceValid = adapters.every((adapter) => {
    const checkout = adapter.createCheckout(SAMPLE_CHECKOUT);
    const verify = adapter.verifyPayment({
      paymentId: `pay-${adapter.gatewayId}`,
      orderId: SAMPLE_CHECKOUT.orderId,
    });
    const refund = adapter.refundPayment({
      paymentId: `pay-${adapter.gatewayId}`,
      amount: 29900,
      reason: "readiness-verify",
    });
    const sync = adapter.syncSubscription({
      subscriptionId: `sub-${adapter.gatewayId}`,
      externalSubscriptionId: `ext-${adapter.gatewayId}`,
    });

    return (
      checkout.mode === "readiness-stub" &&
      checkout.status === "created" &&
      verify.verified === true &&
      refund.mode === "readiness-stub" &&
      sync.synced === true
    );
  });

  return {
    adaptersValid:
      adapters.length === PAYMENT_GATEWAY_IDS.length &&
      adapters.every((adapter) => adapter.readinessLevel === "contract-ready"),
    interfaceValid,
  };
}

export function runPaymentGatewayRuntime(input?: {
  deploymentId?: string;
}): PaymentReadinessRuntimeResult<PaymentGatewayRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "payment-gateway-default";
  const stages: PaymentReadinessStageResult[] = [];

  const adapters = runStage(
    "gateway-adapters",
    "Payment Gateway Adapters",
    () => buildPaymentGatewayAdapters(),
    stages,
  );

  runStage(
    "gateway-interface",
    "Gateway Interface Contract",
    () => {
      for (const adapter of adapters) {
        adapter.createCheckout(SAMPLE_CHECKOUT);
        adapter.verifyPayment({
          paymentId: `pay-${deploymentId}-${adapter.gatewayId}`,
          orderId: SAMPLE_CHECKOUT.orderId,
        });
        adapter.refundPayment({
          paymentId: `pay-${deploymentId}-${adapter.gatewayId}`,
          amount: 29900,
          reason: "contract-check",
        });
        adapter.syncSubscription({
          subscriptionId: `sub-${deploymentId}-${adapter.gatewayId}`,
          externalSubscriptionId: `ext-${adapter.gatewayId}`,
        });
      }
      return true;
    },
    stages,
  );

  const validation = runStage(
    "gateway-validate",
    "Gateway Validation",
    () => validatePaymentGatewayRuntime(),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Payment gateway runtime validation failed");
  }

  const payload: PaymentGatewayRuntimePayload = {
    version: PAYMENT_GATEWAY_RUNTIME_VERSION,
    readinessVersion: PAYMENT_READINESS_VERSION,
    adapters,
    supportedGateways: [...PAYMENT_GATEWAY_IDS],
    summary: `payment-gateway-runtime adapters=${adapters.length} gateways=${PAYMENT_GATEWAY_IDS.join(",")}`,
  };

  return finalizeRuntime({
    domain: "payment-gateway",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
