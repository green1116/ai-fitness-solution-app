/**
 * Product Admin — Admin Foundation Release Gate
 * MODULE: Admin
 * BASE: enterprise-product-analytics-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../../billing-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../../customer-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID } from "../../analytics-baseline/freeze/freeze.lock";
import { PRODUCT_ANALYTICS_AUDIT_ID } from "../../analytics-audit/traceability/traceability.constants";
import { PRODUCT_ANALYTICS_FOUNDATION_ID } from "../../analytics/foundation/foundation.constants";
import {
  assertAdminFoundationReadinessReady,
  clearAdminFoundationLayer,
  createAdminManager,
  getAdminRegistryManifest,
} from "../admin.manager";
import {
  ADMIN_MANAGER_STATUSES,
  ADMIN_OPERATOR_ROLES,
  ADMIN_OPERATOR_STATUSES,
  ADMIN_POLICY_EFFECTS,
  ADMIN_POLICY_STATUSES,
  ADMIN_READINESS_VERDICTS,
  ADMIN_SETTING_SCOPES,
  ADMIN_TENANT_KINDS,
  ADMIN_TENANT_STATUSES,
  PRODUCT_ADMIN_FOUNDATION_BASE,
  PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ADMIN_FOUNDATION_ID,
  PRODUCT_ADMIN_FOUNDATION_VERSION,
  PRODUCT_ADMIN_FREEZE_VERSION,
} from "../foundation/foundation.constants";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_ADMIN_SIGNOFF_VERSION =
  "product-admin-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearAdminFoundationLayer();
}

export function checkProductAdminReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "ADM-CONSTANTS",
      "foundation",
      "Product admin foundation version constants",
      PRODUCT_ADMIN_FOUNDATION_ID ===
        "enterprise-product-admin-foundation-v1" &&
        PRODUCT_ADMIN_FOUNDATION_VERSION === "product-admin-1" &&
        PRODUCT_ADMIN_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID &&
        PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION ===
          "product-admin-foundation-freeze-1" &&
        PRODUCT_ADMIN_FREEZE_VERSION ===
          "product-admin-foundation-freeze-1" &&
        ADMIN_TENANT_KINDS.length === 3 &&
        ADMIN_TENANT_STATUSES.length === 3 &&
        ADMIN_SETTING_SCOPES.length === 3 &&
        ADMIN_OPERATOR_ROLES.length === 3 &&
        ADMIN_OPERATOR_STATUSES.length === 2 &&
        ADMIN_POLICY_EFFECTS.length === 3 &&
        ADMIN_POLICY_STATUSES.length === 2 &&
        ADMIN_READINESS_VERDICTS.length === 3 &&
        ADMIN_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_ADMIN_FOUNDATION_ID} base=${PRODUCT_ADMIN_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "ADM-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "ADM-ANL-BASE",
      "product-analytics-baseline",
      "Analytics baseline BASE preserved",
      PRODUCT_ADMIN_FOUNDATION_BASE ===
        "enterprise-product-analytics-baseline-v1" &&
        ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID ===
          "enterprise-product-analytics-baseline-v1" &&
        PRODUCT_ANALYTICS_AUDIT_ID ===
          "enterprise-product-analytics-audit-v1" &&
        PRODUCT_ANALYTICS_FOUNDATION_ID ===
          "enterprise-product-analytics-foundation-v1" &&
        ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
          "enterprise-product-customer-baseline-v1" &&
        ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
          "enterprise-product-billing-baseline-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_ADMIN_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "ADM-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createAdminManager({ managerId: "prod-adm-gate" });
    mgr.initialize();
    mgr.start();

    const tenant = mgr.registerTenant({
      id: "adm.gate.tnt",
      code: "ACME_PLATFORM",
      kind: "PLATFORM",
    });
    mgr.updateTenantStatus({
      tenantId: tenant.id,
      status: "ACTIVE",
    });
    const setting = mgr.registerSetting({
      id: "adm.gate.set",
      key: "ADMIN_CONSOLE_ENABLED",
      scope: "GLOBAL",
      value: "true",
    });
    mgr.registerOperator({
      id: "adm.gate.op",
      email: "admin@acme.example",
      role: "OWNER",
      tenantId: tenant.id,
    });
    const policy = mgr.registerPolicy({
      id: "adm.gate.pol",
      code: "REQUIRE_ADMIN_MFA",
      effect: "ALLOW",
      settingId: setting.id,
      tenantId: tenant.id,
    });
    mgr.enforcePolicy({ policyId: policy.id });

    const readiness = mgr.evaluateReadiness();
    const registry = getAdminRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_ADMIN_FOUNDATION_ID &&
      registry.base === PRODUCT_ADMIN_FOUNDATION_BASE &&
      registry.tenantCount >= 1 &&
      registry.settingCount >= 1 &&
      registry.operatorCount >= 1 &&
      registry.policyCount >= 1;

    try {
      assertAdminFoundationReadinessReady(readiness);
      checks.push(
        check(
          "ADM-STACK",
          "foundation",
          "Tenant / setting / operator / policy",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "ADM-STACK",
          "foundation",
          "Tenant / setting / operator / policy",
          false,
          error instanceof Error
            ? error.message
            : "product admin not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "ADM-STACK",
        "foundation",
        "Tenant / setting / operator / policy",
        false,
        error instanceof Error
          ? error.message
          : "product admin probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-admin-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAdminReleaseGatePass(
  gate: ReleaseGateResult = checkProductAdminReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product admin release gate failed: ${gate.summary}`);
  }
}
