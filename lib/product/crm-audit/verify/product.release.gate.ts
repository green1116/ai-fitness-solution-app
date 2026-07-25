/**
 * Product CRM Audit — CRM Traceability Release Gate
 * MODULE: CRM Audit
 * BASE: enterprise-product-customer-insight-v1
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
import { PRODUCT_CUSTOMER_ACTIVITY_ID } from "../../customer-activity/activity/activity.constants";
import { PRODUCT_CUSTOMER_FOUNDATION_ID } from "../../customer/foundation/foundation.constants";
import { PRODUCT_CUSTOMER_INSIGHT_ID } from "../../customer-insight/insight/insight.constants";
import { PRODUCT_CUSTOMER_PROFILE_ID } from "../../customer-profile/profile/profile.constants";
import { PRODUCT_ORGANIZATION_MANAGEMENT_ID } from "../../organization/management/management.constants";
import { PRODUCT_RELATIONSHIP_MANAGEMENT_ID } from "../../relationship/management/management.constants";
import {
  assertCrmAuditReadinessReady,
  clearCrmAuditLayer,
  createCrmAuditManager,
  getCrmAuditRegistryManifest,
} from "../crm-audit.manager";
import {
  CRM_AUDIT_CATEGORIES,
  CRM_AUDIT_MANAGER_STATUSES,
  CRM_AUDIT_READINESS_VERDICTS,
  CRM_AUDIT_SEVERITIES,
  CRM_INTEGRITY_RESULTS,
  CRM_TRAIL_STATUSES,
  PRODUCT_CRM_AUDIT_BASE,
  PRODUCT_CRM_AUDIT_FREEZE_TAG,
  PRODUCT_CRM_AUDIT_FREEZE_VERSION,
  PRODUCT_CRM_AUDIT_ID,
  PRODUCT_CRM_AUDIT_VERSION,
} from "../traceability/traceability.constants";

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

export const PRODUCT_CRM_AUDIT_SIGNOFF_VERSION =
  "product-crm-audit-signoff-1" as const;

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
  clearCrmAuditLayer();
}

export function checkProductCrmAuditReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "CRAU-CONSTANTS",
      "traceability",
      "Product CRM audit version constants",
      PRODUCT_CRM_AUDIT_ID === "enterprise-product-crm-audit-v1" &&
        PRODUCT_CRM_AUDIT_VERSION === "product-crm-audit-1" &&
        PRODUCT_CRM_AUDIT_BASE === PRODUCT_CUSTOMER_INSIGHT_ID &&
        PRODUCT_CRM_AUDIT_FREEZE_VERSION === "product-crm-audit-freeze-1" &&
        PRODUCT_CRM_AUDIT_FREEZE_TAG === "product-crm-audit-freeze-1" &&
        CRM_AUDIT_CATEGORIES.length === 5 &&
        CRM_AUDIT_SEVERITIES.length === 3 &&
        CRM_TRAIL_STATUSES.length === 3 &&
        CRM_INTEGRITY_RESULTS.length === 2 &&
        CRM_AUDIT_READINESS_VERDICTS.length === 3 &&
        CRM_AUDIT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_CRM_AUDIT_ID} base=${PRODUCT_CRM_AUDIT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "CRAU-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "CRAU-CINS-BASE",
      "product-customer-insight",
      "Customer insight BASE preserved",
      PRODUCT_CRM_AUDIT_BASE ===
        "enterprise-product-customer-insight-v1" &&
        PRODUCT_CUSTOMER_INSIGHT_ID ===
          "enterprise-product-customer-insight-v1" &&
        PRODUCT_CUSTOMER_ACTIVITY_ID ===
          "enterprise-product-customer-activity-v1" &&
        PRODUCT_RELATIONSHIP_MANAGEMENT_ID ===
          "enterprise-product-relationship-management-v1" &&
        PRODUCT_CUSTOMER_PROFILE_ID ===
          "enterprise-product-customer-profile-v1" &&
        PRODUCT_ORGANIZATION_MANAGEMENT_ID ===
          "enterprise-product-organization-management-v1" &&
        PRODUCT_CUSTOMER_FOUNDATION_ID ===
          "enterprise-product-customer-foundation-v1" &&
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
      `base=${PRODUCT_CRM_AUDIT_BASE}`,
    ),
  );

  checks.push(
    check(
      "CRAU-UPSTREAM",
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
    const mgr = createCrmAuditManager({ managerId: "prod-crau-gate" });
    mgr.initialize();
    mgr.start();

    const event = mgr.recordCrmAuditEvent({
      id: "crau.gate.evt",
      category: "CUSTOMER",
      customerId: "cus.gate.prf",
      action: "UPDATE_PROFILE",
      resource: "customer-profile/identity",
      severity: "INFO",
    });
    const trail = mgr.appendCrmTrail({
      id: "crau.gate.trl",
      eventId: event.id,
    });
    const seal = mgr.sealCrmTrail({
      id: "crau.gate.sel",
      trailId: trail.id,
    });
    const verified = mgr.verifyCrmSeal({ sealId: seal.id });
    const query = mgr.queryCrmAudit({
      id: "crau.gate.qry",
      category: "CUSTOMER",
      customerId: "cus.gate.prf",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getCrmAuditRegistryManifest();

    const ok =
      verified.result === "INTACT" &&
      query.matchCount >= 1 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_CRM_AUDIT_ID &&
      registry.base === PRODUCT_CRM_AUDIT_BASE &&
      registry.eventCount >= 1 &&
      registry.trailCount >= 1 &&
      registry.sealCount >= 1 &&
      registry.queryCount >= 1;

    try {
      assertCrmAuditReadinessReady(readiness);
      checks.push(
        check(
          "CRAU-STACK",
          "traceability",
          "Event / trail / integrity / query",
          ok,
          `readiness=${readiness.verdict} seal=${verified.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "CRAU-STACK",
          "traceability",
          "Event / trail / integrity / query",
          false,
          error instanceof Error
            ? error.message
            : "product crm audit not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "CRAU-STACK",
        "traceability",
        "Event / trail / integrity / query",
        false,
        error instanceof Error
          ? error.message
          : "product crm audit probe failed",
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
      `product-crm-audit-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductCrmAuditReleaseGatePass(
  gate: ReleaseGateResult = checkProductCrmAuditReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product CRM audit release gate failed: ${gate.summary}`,
    );
  }
}
