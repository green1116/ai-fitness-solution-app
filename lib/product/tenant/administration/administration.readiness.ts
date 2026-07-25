/**
 * Product Tenant — readiness
 */

import { PRODUCT_ADMIN_FOUNDATION_ID } from "../../admin/foundation/foundation.constants";
import { listTenantIsolations } from "../isolation/isolation.registry";
import { listTenantLifecycles } from "../lifecycle/lifecycle.registry";
import { listTenantQuotas } from "../quota/quota.registry";
import { listTenantRecords } from "../record/record.registry";
import { PRODUCT_TENANT_ADMINISTRATION_BASE } from "./administration.constants";
import type {
  TenantReadinessCheck,
  TenantReadinessResult,
} from "./administration.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): TenantReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateTenantAdministrationReadiness(): TenantReadinessResult {
  const checks: TenantReadinessCheck[] = [];

  checks.push(
    check(
      "TNT-BASE",
      "administration",
      "Admin foundation aligned",
      PRODUCT_TENANT_ADMINISTRATION_BASE === PRODUCT_ADMIN_FOUNDATION_ID,
      `base=${PRODUCT_TENANT_ADMINISTRATION_BASE}`,
    ),
  );

  const records = listTenantRecords();
  checks.push(
    check(
      "TNT-RCD",
      "record",
      "Active tenant records present",
      records.some((r) => r.status === "ACTIVE"),
      `records=${records.length}`,
    ),
  );

  const quotas = listTenantQuotas();
  checks.push(
    check(
      "TNT-QTA",
      "quota",
      "Tenant quotas present",
      quotas.length >= 1,
      `quotas=${quotas.length}`,
    ),
  );

  const isolations = listTenantIsolations();
  checks.push(
    check(
      "TNT-ISO",
      "isolation",
      "Tenant isolations present",
      isolations.length >= 1,
      `isolations=${isolations.length}`,
    ),
  );

  const lifecycles = listTenantLifecycles();
  checks.push(
    check(
      "TNT-LC",
      "lifecycle",
      "Operational lifecycles present",
      lifecycles.some((l) => l.state === "OPERATIONAL"),
      `lifecycles=${lifecycles.length}`,
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
    summary: `product-tenant readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertTenantAdministrationReadinessReady(
  result: TenantReadinessResult,
): asserts result is TenantReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product tenant administration not ready: ${result.summary}`,
    );
  }
}
