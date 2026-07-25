/**
 * Product P12 — Production Launch verification
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
import { PRODUCT_P11_COMMERCIAL_RELEASE_ID } from "../lib/product/p11/release/release.constants";
import {
  ADOPTION_LEVELS,
  LAUNCH_STATUSES,
  MONITORING_SEVERITIES,
  OPERATIONS_MODES,
  P12_MANAGER_STATUSES,
  P12_READINESS_VERDICTS,
  PRODUCT_P12_LAUNCH_FREEZE_VERSION,
  PRODUCT_P12_PRODUCTION_LAUNCH_BASE,
  PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION,
  PRODUCT_P12_PRODUCTION_LAUNCH_ID,
  PRODUCT_P12_PRODUCTION_LAUNCH_VERSION,
  READINESS_GATES,
  ROLLOUT_STRATEGIES,
  SUPPORT_PRIORITIES,
} from "../lib/product/p12/launch/launch.constants";
import {
  assertProductP12ReleaseGatePass,
  checkProductP12ReleaseGate,
} from "../lib/product/p12/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p12/launch/launch.constants.ts",
    "lib/product/p12/launch/launch.types.ts",
    "lib/product/p12/launch/launch.registry.ts",
    "lib/product/p12/launch/launch.readiness.ts",
    "lib/product/p12/readiness/readiness.types.ts",
    "lib/product/p12/readiness/readiness.registry.ts",
    "lib/product/p12/rollout/rollout.types.ts",
    "lib/product/p12/rollout/rollout.registry.ts",
    "lib/product/p12/adoption/adoption.types.ts",
    "lib/product/p12/adoption/adoption.registry.ts",
    "lib/product/p12/operations/operations.types.ts",
    "lib/product/p12/operations/operations.registry.ts",
    "lib/product/p12/monitoring/monitoring.types.ts",
    "lib/product/p12/monitoring/monitoring.registry.ts",
    "lib/product/p12/support/support.types.ts",
    "lib/product/p12/support/support.registry.ts",
    "lib/product/p12/launch.manager.ts",
    "lib/product/p12/verify/product.release.gate.ts",
    "lib/product/p12/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P12_PRODUCTION_LAUNCH_ID ===
      "enterprise-product-p12-production-launch-v1",
    "p12 production launch id",
  );
  check(
    PRODUCT_P12_PRODUCTION_LAUNCH_VERSION === "product-p12-1",
    "p12 production launch version",
  );
  check(
    PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION ===
      "product-p12-production-launch-freeze-1",
    "p12 production launch freeze",
  );
  check(
    PRODUCT_P12_PRODUCTION_LAUNCH_BASE === PRODUCT_P11_COMMERCIAL_RELEASE_ID,
    "p12 base = p11 commercial release",
  );
  check(
    PRODUCT_P12_LAUNCH_FREEZE_VERSION ===
      "product-p12-production-launch-freeze-1",
    "p12 freeze tag",
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
  check(LAUNCH_STATUSES.length === 6, "launch statuses");
  check(READINESS_GATES.length === 4, "readiness gates");
  check(ROLLOUT_STRATEGIES.length === 4, "rollout strategies");
  check(ADOPTION_LEVELS.length === 5, "adoption levels");
  check(OPERATIONS_MODES.length === 4, "operations modes");
  check(MONITORING_SEVERITIES.length === 4, "monitoring severities");
  check(SUPPORT_PRIORITIES.length === 4, "support priorities");
  check(P12_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P12_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP12ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP12ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P12 Production Launch ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
