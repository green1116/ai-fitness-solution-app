/**
 * WP-31 — Post-Launch P4 Baseline Freeze verification.
 * Freezes FEAT-30…FEAT-36 without feature/model/API changes.
 */
import {
  assertPostLaunchP4GatePass,
  checkPostLaunchP4Gate,
  POST_LAUNCH_P4_BASELINE_ID,
  POST_LAUNCH_P4_FREEZE_VERSION,
} from "../verify/post-launch.p4.gate";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-31 / Post-Launch P4 Baseline Freeze ===");

  assert(
    POST_LAUNCH_P4_BASELINE_ID ===
      "post-launch-p4-customer-success-baseline-v1",
    "baseline id",
  );
  assert(
    POST_LAUNCH_P4_FREEZE_VERSION === "post-launch-p4-freeze-1",
    "freeze version",
  );
  console.log("PASS freeze constants");

  const gate = checkPostLaunchP4Gate();
  for (const item of gate.checks) {
    console.log(
      `${item.ok ? "PASS" : "FAIL"} ${item.component} — ${item.label} (${item.detail})`,
    );
  }

  assertPostLaunchP4GatePass(gate);
  assert(gate.result === "PASS", "gate PASS");
  assert(gate.failCount === 0, "no failures");

  console.log("");
  console.log(gate.summary);
  console.log("PASS Post-Launch P4 Baseline Freeze");
  console.log("WP-31 verification complete");
}

main();
