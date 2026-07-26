/**
 * Product Partner — M08-P3 Partner Management verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_API_BASELINE_ID } from "../lib/product/api-baseline/freeze/freeze.lock";
import { PRODUCT_CONNECTOR_FRAMEWORK_ID } from "../lib/product/connector/management/management.constants";
import { PRODUCT_MARKETPLACE_FOUNDATION_ID } from "../lib/product/marketplace/management/management.constants";
import {
  PARTNER_ACCESS_STATUSES,
  PARTNER_AGREEMENT_STATUSES,
  PARTNER_KINDS,
  PARTNER_MANAGER_STATUSES,
  PARTNER_READINESS_VERDICTS,
  PARTNER_STATUSES,
  PRODUCT_PARTNER_FREEZE_TAG,
  PRODUCT_PARTNER_MANAGEMENT_BASE,
  PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PARTNER_MANAGEMENT_ID,
  PRODUCT_PARTNER_MANAGEMENT_VERSION,
} from "../lib/product/partner/management/management.constants";
import {
  assertProductPartnerReleaseGatePass,
  checkProductPartnerReleaseGate,
} from "../lib/product/partner/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/partner/management/management.constants.ts",
    "lib/product/partner/management/management.types.ts",
    "lib/product/partner/management/management.readiness.ts",
    "lib/product/partner/registry/partner.types.ts",
    "lib/product/partner/registry/partner.registry.ts",
    "lib/product/partner/profile/profile.types.ts",
    "lib/product/partner/profile/profile.registry.ts",
    "lib/product/partner/agreement/agreement.types.ts",
    "lib/product/partner/agreement/agreement.registry.ts",
    "lib/product/partner/access/access.types.ts",
    "lib/product/partner/access/access.registry.ts",
    "lib/product/partner/manifest/manifest.registry.ts",
    "lib/product/partner/partner.manager.ts",
    "lib/product/partner/verify/product.release.gate.ts",
    "lib/product/partner/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_PARTNER_MANAGEMENT_ID ===
      "enterprise-product-partner-management-v1",
    "partner management id",
  );
  check(
    PRODUCT_PARTNER_MANAGEMENT_VERSION === "product-partner-1",
    "partner management version",
  );
  check(
    PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION ===
      "product-partner-management-freeze-1",
    "partner management freeze",
  );
  check(
    PRODUCT_PARTNER_MANAGEMENT_BASE === PRODUCT_CONNECTOR_FRAMEWORK_ID,
    "partner base = connector framework",
  );
  check(
    PRODUCT_PARTNER_FREEZE_TAG === "product-partner-management-freeze-1",
    "partner freeze tag",
  );
  check(
    PRODUCT_CONNECTOR_FRAMEWORK_ID ===
      "enterprise-product-connector-framework-v1",
    "connector framework preserved",
  );
  check(
    PRODUCT_MARKETPLACE_FOUNDATION_ID ===
      "enterprise-product-marketplace-foundation-v1",
    "marketplace foundation preserved",
  );
  check(
    ENTERPRISE_PRODUCT_API_BASELINE_ID ===
      "enterprise-product-api-baseline-v1",
    "api baseline preserved",
  );
  check(PARTNER_KINDS.length === 4, "partner kinds");
  check(PARTNER_STATUSES.length === 4, "partner statuses");
  check(PARTNER_AGREEMENT_STATUSES.length === 4, "agreement statuses");
  check(PARTNER_ACCESS_STATUSES.length === 3, "access statuses");
  check(PARTNER_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(PARTNER_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductPartnerReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductPartnerReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Partner Management (M08-P3) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
