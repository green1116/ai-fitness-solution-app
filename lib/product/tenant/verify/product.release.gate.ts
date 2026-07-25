/**
 * Product Tenant — Tenant Administration Release Gate
 * MODULE: Tenant Administration
 * BASE: enterprise-product-admin-foundation-v1
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
import { PRODUCT_ADMIN_FOUNDATION_ID } from "../../admin/foundation/foundation.constants";
import {
  assertTenantAdministrationReadinessReady,
  clearTenantAdministrationLayer,
  createTenantManager,
  getTenantRegistryManifest,
} from "../tenant.manager";
import {
  PRODUCT_TENANT_ADMINISTRATION_BASE,
  PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION,
  PRODUCT_TENANT_ADMINISTRATION_ID,
  PRODUCT_TENANT_ADMINISTRATION_VERSION,
  PRODUCT_TENANT_FREEZE_VERSION,
  TENANT_ISOLATION_MODES,
  TENANT_LIFECYCLE_STATES,
  TENANT_MANAGER_STATUSES,
  TENANT_QUOTA_RESOURCES,
  TENANT_READINESS_VERDICTS,
  TENANT_RECORD_STATUSES,
  TENANT_TIERS,
} from "../administration/administration.constants";

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

export const PRODUCT_TENANT_SIGNOFF_VERSION =
  "product-tenant-signoff-1" as const;

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
  clearTenantAdministrationLayer();
}

export function checkProductTenantReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "TNT-CONSTANTS",
      "administration",
      "Product tenant administration version constants",
      PRODUCT_TENANT_ADMINISTRATION_ID ===
        "enterprise-product-tenant-administration-v1" &&
        PRODUCT_TENANT_ADMINISTRATION_VERSION === "product-tenant-1" &&
        PRODUCT_TENANT_ADMINISTRATION_BASE === PRODUCT_ADMIN_FOUNDATION_ID &&
        PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION ===
          "product-tenant-administration-freeze-1" &&
        PRODUCT_TENANT_FREEZE_VERSION ===
          "product-tenant-administration-freeze-1" &&
        TENANT_TIERS.length === 3 &&
        TENANT_RECORD_STATUSES.length === 3 &&
        TENANT_QUOTA_RESOURCES.length === 3 &&
        TENANT_ISOLATION_MODES.length === 3 &&
        TENANT_LIFECYCLE_STATES.length === 4 &&
        TENANT_READINESS_VERDICTS.length === 3 &&
        TENANT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_TENANT_ADMINISTRATION_ID} base=${PRODUCT_TENANT_ADMINISTRATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "TNT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "TNT-ADM-BASE",
      "product-admin-foundation",
      "Admin foundation BASE preserved",
      PRODUCT_TENANT_ADMINISTRATION_BASE ===
        "enterprise-product-admin-foundation-v1" &&
        PRODUCT_ADMIN_FOUNDATION_ID ===
          "enterprise-product-admin-foundation-v1" &&
        ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID ===
          "enterprise-product-analytics-baseline-v1" &&
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
      `base=${PRODUCT_TENANT_ADMINISTRATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "TNT-UPSTREAM",
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
    const mgr = createTenantManager({ managerId: "prod-tnt-gate" });
    mgr.initialize();
    mgr.start();

    const record = mgr.registerRecord({
      id: "tnt.gate.rcd",
      code: "ACME_ENT",
      name: "Acme Enterprise",
      tier: "ENTERPRISE",
      adminTenantId: "adm.gate.tnt",
    });
    mgr.updateRecordStatus({ recordId: record.id, status: "ACTIVE" });
    mgr.setQuota({
      id: "tnt.gate.qta",
      recordId: record.id,
      resource: "USERS",
      limit: 500,
    });
    mgr.configureIsolation({
      id: "tnt.gate.iso",
      recordId: record.id,
      mode: "DEDICATED",
      region: "AP-EAST",
    });
    const lifecycle = mgr.createLifecycle({
      id: "tnt.gate.lc",
      recordId: record.id,
    });
    mgr.transitionLifecycle({
      lifecycleId: lifecycle.id,
      state: "OPERATIONAL",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getTenantRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.administrationId === PRODUCT_TENANT_ADMINISTRATION_ID &&
      registry.base === PRODUCT_TENANT_ADMINISTRATION_BASE &&
      registry.recordCount >= 1 &&
      registry.quotaCount >= 1 &&
      registry.isolationCount >= 1 &&
      registry.lifecycleCount >= 1;

    try {
      assertTenantAdministrationReadinessReady(readiness);
      checks.push(
        check(
          "TNT-STACK",
          "administration",
          "Record / quota / isolation / lifecycle",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "TNT-STACK",
          "administration",
          "Record / quota / isolation / lifecycle",
          false,
          error instanceof Error
            ? error.message
            : "product tenant not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "TNT-STACK",
        "administration",
        "Record / quota / isolation / lifecycle",
        false,
        error instanceof Error
          ? error.message
          : "product tenant probe failed",
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
      `product-tenant-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductTenantReleaseGatePass(
  gate: ReleaseGateResult = checkProductTenantReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product tenant release gate failed: ${gate.summary}`);
  }
}
