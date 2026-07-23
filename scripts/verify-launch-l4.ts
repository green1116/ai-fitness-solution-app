/**
 * Launch L4 — Enterprise Delivery Validation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../lib/commercialization/p8/freeze/freeze.lock";
import { LAUNCH_L1_DEMO_FOUNDATION_ID } from "../lib/launch/readiness/l1/demo/demo.constants";
import { LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID } from "../lib/launch/readiness/l2/pilot/pilot.constants";
import {
  LAUNCH_L3_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_ID,
} from "../lib/launch/readiness/l3/runtime/runtime.constants";
import {
  ARTIFACT_VERIFY_RESULTS,
  DELIVERY_ACCEPTANCE_VERDICTS,
  DELIVERY_STATUSES,
  L4_MANAGER_STATUSES,
  L4_READINESS_VERDICTS,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION,
  LAUNCH_L4_VALIDATION_FREEZE_VERSION,
  SCENARIO_KINDS,
  VALIDATION_CHECK_RESULTS,
  WORKFLOW_STEP_STATUSES,
} from "../lib/launch/readiness/l4/scenario/scenario.constants";
import {
  assertLaunchL4ReleaseGatePass,
  checkLaunchL4ReleaseGate,
} from "../lib/launch/readiness/l4/verify/launch.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/launch/readiness/l4/scenario/scenario.constants.ts",
    "lib/launch/readiness/l4/scenario/scenario.types.ts",
    "lib/launch/readiness/l4/scenario/scenario.registry.ts",
    "lib/launch/readiness/l4/workflow/workflow.types.ts",
    "lib/launch/readiness/l4/workflow/workflow.engine.ts",
    "lib/launch/readiness/l4/workflow/workflow.steps.ts",
    "lib/launch/readiness/l4/validation/validation.types.ts",
    "lib/launch/readiness/l4/validation/validation.checks.ts",
    "lib/launch/readiness/l4/validation/validation.result.ts",
    "lib/launch/readiness/l4/artifact/artifact.types.ts",
    "lib/launch/readiness/l4/artifact/artifact.verify.ts",
    "lib/launch/readiness/l4/artifact/artifact.report.ts",
    "lib/launch/readiness/l4/delivery/delivery.types.ts",
    "lib/launch/readiness/l4/delivery/delivery.acceptance.ts",
    "lib/launch/readiness/l4/delivery/delivery.status.ts",
    "lib/launch/readiness/l4/delivery/delivery.readiness.ts",
    "lib/launch/readiness/l4/validation.manager.ts",
    "lib/launch/readiness/l4/verify/launch.release.gate.ts",
    "lib/launch/readiness/l4/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID ===
      "enterprise-launch-l4-enterprise-delivery-validation-v1",
    "l4 enterprise delivery validation id",
  );
  check(
    LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION === "launch-l4-1",
    "l4 enterprise delivery validation version",
  );
  check(
    LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION ===
      "launch-l4-enterprise-delivery-validation-freeze-1",
    "l4 enterprise delivery validation freeze",
  );
  check(
    LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE ===
      LAUNCH_L3_PRODUCTION_HARDENING_ID,
    "l4 base = l3 production hardening",
  );
  check(
    LAUNCH_L3_PRODUCTION_HARDENING_ID ===
      "enterprise-launch-l3-production-hardening-v1",
    "l3 freeze preserved",
  );
  check(
    LAUNCH_L3_HARDENING_FREEZE_VERSION ===
      "launch-l3-production-hardening-freeze-1",
    "l3 freeze tag preserved",
  );
  check(
    LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID ===
      "enterprise-launch-l2-pilot-customer-flow-v1",
    "l2 freeze preserved",
  );
  check(
    LAUNCH_L1_DEMO_FOUNDATION_ID ===
      "enterprise-launch-l1-demo-foundation-v1",
    "l1 freeze preserved",
  );
  check(
    LAUNCH_L4_VALIDATION_FREEZE_VERSION ===
      "launch-l4-enterprise-delivery-validation-freeze-1",
    "l4 freeze tag",
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
  check(SCENARIO_KINDS.length === 4, "scenario kinds");
  check(WORKFLOW_STEP_STATUSES.length === 4, "workflow step statuses");
  check(VALIDATION_CHECK_RESULTS.length === 3, "validation check results");
  check(ARTIFACT_VERIFY_RESULTS.length === 3, "artifact verify results");
  check(DELIVERY_ACCEPTANCE_VERDICTS.length === 4, "acceptance verdicts");
  check(DELIVERY_STATUSES.length === 5, "delivery statuses");
  check(L4_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(L4_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkLaunchL4ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertLaunchL4ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Launch L4 Enterprise Delivery Validation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
