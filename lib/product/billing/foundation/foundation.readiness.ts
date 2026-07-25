/**
 * Product Billing — readiness
 */

import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { listBillingAccounts } from "../account/account.registry";
import { listInvoices } from "../invoice/invoice.registry";
import { listPayments } from "../payment/payment.registry";
import { listBillingPlans } from "../plan/plan.registry";
import { PRODUCT_BILLING_FOUNDATION_BASE } from "./foundation.constants";
import type {
  BillingReadinessCheck,
  BillingReadinessResult,
} from "./foundation.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): BillingReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateBillingFoundationReadiness(): BillingReadinessResult {
  const checks: BillingReadinessCheck[] = [];

  checks.push(
    check(
      "BIL-BASE",
      "foundation",
      "Auth baseline aligned",
      PRODUCT_BILLING_FOUNDATION_BASE === ENTERPRISE_PRODUCT_AUTH_BASELINE_ID,
      `base=${PRODUCT_BILLING_FOUNDATION_BASE}`,
    ),
  );

  const accounts = listBillingAccounts();
  checks.push(
    check(
      "BIL-ACC",
      "account",
      "Active billing accounts present",
      accounts.some((a) => a.status === "ACTIVE"),
      `accounts=${accounts.length}`,
    ),
  );

  const plans = listBillingPlans();
  checks.push(
    check(
      "BIL-PLN",
      "plan",
      "Active billing plans present",
      plans.some((p) => p.active),
      `plans=${plans.length}`,
    ),
  );

  const invoices = listInvoices();
  checks.push(
    check(
      "BIL-INV",
      "invoice",
      "Paid or issued invoices present",
      invoices.some((i) => i.status === "PAID" || i.status === "ISSUED"),
      `invoices=${invoices.length}`,
    ),
  );

  const payments = listPayments();
  checks.push(
    check(
      "BIL-PAY",
      "payment",
      "Captured payments present",
      payments.some((p) => p.status === "CAPTURED"),
      `payments=${payments.length}`,
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
    summary: `product-billing readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertBillingFoundationReadinessReady(
  result: BillingReadinessResult,
): asserts result is BillingReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product billing foundation not ready: ${result.summary}`,
    );
  }
}
