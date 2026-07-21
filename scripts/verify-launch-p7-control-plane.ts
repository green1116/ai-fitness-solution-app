/**
 * Launch P7 — Launch Control Plane Layer verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import {
  CONTROL_MANAGER_STATUSES,
  CONTROL_READINESS_VERDICTS,
  DEPLOYMENT_AGG_STATUSES,
  GONGO_VERDICTS,
  LAUNCH_CONTROL_PLANE_BASE,
  LAUNCH_CONTROL_PLANE_FREEZE_VERSION,
  LAUNCH_CONTROL_PLANE_ID,
  LAUNCH_CONTROL_PLANE_VERSION,
  LAUNCH_P7_CONTROL_FREEZE_VERSION,
  ORCHESTRATION_STAGES,
  ORCHESTRATION_STATUSES,
  RELEASE_DECISION_VERDICTS,
} from "../lib/launch/control/control.constants";
import {
  assertLaunchP7ReleaseGatePass,
  checkLaunchP7ReleaseGate,
} from "../lib/launch/control/verify/control.release.gate";
import { LAUNCH_DOCUMENTATION_ID } from "../lib/launch/documentation/documentation.constants";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/launch/control/control.constants.ts",
    "lib/launch/control/control.types.ts",
    "lib/launch/control/control.orchestration.ts",
    "lib/launch/control/control.decision.ts",
    "lib/launch/control/control.gonogo.ts",
    "lib/launch/control/control.metrics.ts",
    "lib/launch/control/control.deployment.ts",
    "lib/launch/control/control.dashboard.ts",
    "lib/launch/control/control.readiness.ts",
    "lib/launch/control/control.manager.ts",
    "lib/launch/control/verify/control.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_CONTROL_PLANE_ID ===
      "enterprise-launch-p7-launch-control-plane-v1",
    "control id",
  );
  check(LAUNCH_CONTROL_PLANE_VERSION === "launch-p7-1", "control version");
  check(
    LAUNCH_CONTROL_PLANE_FREEZE_VERSION === "launch-control-plane-freeze-1",
    "control freeze",
  );
  check(
    LAUNCH_CONTROL_PLANE_BASE === LAUNCH_DOCUMENTATION_ID,
    "control base = p6 id",
  );
  check(
    LAUNCH_P7_CONTROL_FREEZE_VERSION ===
      "launch-p7-launch-control-plane-freeze-1",
    "p7 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(ORCHESTRATION_STATUSES.length === 5, "orchestration statuses");
  check(ORCHESTRATION_STAGES.length === 7, "orchestration stages");
  check(RELEASE_DECISION_VERDICTS.length === 4, "decision verdicts");
  check(GONGO_VERDICTS.length === 3, "go/no-go verdicts");
  check(DEPLOYMENT_AGG_STATUSES.length === 6, "deployment agg statuses");
  check(CONTROL_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(CONTROL_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");
  console.log("✓ version constants");
}

function testControlPlaneStack() {
  const gate = checkLaunchP7ReleaseGate();
  check(gate.result === "PASS", `stack gate: ${gate.summary}`);
  check(gate.failCount === 0, "stack failCount 0");

  const stack = gate.checks.find((c) => c.id === "LN-P7-STACK");
  check(!!stack && stack.ok, `stack detail: ${stack?.detail ?? "missing"}`);
  console.log(
    "✓ orchestration / go-no-go / decision / metrics / deployment / dashboard",
  );
}

function testSignoff() {
  const gate = checkLaunchP7ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertLaunchP7ReleaseGatePass(gate);
  console.log("✓ launch control plane release gate");
}

function main() {
  console.log("Launch P7 Launch Control Plane Layer verify");
  checkModules();
  checkConstants();
  testControlPlaneStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
