/**
 * Product Customer — readiness
 */

import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../../billing-baseline/freeze/freeze.lock";
import { listLifecycleEvents } from "../lifecycle/lifecycle.registry";
import { listCustomers } from "../profile/profile.registry";
import { listRelationships } from "../relationship/relationship.registry";
import { listSegments } from "../segment/segment.registry";
import { PRODUCT_CUSTOMER_FOUNDATION_BASE } from "./foundation.constants";
import type {
  CustomerReadinessCheck,
  CustomerReadinessResult,
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
): CustomerReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateCustomerFoundationReadiness(): CustomerReadinessResult {
  const checks: CustomerReadinessCheck[] = [];

  checks.push(
    check(
      "CUS-BASE",
      "foundation",
      "Billing baseline aligned",
      PRODUCT_CUSTOMER_FOUNDATION_BASE ===
        ENTERPRISE_PRODUCT_BILLING_BASELINE_ID,
      `base=${PRODUCT_CUSTOMER_FOUNDATION_BASE}`,
    ),
  );

  const customers = listCustomers();
  checks.push(
    check(
      "CUS-PRF",
      "profile",
      "Active customers present",
      customers.some((c) => c.status === "ACTIVE"),
      `customers=${customers.length}`,
    ),
  );

  const relationships = listRelationships();
  checks.push(
    check(
      "CUS-REL",
      "relationship",
      "Customer relationships present",
      relationships.length >= 1,
      `relationships=${relationships.length}`,
    ),
  );

  const segments = listSegments();
  checks.push(
    check(
      "CUS-SEG",
      "segment",
      "Segment assignments present",
      segments.length >= 1,
      `segments=${segments.length}`,
    ),
  );

  const lifecycle = listLifecycleEvents();
  checks.push(
    check(
      "CUS-LFC",
      "lifecycle",
      "Lifecycle transitions present",
      lifecycle.some((e) => e.toStatus === "ACTIVE"),
      `lifecycle=${lifecycle.length}`,
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
    summary: `product-customer readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertCustomerFoundationReadinessReady(
  result: CustomerReadinessResult,
): asserts result is CustomerReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product customer foundation not ready: ${result.summary}`,
    );
  }
}
