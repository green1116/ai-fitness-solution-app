/**
 * WP-46 — Post-Launch P7 Baseline Freeze verification.
 * Freezes FEAT-45…FEAT-48 without feature/model/API changes.
 */
import {
  assertPostLaunchP7GatePass,
  checkPostLaunchP7Gate,
  POST_LAUNCH_P7_BASELINE_ID,
  POST_LAUNCH_P7_FREEZE_VERSION,
} from "../verify/post-launch.p7.gate";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-46 / Post-Launch P7 Baseline Freeze ===");

  assert(
    POST_LAUNCH_P7_BASELINE_ID === "post-launch-p7-automation-baseline-v1",
    "baseline id",
  );
  assert(
    POST_LAUNCH_P7_FREEZE_VERSION === "post-launch-p7-freeze-1",
    "freeze version",
  );
  console.log("PASS freeze constants");

  const gate = checkPostLaunchP7Gate();
  for (const item of gate.checks) {
    console.log(
      `${item.ok ? "PASS" : "FAIL"} ${item.component} — ${item.label} (${item.detail})`,
    );
  }

  assertPostLaunchP7GatePass(gate);
  assert(gate.result === "PASS", "gate PASS");
  assert(gate.failCount === 0, "no failures");

  console.log("");
  console.log(gate.summary);
  console.log("PASS Post-Launch P7 Baseline Freeze");
  console.log("WP-46 verification complete");
}

main();
