/**
 * WP-36 — Post-Launch P5 Baseline Freeze verification.
 * Freezes FEAT-37…FEAT-40 without feature/model/API changes.
 */
import {
  assertPostLaunchP5GatePass,
  checkPostLaunchP5Gate,
  POST_LAUNCH_P5_BASELINE_ID,
  POST_LAUNCH_P5_FREEZE_VERSION,
} from "../verify/post-launch.p5.gate";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-36 / Post-Launch P5 Baseline Freeze ===");

  assert(
    POST_LAUNCH_P5_BASELINE_ID === "post-launch-p5-retention-baseline-v1",
    "baseline id",
  );
  assert(
    POST_LAUNCH_P5_FREEZE_VERSION === "post-launch-p5-freeze-1",
    "freeze version",
  );
  console.log("PASS freeze constants");

  const gate = checkPostLaunchP5Gate();
  for (const item of gate.checks) {
    console.log(
      `${item.ok ? "PASS" : "FAIL"} ${item.component} — ${item.label} (${item.detail})`,
    );
  }

  assertPostLaunchP5GatePass(gate);
  assert(gate.result === "PASS", "gate PASS");
  assert(gate.failCount === 0, "no failures");

  console.log("");
  console.log(gate.summary);
  console.log("PASS Post-Launch P5 Baseline Freeze");
  console.log("WP-36 verification complete");
}

main();
