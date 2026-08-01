/**
 * PL-8 — Post Launch Baseline Freeze verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertPostLaunchBaselineGate,
  runPostLaunchBaselineGate,
} from "../lib/post-launch/p8/baseline/verify/post-launch.baseline.gate";

const root = path.resolve(__dirname, "..");
const report = runPostLaunchBaselineGate(root);

console.log("=== PL-8 Post Launch Baseline Freeze ===");
console.log(
  `freeze=${report.freezeId} gate=${report.gateId} baseline=${report.baselineId}`,
);
console.log(
  `summary: prior=${report.summary.priorPackages} packages=${report.summary.packages} locks=${report.summary.locks} metadata=${report.summary.metadataValid} manifest=${report.summary.manifestValid}`,
);
console.log("");

for (const row of report.checks) {
  console.log(`${row.status} [${row.source}] ${row.id} — ${row.title}`);
  console.log(`  evidence: ${row.evidence}`);
}

const diffCheck = spawnSync("git", ["diff", "--check"], {
  cwd: root,
  encoding: "utf8",
});
console.log("");
if (diffCheck.status !== 0) {
  console.log("FAIL git diff --check");
  console.log(diffCheck.stdout || diffCheck.stderr);
  process.exit(1);
}
console.log("PASS git diff --check");

console.log("");
console.log(
  report.passed
    ? "PL-8 Post Launch Baseline Freeze COMPLETE — freeze only; gate PASS"
    : "PL-8 Post Launch Baseline Freeze FAILED",
);

assertPostLaunchBaselineGate(report);
