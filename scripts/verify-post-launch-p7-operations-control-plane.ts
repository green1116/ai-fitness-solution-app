/**
 * Post-Launch P7 — Operations Control Plane verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import {
  ENTERPRISE_LAUNCH_COMPLETE_ID,
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
} from "../lib/launch/signoff/governance.freeze.lock";
import { OPERATIONS_ENTERPRISE_SUPPORT_ID } from "../lib/operations/support/support.constants";
import {
  COMMAND_CENTER_MODES,
  DOMAIN_HEALTH_LEVELS,
  OPERATIONS_CONTROL_PLANE_BASE,
  OPERATIONS_CONTROL_PLANE_FREEZE_VERSION,
  OPERATIONS_CONTROL_PLANE_ID,
  OPERATIONS_CONTROL_PLANE_VERSION,
  OPERATIONS_P7_CONTROL_FREEZE_VERSION,
  OPS_CONTROL_MANAGER_STATUSES,
  OPS_CONTROL_READINESS_VERDICTS,
  OPS_DECISION_VERDICTS,
  OPS_ORCHESTRATION_DOMAINS,
  OPS_ORCHESTRATION_STATUSES,
} from "../lib/operations/control/control.constants";
import {
  assertOperationsP7ReleaseGatePass,
  checkOperationsP7ReleaseGate,
} from "../lib/operations/control/verify/operations.control.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/operations/control/control.constants.ts",
    "lib/operations/control/control.types.ts",
    "lib/operations/control/control.orchestration.ts",
    "lib/operations/control/control.command.ts",
    "lib/operations/control/control.health.ts",
    "lib/operations/control/control.dashboard.ts",
    "lib/operations/control/control.decision.ts",
    "lib/operations/control/control.readiness.ts",
    "lib/operations/control/control.manager.ts",
    "lib/operations/control/verify/operations.control.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_CONTROL_PLANE_ID ===
      "enterprise-post-launch-p7-operations-control-plane-v1",
    "ops control plane id",
  );
  check(
    OPERATIONS_CONTROL_PLANE_VERSION === "operations-p7-1",
    "ops control plane version",
  );
  check(
    OPERATIONS_CONTROL_PLANE_FREEZE_VERSION ===
      "operations-control-plane-freeze-1",
    "ops control plane freeze",
  );
  check(
    OPERATIONS_CONTROL_PLANE_BASE === OPERATIONS_ENTERPRISE_SUPPORT_ID,
    "ops control base = p6 enterprise support",
  );
  check(
    OPERATIONS_ENTERPRISE_SUPPORT_ID ===
      "enterprise-post-launch-p6-enterprise-support-operations-v1",
    "p6 enterprise support freeze preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete alias preserved",
  );
  check(
    LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID ===
      "enterprise-launch-commercial-release-complete-v1",
    "commercial release complete preserved",
  );
  check(
    OPERATIONS_P7_CONTROL_FREEZE_VERSION ===
      "operations-p7-operations-control-plane-freeze-1",
    "p7 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(OPS_ORCHESTRATION_STATUSES.length === 5, "orchestration statuses");
  check(OPS_ORCHESTRATION_DOMAINS.length === 6, "orchestration domains");
  check(DOMAIN_HEALTH_LEVELS.length === 5, "health levels");
  check(OPS_DECISION_VERDICTS.length === 4, "decision verdicts");
  check(COMMAND_CENTER_MODES.length === 4, "command modes");
  check(OPS_CONTROL_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(OPS_CONTROL_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkOperationsP7ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertOperationsP7ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Post-Launch P7 Operations Control Plane ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
