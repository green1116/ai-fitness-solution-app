/**
 * WP-51 — Intelligence IP-1 Baseline Freeze verification.
 * Freezes FEAT-49…FEAT-52 without feature/model/API changes.
 */
import {
  assertIntelligenceIp1GatePass,
  checkIntelligenceIp1Gate,
  INTELLIGENCE_IP1_BASELINE_ID,
  INTELLIGENCE_IP1_FREEZE_VERSION,
} from "../verify/intelligence.ip1.gate";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-51 / Intelligence IP-1 Baseline Freeze ===");

  assert(
    INTELLIGENCE_IP1_BASELINE_ID === "intelligence-ip1-baseline-v1",
    "baseline id",
  );
  assert(
    INTELLIGENCE_IP1_FREEZE_VERSION === "intelligence-ip1-freeze-1",
    "freeze version",
  );
  console.log("PASS freeze constants");

  const gate = checkIntelligenceIp1Gate();
  for (const item of gate.checks) {
    console.log(
      `${item.ok ? "PASS" : "FAIL"} ${item.component} — ${item.label} (${item.detail})`,
    );
  }

  assertIntelligenceIp1GatePass(gate);
  assert(gate.result === "PASS", "gate PASS");
  assert(gate.failCount === 0, "no failures");

  console.log("");
  console.log(gate.summary);
  console.log("PASS Intelligence IP-1 Baseline Freeze");
  console.log("WP-51 verification complete");
}

main();
