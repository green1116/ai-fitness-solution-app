/**
 * Product Admin Audit — Admin Traceability Release Gate
 * MODULE: Admin Audit
 * BASE: enterprise-product-compliance-governance-v1
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
import { PRODUCT_COMPLIANCE_GOVERNANCE_ID } from "../../compliance/governance/governance.constants";
import { PRODUCT_OPERATIONS_CONSOLE_ID } from "../../operations/console/console.constants";
import { PRODUCT_SYSTEM_CONFIGURATION_ID } from "../../configuration/management/management.constants";
import { PRODUCT_TENANT_ADMINISTRATION_ID } from "../../tenant/administration/administration.constants";
import { PRODUCT_USER_ADMINISTRATION_ID } from "../../user/administration/administration.constants";
import {
  assertAdminAuditReadinessReady,
  clearAdminAuditLayer,
  createAdminAuditManager,
  getAdminAuditRegistryManifest,
} from "../admin-audit.manager";
import {
  ADMIN_AUDIT_CATEGORIES,
  ADMIN_AUDIT_MANAGER_STATUSES,
  ADMIN_AUDIT_READINESS_VERDICTS,
  ADMIN_AUDIT_SEVERITIES,
  ADMIN_INTEGRITY_RESULTS,
  ADMIN_TRAIL_STATUSES,
  PRODUCT_ADMIN_AUDIT_BASE,
  PRODUCT_ADMIN_AUDIT_FREEZE_TAG,
  PRODUCT_ADMIN_AUDIT_FREEZE_VERSION,
  PRODUCT_ADMIN_AUDIT_ID,
  PRODUCT_ADMIN_AUDIT_VERSION,
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

export const PRODUCT_ADMIN_AUDIT_SIGNOFF_VERSION =
  "product-admin-audit-signoff-1" as const;

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
  clearAdminAuditLayer();
}

export function checkProductAdminAuditReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "ADA-CONSTANTS",
      "traceability",
      "Product admin audit version constants",
      PRODUCT_ADMIN_AUDIT_ID === "enterprise-product-admin-audit-v1" &&
        PRODUCT_ADMIN_AUDIT_VERSION === "product-admin-audit-1" &&
        PRODUCT_ADMIN_AUDIT_BASE === PRODUCT_COMPLIANCE_GOVERNANCE_ID &&
        PRODUCT_ADMIN_AUDIT_FREEZE_VERSION ===
          "product-admin-audit-freeze-1" &&
        PRODUCT_ADMIN_AUDIT_FREEZE_TAG === "product-admin-audit-freeze-1" &&
        ADMIN_AUDIT_CATEGORIES.length === 6 &&
        ADMIN_AUDIT_SEVERITIES.length === 3 &&
        ADMIN_TRAIL_STATUSES.length === 3 &&
        ADMIN_INTEGRITY_RESULTS.length === 2 &&
        ADMIN_AUDIT_READINESS_VERDICTS.length === 3 &&
        ADMIN_AUDIT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_ADMIN_AUDIT_ID} base=${PRODUCT_ADMIN_AUDIT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "ADA-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "ADA-CMP-BASE",
      "product-compliance-governance",
      "Compliance governance BASE preserved",
      PRODUCT_ADMIN_AUDIT_BASE ===
        "enterprise-product-compliance-governance-v1" &&
        PRODUCT_COMPLIANCE_GOVERNANCE_ID ===
          "enterprise-product-compliance-governance-v1" &&
        PRODUCT_OPERATIONS_CONSOLE_ID ===
          "enterprise-product-operations-console-v1" &&
        PRODUCT_SYSTEM_CONFIGURATION_ID ===
          "enterprise-product-system-configuration-v1" &&
        PRODUCT_USER_ADMINISTRATION_ID ===
          "enterprise-product-user-administration-v1" &&
        PRODUCT_TENANT_ADMINISTRATION_ID ===
          "enterprise-product-tenant-administration-v1" &&
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
      `base=${PRODUCT_ADMIN_AUDIT_BASE}`,
    ),
  );

  checks.push(
    check(
      "ADA-UPSTREAM",
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
    const mgr = createAdminAuditManager({ managerId: "prod-ada-gate" });
    mgr.initialize();
    mgr.start();

    const event = mgr.recordAdminAuditEvent({
      id: "ada.gate.evt",
      category: "COMPLIANCE",
      subjectId: "cmp.gate.fw",
      action: "RUN_ASSESSMENT",
      resource: "compliance/assessment/cmp.gate.asm",
      severity: "INFO",
    });
    const trail = mgr.appendAdminTrail({
      id: "ada.gate.trl",
      eventId: event.id,
    });
    const seal = mgr.sealAdminTrail({
      id: "ada.gate.sel",
      trailId: trail.id,
    });
    const verified = mgr.verifyAdminSeal({ sealId: seal.id });
    const query = mgr.queryAdminAudit({
      id: "ada.gate.qry",
      category: "COMPLIANCE",
      subjectId: "cmp.gate.fw",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getAdminAuditRegistryManifest();

    const ok =
      verified.result === "INTACT" &&
      query.matchCount >= 1 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_ADMIN_AUDIT_ID &&
      registry.base === PRODUCT_ADMIN_AUDIT_BASE &&
      registry.eventCount >= 1 &&
      registry.trailCount >= 1 &&
      registry.sealCount >= 1 &&
      registry.queryCount >= 1;

    try {
      assertAdminAuditReadinessReady(readiness);
      checks.push(
        check(
          "ADA-STACK",
          "traceability",
          "Event / trail / integrity / query",
          ok,
          `readiness=${readiness.verdict} seal=${verified.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "ADA-STACK",
          "traceability",
          "Event / trail / integrity / query",
          false,
          error instanceof Error
            ? error.message
            : "product admin audit not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "ADA-STACK",
        "traceability",
        "Event / trail / integrity / query",
        false,
        error instanceof Error
          ? error.message
          : "product admin audit probe failed",
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
      `product-admin-audit-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAdminAuditReleaseGatePass(
  gate: ReleaseGateResult = checkProductAdminAuditReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product admin audit release gate failed: ${gate.summary}`,
    );
  }
}
