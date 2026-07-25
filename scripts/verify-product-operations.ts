/**
 * Product Operations — Operational Console verification
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
import { PRODUCT_SYSTEM_CONFIGURATION_ID } from "../lib/product/configuration/management/management.constants";
import { PRODUCT_TENANT_ADMINISTRATION_ID } from "../lib/product/tenant/administration/administration.constants";
import { PRODUCT_USER_ADMINISTRATION_ID } from "../lib/product/user/administration/administration.constants";
import {
  OPERATIONS_MANAGER_STATUSES,
  OPERATIONS_READINESS_VERDICTS,
  OPS_CONSOLE_KINDS,
  OPS_CONSOLE_STATUSES,
  OPS_DISPATCH_STATUSES,
  OPS_INCIDENT_SEVERITIES,
  OPS_INCIDENT_STATUSES,
  OPS_PLAYBOOK_KINDS,
  PRODUCT_OPERATIONS_CONSOLE_BASE,
  PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION,
  PRODUCT_OPERATIONS_CONSOLE_ID,
  PRODUCT_OPERATIONS_CONSOLE_VERSION,
  PRODUCT_OPERATIONS_FREEZE_VERSION,
} from "../lib/product/operations/console/console.constants";
import {
  assertProductOperationsReleaseGatePass,
  checkProductOperationsReleaseGate,
} from "../lib/product/operations/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/operations/console/console.constants.ts",
    "lib/product/operations/console/console.types.ts",
    "lib/product/operations/console/console.readiness.ts",
    "lib/product/operations/surface/surface.types.ts",
    "lib/product/operations/surface/surface.registry.ts",
    "lib/product/operations/incident/incident.types.ts",
    "lib/product/operations/incident/incident.registry.ts",
    "lib/product/operations/playbook/playbook.types.ts",
    "lib/product/operations/playbook/playbook.registry.ts",
    "lib/product/operations/dispatch/dispatch.types.ts",
    "lib/product/operations/dispatch/dispatch.registry.ts",
    "lib/product/operations/operations.manager.ts",
    "lib/product/operations/verify/product.release.gate.ts",
    "lib/product/operations/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_OPERATIONS_CONSOLE_ID ===
      "enterprise-product-operations-console-v1",
    "operations console id",
  );
  check(
    PRODUCT_OPERATIONS_CONSOLE_VERSION === "product-operations-1",
    "operations console version",
  );
  check(
    PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION ===
      "product-operations-console-freeze-1",
    "operations console freeze",
  );
  check(
    PRODUCT_OPERATIONS_CONSOLE_BASE === PRODUCT_SYSTEM_CONFIGURATION_ID,
    "operations base = system configuration",
  );
  check(
    PRODUCT_OPERATIONS_FREEZE_VERSION ===
      "product-operations-console-freeze-1",
    "operations freeze tag",
  );
  check(
    PRODUCT_SYSTEM_CONFIGURATION_ID ===
      "enterprise-product-system-configuration-v1",
    "system configuration preserved",
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
  check(OPS_CONSOLE_KINDS.length === 3, "console kinds");
  check(OPS_CONSOLE_STATUSES.length === 3, "console statuses");
  check(OPS_INCIDENT_SEVERITIES.length === 4, "incident severities");
  check(OPS_INCIDENT_STATUSES.length === 3, "incident statuses");
  check(OPS_PLAYBOOK_KINDS.length === 3, "playbook kinds");
  check(OPS_DISPATCH_STATUSES.length === 4, "dispatch statuses");
  check(OPERATIONS_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(OPERATIONS_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductOperationsReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductOperationsReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Operations Console ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
