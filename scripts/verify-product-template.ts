/**
 * Product Template — Template Management verification
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
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../lib/product/customer-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID } from "../lib/product/analytics-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID } from "../lib/product/admin-baseline/freeze/freeze.lock";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../lib/product/notification/foundation/foundation.constants";
import {
  PRODUCT_TEMPLATE_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_BASE,
  PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_ID,
  PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
  TEMPLATE_DEFINITION_KINDS,
  TEMPLATE_DEFINITION_STATUSES,
  TEMPLATE_MANAGER_STATUSES,
  TEMPLATE_PUBLISH_STATUSES,
  TEMPLATE_READINESS_VERDICTS,
  TEMPLATE_VARIABLE_TYPES,
  TEMPLATE_VARIANT_LOCALES,
} from "../lib/product/template/management/management.constants";
import {
  assertProductTemplateReleaseGatePass,
  checkProductTemplateReleaseGate,
} from "../lib/product/template/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/template/management/management.constants.ts",
    "lib/product/template/management/management.types.ts",
    "lib/product/template/management/management.readiness.ts",
    "lib/product/template/definition/definition.types.ts",
    "lib/product/template/definition/definition.registry.ts",
    "lib/product/template/variant/variant.types.ts",
    "lib/product/template/variant/variant.registry.ts",
    "lib/product/template/variable/variable.types.ts",
    "lib/product/template/variable/variable.registry.ts",
    "lib/product/template/publish/publish.types.ts",
    "lib/product/template/publish/publish.registry.ts",
    "lib/product/template/template.manager.ts",
    "lib/product/template/verify/product.release.gate.ts",
    "lib/product/template/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_TEMPLATE_MANAGEMENT_ID ===
      "enterprise-product-template-management-v1",
    "template management id",
  );
  check(
    PRODUCT_TEMPLATE_MANAGEMENT_VERSION === "product-template-1",
    "template management version",
  );
  check(
    PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION ===
      "product-template-management-freeze-1",
    "template management freeze",
  );
  check(
    PRODUCT_TEMPLATE_MANAGEMENT_BASE === PRODUCT_NOTIFICATION_FOUNDATION_ID,
    "template base = notification foundation",
  );
  check(
    PRODUCT_TEMPLATE_FREEZE_VERSION ===
      "product-template-management-freeze-1",
    "template freeze tag",
  );
  check(
    PRODUCT_NOTIFICATION_FOUNDATION_ID ===
      "enterprise-product-notification-foundation-v1",
    "notification foundation preserved",
  );
  check(
    ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID ===
      "enterprise-product-admin-baseline-v1",
    "admin baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID ===
      "enterprise-product-analytics-baseline-v1",
    "analytics baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
      "enterprise-product-customer-baseline-v1",
    "customer baseline preserved",
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
  check(TEMPLATE_DEFINITION_KINDS.length === 4, "definition kinds");
  check(TEMPLATE_DEFINITION_STATUSES.length === 3, "definition statuses");
  check(TEMPLATE_VARIANT_LOCALES.length === 3, "variant locales");
  check(TEMPLATE_VARIABLE_TYPES.length === 4, "variable types");
  check(TEMPLATE_PUBLISH_STATUSES.length === 4, "publish statuses");
  check(TEMPLATE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(TEMPLATE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductTemplateReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductTemplateReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Template Management ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
