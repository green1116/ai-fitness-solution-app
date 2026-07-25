/**
 * Product Payment — readiness
 */

import { PRODUCT_USAGE_METERING_ID } from "../../metering/usage/usage.constants";
import { listCaptures } from "../capture/capture.registry";
import { listIntents } from "../intent/intent.registry";
import { listProviders } from "../provider/provider.registry";
import { listRefunds } from "../refund/refund.registry";
import { PRODUCT_PAYMENT_INTEGRATION_BASE } from "./integration.constants";
import type {
  PaymentReadinessCheck,
  PaymentReadinessResult,
} from "./integration.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): PaymentReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluatePaymentIntegrationReadiness(): PaymentReadinessResult {
  const checks: PaymentReadinessCheck[] = [];

  checks.push(
    check(
      "PAY-BASE",
      "foundation",
      "Usage metering baseline aligned",
      PRODUCT_PAYMENT_INTEGRATION_BASE === PRODUCT_USAGE_METERING_ID,
      `base=${PRODUCT_PAYMENT_INTEGRATION_BASE}`,
    ),
  );

  const providers = listProviders();
  checks.push(
    check(
      "PAY-PRV",
      "provider",
      "Active payment providers present",
      providers.some((p) => p.status === "ACTIVE"),
      `providers=${providers.length}`,
    ),
  );

  const intents = listIntents();
  checks.push(
    check(
      "PAY-INT",
      "intent",
      "Captured intents present",
      intents.some((i) => i.status === "CAPTURED"),
      `intents=${intents.length}`,
    ),
  );

  const captures = listCaptures();
  checks.push(
    check(
      "PAY-CAP",
      "capture",
      "Payment captures present",
      captures.length >= 1,
      `captures=${captures.length}`,
    ),
  );

  const refunds = listRefunds();
  checks.push(
    check(
      "PAY-RFD",
      "refund",
      "Refunds present",
      refunds.some(
        (r) => r.result === "REFUNDED" || r.result === "PARTIAL",
      ),
      `refunds=${refunds.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-payment readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertPaymentIntegrationReadinessReady(
  result: PaymentReadinessResult,
): asserts result is PaymentReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product payment integration not ready: ${result.summary}`,
    );
  }
}
