/**
 * Launch L1 — Demo Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../lib/commercialization/p8/freeze/freeze.lock";
import {
  ARTIFACT_KINDS,
  CUSTOMER_SEGMENTS,
  DEMO_LOAD_STATUSES,
  L1_MANAGER_STATUSES,
  L1_READINESS_VERDICTS,
  LAUNCH_L1_DEMO_FOUNDATION_BASE,
  LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION,
  LAUNCH_L1_DEMO_FOUNDATION_ID,
  LAUNCH_L1_DEMO_FOUNDATION_VERSION,
  LAUNCH_L1_DEMO_FREEZE_VERSION,
  PROJECT_SCENARIO_KINDS,
  TENANT_STATUSES,
} from "../lib/launch/readiness/l1/demo/demo.constants";
import {
  assertLaunchL1ReleaseGatePass,
  checkLaunchL1ReleaseGate,
} from "../lib/launch/readiness/l1/verify/launch.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/launch/readiness/l1/tenant/tenant.types.ts",
    "lib/launch/readiness/l1/tenant/tenant.registry.ts",
    "lib/launch/readiness/l1/customer/customer.types.ts",
    "lib/launch/readiness/l1/customer/customer.profile.ts",
    "lib/launch/readiness/l1/project/project.types.ts",
    "lib/launch/readiness/l1/project/project.scenario.ts",
    "lib/launch/readiness/l1/artifact/artifact.types.ts",
    "lib/launch/readiness/l1/artifact/artifact.registry.ts",
    "lib/launch/readiness/l1/demo/demo.constants.ts",
    "lib/launch/readiness/l1/demo/demo.types.ts",
    "lib/launch/readiness/l1/demo/demo.loader.ts",
    "lib/launch/readiness/l1/demo/demo.seed.ts",
    "lib/launch/readiness/l1/demo/demo.readiness.ts",
    "lib/launch/readiness/l1/demo.manager.ts",
    "lib/launch/readiness/l1/verify/launch.release.gate.ts",
    "lib/launch/readiness/l1/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_L1_DEMO_FOUNDATION_ID ===
      "enterprise-launch-l1-demo-foundation-v1",
    "l1 demo foundation id",
  );
  check(
    LAUNCH_L1_DEMO_FOUNDATION_VERSION === "launch-l1-1",
    "l1 demo foundation version",
  );
  check(
    LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION ===
      "launch-l1-demo-foundation-freeze-1",
    "l1 demo foundation freeze",
  );
  check(
    LAUNCH_L1_DEMO_FOUNDATION_BASE ===
      "enterprise-commercialization-v1-release",
    "l1 base = commercialization v1 release",
  );
  check(
    LAUNCH_L1_DEMO_FREEZE_VERSION === "launch-l1-demo-foundation-freeze-1",
    "l1 freeze tag",
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
  check(TENANT_STATUSES.length === 4, "tenant statuses");
  check(CUSTOMER_SEGMENTS.length === 4, "customer segments");
  check(PROJECT_SCENARIO_KINDS.length === 4, "project scenario kinds");
  check(ARTIFACT_KINDS.length === 4, "artifact kinds");
  check(DEMO_LOAD_STATUSES.length === 3, "demo load statuses");
  check(L1_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(L1_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkLaunchL1ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertLaunchL1ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Launch L1 Demo Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
