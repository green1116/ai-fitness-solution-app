/**
 * Launch L2 — Pilot Customer Flow verification
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
  LAUNCH_L1_DEMO_FOUNDATION_ID,
  LAUNCH_L1_DEMO_FREEZE_VERSION,
} from "../lib/launch/readiness/l1/demo/demo.constants";
import {
  ACCEPTANCE_VERDICTS,
  DELIVERY_CHECKPOINT_KINDS,
  FEEDBACK_CHANNELS,
  INTAKE_STATUSES,
  L2_MANAGER_STATUSES,
  L2_READINESS_VERDICTS,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION,
  LAUNCH_L2_PILOT_FREEZE_VERSION,
  PILOT_STATUSES,
  PROJECT_LIFECYCLE_STAGES,
} from "../lib/launch/readiness/l2/pilot/pilot.constants";
import {
  assertLaunchL2ReleaseGatePass,
  checkLaunchL2ReleaseGate,
} from "../lib/launch/readiness/l2/verify/launch.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/launch/readiness/l2/pilot/pilot.constants.ts",
    "lib/launch/readiness/l2/pilot/pilot.types.ts",
    "lib/launch/readiness/l2/pilot/pilot.registry.ts",
    "lib/launch/readiness/l2/pilot/pilot.status.ts",
    "lib/launch/readiness/l2/intake/intake.types.ts",
    "lib/launch/readiness/l2/intake/intake.form.ts",
    "lib/launch/readiness/l2/intake/intake.workflow.ts",
    "lib/launch/readiness/l2/project/project.types.ts",
    "lib/launch/readiness/l2/project/project.tracker.ts",
    "lib/launch/readiness/l2/project/project.lifecycle.ts",
    "lib/launch/readiness/l2/feedback/feedback.types.ts",
    "lib/launch/readiness/l2/feedback/feedback.collector.ts",
    "lib/launch/readiness/l2/feedback/feedback.score.ts",
    "lib/launch/readiness/l2/delivery/delivery.types.ts",
    "lib/launch/readiness/l2/delivery/delivery.checkpoint.ts",
    "lib/launch/readiness/l2/delivery/delivery.acceptance.ts",
    "lib/launch/readiness/l2/delivery/delivery.readiness.ts",
    "lib/launch/readiness/l2/pilot.manager.ts",
    "lib/launch/readiness/l2/verify/launch.release.gate.ts",
    "lib/launch/readiness/l2/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID ===
      "enterprise-launch-l2-pilot-customer-flow-v1",
    "l2 pilot customer flow id",
  );
  check(
    LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION === "launch-l2-1",
    "l2 pilot customer flow version",
  );
  check(
    LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION ===
      "launch-l2-pilot-customer-flow-freeze-1",
    "l2 pilot customer flow freeze",
  );
  check(
    LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE === LAUNCH_L1_DEMO_FOUNDATION_ID,
    "l2 base = l1 demo foundation",
  );
  check(
    LAUNCH_L1_DEMO_FOUNDATION_ID ===
      "enterprise-launch-l1-demo-foundation-v1",
    "l1 freeze preserved",
  );
  check(
    LAUNCH_L1_DEMO_FREEZE_VERSION === "launch-l1-demo-foundation-freeze-1",
    "l1 freeze tag preserved",
  );
  check(
    LAUNCH_L2_PILOT_FREEZE_VERSION ===
      "launch-l2-pilot-customer-flow-freeze-1",
    "l2 freeze tag",
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
  check(PILOT_STATUSES.length === 5, "pilot statuses");
  check(INTAKE_STATUSES.length === 5, "intake statuses");
  check(PROJECT_LIFECYCLE_STAGES.length === 5, "project lifecycle stages");
  check(FEEDBACK_CHANNELS.length === 4, "feedback channels");
  check(DELIVERY_CHECKPOINT_KINDS.length === 4, "checkpoint kinds");
  check(ACCEPTANCE_VERDICTS.length === 4, "acceptance verdicts");
  check(L2_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(L2_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkLaunchL2ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertLaunchL2ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Launch L2 Pilot Customer Flow ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
