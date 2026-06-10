/**
 * V10.1 Payment Gateway Runtime — verification
 */
import {
  PAYMENT_GATEWAY_RUNTIME_VERSION,
  PAYMENT_READINESS_VERSION,
  PAYMENT_GATEWAY_IDS,
  runPaymentGatewayRuntime,
  validatePaymentGatewayRuntime,
  assertRuntimeSuccess,
} from "../lib/payment-readiness";

const DEPLOYMENT_ID = "v101-payment-gateway-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validatePaymentGatewayRuntime();
  assert(validation.adaptersValid, "adapters valid");
  assert(validation.interfaceValid, "interface valid");
  console.log("✓ payment gateway validation");

  const result = runPaymentGatewayRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === PAYMENT_READINESS_VERSION, "readiness version");
  assert(result.payload.version === PAYMENT_GATEWAY_RUNTIME_VERSION, "gateway version");
  assert(result.payload.adapters.length === 5, "five adapters");
  assert(
    result.payload.supportedGateways.length === PAYMENT_GATEWAY_IDS.length,
    "supported gateways",
  );
  for (const adapter of result.payload.adapters) {
    const checkout = adapter.createCheckout({
      orderId: "verify-order",
      amount: 100,
      currency: "CNY",
      customerId: "verify-customer",
      returnUrl: "https://app.local/result",
    });
    assert(checkout.mode === "readiness-stub", `${adapter.gatewayId} stub mode`);
  }
  console.log("✓ payment gateway runtime");
  console.log(`PASS — ${result.summary}`);
}

main();
