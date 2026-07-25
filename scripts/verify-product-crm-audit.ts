/**
 * Product CRM Audit — verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../lib/commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../lib/launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../lib/operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../lib/product/complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../lib/product/auth/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../lib/product/billing-baseline/freeze/freeze.lock";
import { PRODUCT_CUSTOMER_ACTIVITY_ID } from "../lib/product/customer-activity/activity/activity.constants";
import { PRODUCT_CUSTOMER_FOUNDATION_ID } from "../lib/product/customer/foundation/foundation.constants";
import { PRODUCT_CUSTOMER_INSIGHT_ID } from "../lib/product/customer-insight/insight/insight.constants";
import { PRODUCT_CUSTOMER_PROFILE_ID } from "../lib/product/customer-profile/profile/profile.constants";
import { PRODUCT_ORGANIZATION_MANAGEMENT_ID } from "../lib/product/organization/management/management.constants";
import { PRODUCT_RELATIONSHIP_MANAGEMENT_ID } from "../lib/product/relationship/management/management.constants";
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
} from "../lib/product/crm-audit/traceability/traceability.constants";
import {
  assertProductCrmAuditReleaseGatePass,
  checkProductCrmAuditReleaseGate,
} from "../lib/product/crm-audit/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/crm-audit/traceability/traceability.constants.ts",
    "lib/product/crm-audit/traceability/traceability.types.ts",
    "lib/product/crm-audit/traceability/traceability.readiness.ts",
    "lib/product/crm-audit/event/event.types.ts",
    "lib/product/crm-audit/event/event.registry.ts",
    "lib/product/crm-audit/trail/trail.types.ts",
    "lib/product/crm-audit/trail/trail.registry.ts",
    "lib/product/crm-audit/integrity/integrity.types.ts",
    "lib/product/crm-audit/integrity/integrity.registry.ts",
    "lib/product/crm-audit/query/query.types.ts",
    "lib/product/crm-audit/query/query.registry.ts",
    "lib/product/crm-audit/crm-audit.manager.ts",
    "lib/product/crm-audit/verify/product.release.gate.ts",
    "lib/product/crm-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_CRM_AUDIT_ID === "enterprise-product-crm-audit-v1",
    "crm audit id",
  );
  check(
    PRODUCT_CRM_AUDIT_VERSION === "product-crm-audit-1",
    "crm audit version",
  );
  check(
    PRODUCT_CRM_AUDIT_FREEZE_VERSION === "product-crm-audit-freeze-1",
    "crm audit freeze",
  );
  check(
    PRODUCT_CRM_AUDIT_BASE === PRODUCT_CUSTOMER_INSIGHT_ID,
    "crm audit base = customer insight",
  );
  check(
    PRODUCT_CRM_AUDIT_FREEZE_TAG === "product-crm-audit-freeze-1",
    "crm audit freeze tag",
  );
  check(
    PRODUCT_CUSTOMER_INSIGHT_ID ===
      "enterprise-product-customer-insight-v1",
    "customer insight preserved",
  );
  check(
    PRODUCT_CUSTOMER_ACTIVITY_ID ===
      "enterprise-product-customer-activity-v1",
    "customer activity preserved",
  );
  check(
    PRODUCT_RELATIONSHIP_MANAGEMENT_ID ===
      "enterprise-product-relationship-management-v1",
    "relationship management preserved",
  );
  check(
    PRODUCT_CUSTOMER_PROFILE_ID ===
      "enterprise-product-customer-profile-v1",
    "customer profile preserved",
  );
  check(
    PRODUCT_ORGANIZATION_MANAGEMENT_ID ===
      "enterprise-product-organization-management-v1",
    "organization management preserved",
  );
  check(
    PRODUCT_CUSTOMER_FOUNDATION_ID ===
      "enterprise-product-customer-foundation-v1",
    "customer foundation preserved",
  );
  check(
    ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
      "enterprise-product-billing-baseline-v1",
    "billing baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
      "enterprise-product-auth-baseline-v1",
    "auth baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1",
    "product complete preserved",
  );
  check(
    ENTERPRISE_OPERATIONS_COMPLETE_ID === "enterprise-operations-complete-v1",
    "operations complete preserved",
  );
  check(
    ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
      "enterprise-launch-readiness-complete-v1",
    "launch readiness complete preserved",
  );
  check(
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1",
    "commercialization complete preserved",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(CRM_AUDIT_CATEGORIES.length === 5, "crm audit categories");
  check(CRM_AUDIT_SEVERITIES.length === 3, "crm audit severities");
  check(CRM_TRAIL_STATUSES.length === 3, "crm trail statuses");
  check(CRM_INTEGRITY_RESULTS.length === 2, "crm integrity results");
  check(CRM_AUDIT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(CRM_AUDIT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductCrmAuditReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductCrmAuditReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product CRM Audit ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
