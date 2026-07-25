/**
 * Product P11 — Commercial Release verification
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
import { PRODUCT_P10_SUBSCRIPTION_BILLING_ID } from "../lib/product/p10/subscription/subscription.constants";
import {
  DEPLOYMENT_STATUSES,
  ENVIRONMENT_KINDS,
  FEATURE_FLAGS,
  LICENSE_STATUSES,
  P11_MANAGER_STATUSES,
  P11_READINESS_VERDICTS,
  PRODUCT_P11_COMMERCIAL_FREEZE_VERSION,
  PRODUCT_P11_COMMERCIAL_RELEASE_BASE,
  PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION,
  PRODUCT_P11_COMMERCIAL_RELEASE_ID,
  PRODUCT_P11_COMMERCIAL_RELEASE_VERSION,
  RELEASE_STATUSES,
  TENANT_STATUSES,
  VERSION_CHANNELS,
} from "../lib/product/p11/release/release.constants";
import {
  assertProductP11ReleaseGatePass,
  checkProductP11ReleaseGate,
} from "../lib/product/p11/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p11/release/release.constants.ts",
    "lib/product/p11/release/release.types.ts",
    "lib/product/p11/release/release.registry.ts",
    "lib/product/p11/release/release.readiness.ts",
    "lib/product/p11/feature/feature.types.ts",
    "lib/product/p11/feature/feature.registry.ts",
    "lib/product/p11/version/version.types.ts",
    "lib/product/p11/version/version.registry.ts",
    "lib/product/p11/tenant/tenant.types.ts",
    "lib/product/p11/tenant/tenant.registry.ts",
    "lib/product/p11/environment/environment.types.ts",
    "lib/product/p11/environment/environment.registry.ts",
    "lib/product/p11/deployment/deployment.types.ts",
    "lib/product/p11/deployment/deployment.registry.ts",
    "lib/product/p11/license/license.types.ts",
    "lib/product/p11/license/license.registry.ts",
    "lib/product/p11/commercial.manager.ts",
    "lib/product/p11/verify/product.release.gate.ts",
    "lib/product/p11/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P11_COMMERCIAL_RELEASE_ID ===
      "enterprise-product-p11-commercial-release-v1",
    "p11 commercial release id",
  );
  check(
    PRODUCT_P11_COMMERCIAL_RELEASE_VERSION === "product-p11-1",
    "p11 commercial release version",
  );
  check(
    PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION ===
      "product-p11-commercial-release-freeze-1",
    "p11 commercial release freeze",
  );
  check(
    PRODUCT_P11_COMMERCIAL_RELEASE_BASE === PRODUCT_P10_SUBSCRIPTION_BILLING_ID,
    "p11 base = p10 subscription billing",
  );
  check(
    PRODUCT_P11_COMMERCIAL_FREEZE_VERSION ===
      "product-p11-commercial-release-freeze-1",
    "p11 freeze tag",
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
  check(RELEASE_STATUSES.length === 5, "release statuses");
  check(FEATURE_FLAGS.length === 4, "feature flags");
  check(VERSION_CHANNELS.length === 4, "version channels");
  check(TENANT_STATUSES.length === 4, "tenant statuses");
  check(ENVIRONMENT_KINDS.length === 4, "environment kinds");
  check(DEPLOYMENT_STATUSES.length === 5, "deployment statuses");
  check(LICENSE_STATUSES.length === 4, "license statuses");
  check(P11_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P11_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP11ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP11ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P11 Commercial Release ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
