/**
 * WP-41 — Post-Launch P6 Baseline Freeze verification.
 * Freezes FEAT-41…FEAT-44 without feature/model/API changes.
 */
import {
  assertPostLaunchP6GatePass,
  checkPostLaunchP6Gate,
  POST_LAUNCH_P6_BASELINE_ID,
  POST_LAUNCH_P6_FREEZE_VERSION,
} from "../verify/post-launch.p6.gate";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-41 / Post-Launch P6 Baseline Freeze ===");

  assert(
    POST_LAUNCH_P6_BASELINE_ID ===
      "post-launch-p6-optimization-baseline-v1",
    "baseline id",
  );
  assert(
    POST_LAUNCH_P6_FREEZE_VERSION === "post-launch-p6-freeze-1",
    "freeze version",
  );
  console.log("PASS freeze constants");

  const gate = checkPostLaunchP6Gate();
  for (const item of gate.checks) {
    console.log(
      `${item.ok ? "PASS" : "FAIL"} ${item.component} — ${item.label} (${item.detail})`,
    );
  }

  assertPostLaunchP6GatePass(gate);
  assert(gate.result === "PASS", "gate PASS");
  assert(gate.failCount === 0, "no failures");

  console.log("");
  console.log(gate.summary);
  console.log("PASS Post-Launch P6 Baseline Freeze");
  console.log("WP-41 verification complete");
}

main();
