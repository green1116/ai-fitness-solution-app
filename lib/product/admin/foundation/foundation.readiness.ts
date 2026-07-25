/**
 * Product Admin — readiness
 */

import { ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID } from "../../analytics-baseline/freeze/freeze.lock";
import { listAdminOperators } from "../operator/operator.registry";
import { listAdminPolicies } from "../policy/policy.registry";
import { listAdminSettings } from "../setting/setting.registry";
import { listAdminTenants } from "../tenant/tenant.registry";
import { PRODUCT_ADMIN_FOUNDATION_BASE } from "./foundation.constants";
import type {
  AdminReadinessCheck,
  AdminReadinessResult,
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
): AdminReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateAdminFoundationReadiness(): AdminReadinessResult {
  const checks: AdminReadinessCheck[] = [];

  checks.push(
    check(
      "ADM-BASE",
      "foundation",
      "Analytics baseline aligned",
      PRODUCT_ADMIN_FOUNDATION_BASE ===
        ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID,
      `base=${PRODUCT_ADMIN_FOUNDATION_BASE}`,
    ),
  );

  const tenants = listAdminTenants();
  checks.push(
    check(
      "ADM-TNT",
      "tenant",
      "Active tenants present",
      tenants.some((t) => t.status === "ACTIVE"),
      `tenants=${tenants.length}`,
    ),
  );

  const settings = listAdminSettings();
  checks.push(
    check(
      "ADM-SET",
      "setting",
      "Settings present",
      settings.length >= 1,
      `settings=${settings.length}`,
    ),
  );

  const operators = listAdminOperators();
  checks.push(
    check(
      "ADM-OP",
      "operator",
      "Active operators present",
      operators.some((o) => o.status === "ACTIVE"),
      `operators=${operators.length}`,
    ),
  );

  const policies = listAdminPolicies();
  checks.push(
    check(
      "ADM-POL",
      "policy",
      "Enforced policies present",
      policies.some((p) => p.status === "ENFORCED"),
      `policies=${policies.length}`,
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
    summary: `product-admin readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAdminFoundationReadinessReady(
  result: AdminReadinessResult,
): asserts result is AdminReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product admin foundation not ready: ${result.summary}`,
    );
  }
}
