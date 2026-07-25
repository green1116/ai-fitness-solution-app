/**
 * Product Configuration — System Configuration verification
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
import { PRODUCT_ADMIN_FOUNDATION_ID } from "../lib/product/admin/foundation/foundation.constants";
import { PRODUCT_TENANT_ADMINISTRATION_ID } from "../lib/product/tenant/administration/administration.constants";
import { PRODUCT_USER_ADMINISTRATION_ID } from "../lib/product/user/administration/administration.constants";
import {
  CONFIG_NAMESPACE_SCOPES,
  CONFIG_NAMESPACE_STATUSES,
  CONFIG_OVERRIDE_TARGETS,
  CONFIG_PARAMETER_TYPES,
  CONFIG_RELEASE_STATUSES,
  CONFIGURATION_MANAGER_STATUSES,
  CONFIGURATION_READINESS_VERDICTS,
  PRODUCT_CONFIGURATION_FREEZE_VERSION,
  PRODUCT_SYSTEM_CONFIGURATION_BASE,
  PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION,
  PRODUCT_SYSTEM_CONFIGURATION_ID,
  PRODUCT_SYSTEM_CONFIGURATION_VERSION,
} from "../lib/product/configuration/management/management.constants";
import {
  assertProductConfigurationReleaseGatePass,
  checkProductConfigurationReleaseGate,
} from "../lib/product/configuration/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/configuration/management/management.constants.ts",
    "lib/product/configuration/management/management.types.ts",
    "lib/product/configuration/management/management.readiness.ts",
    "lib/product/configuration/namespace/namespace.types.ts",
    "lib/product/configuration/namespace/namespace.registry.ts",
    "lib/product/configuration/parameter/parameter.types.ts",
    "lib/product/configuration/parameter/parameter.registry.ts",
    "lib/product/configuration/override/override.types.ts",
    "lib/product/configuration/override/override.registry.ts",
    "lib/product/configuration/release/release.types.ts",
    "lib/product/configuration/release/release.registry.ts",
    "lib/product/configuration/configuration.manager.ts",
    "lib/product/configuration/verify/product.release.gate.ts",
    "lib/product/configuration/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_SYSTEM_CONFIGURATION_ID ===
      "enterprise-product-system-configuration-v1",
    "system configuration id",
  );
  check(
    PRODUCT_SYSTEM_CONFIGURATION_VERSION === "product-configuration-1",
    "system configuration version",
  );
  check(
    PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION ===
      "product-system-configuration-freeze-1",
    "system configuration freeze",
  );
  check(
    PRODUCT_SYSTEM_CONFIGURATION_BASE === PRODUCT_USER_ADMINISTRATION_ID,
    "configuration base = user administration",
  );
  check(
    PRODUCT_CONFIGURATION_FREEZE_VERSION ===
      "product-system-configuration-freeze-1",
    "configuration freeze tag",
  );
  check(
    PRODUCT_USER_ADMINISTRATION_ID ===
      "enterprise-product-user-administration-v1",
    "user administration preserved",
  );
  check(
    PRODUCT_TENANT_ADMINISTRATION_ID ===
      "enterprise-product-tenant-administration-v1",
    "tenant administration preserved",
  );
  check(
    PRODUCT_ADMIN_FOUNDATION_ID ===
      "enterprise-product-admin-foundation-v1",
    "admin foundation preserved",
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
  check(CONFIG_NAMESPACE_SCOPES.length === 3, "namespace scopes");
  check(CONFIG_NAMESPACE_STATUSES.length === 3, "namespace statuses");
  check(CONFIG_PARAMETER_TYPES.length === 4, "parameter types");
  check(CONFIG_OVERRIDE_TARGETS.length === 3, "override targets");
  check(CONFIG_RELEASE_STATUSES.length === 4, "release statuses");
  check(CONFIGURATION_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(CONFIGURATION_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductConfigurationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductConfigurationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product System Configuration ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
