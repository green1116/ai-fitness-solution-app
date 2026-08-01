/**
 * AE-3 — Application Workflow verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertApplicationWorkflowGate,
  runApplicationWorkflowGate,
} from "../lib/application/ae3/verify/application.workflow.gate";

const root = path.resolve(__dirname, "..");
const report = runApplicationWorkflowGate(root);

console.log("=== AE-3 Application Workflow ===");
console.log(
  `workflow=${report.workflowId} gate=${report.gateId} base=${report.baseFreezeRef}`,
);
console.log(
  `summary: families=${report.summary.families} stages=${report.summary.stages} transitions=${report.summary.transitions} invariants=${report.summary.invariants} runtime=${report.summary.runtimePassed} tsc=${report.summary.tscPassed}`,
);
console.log("");

for (const row of report.checks) {
  console.log(`${row.status} [${row.source}] ${row.id} — ${row.title}`);
  console.log(`  evidence: ${row.evidence}`);
}

const status = spawnSync("git", ["status", "--porcelain"], {
  cwd: root,
  encoding: "utf8",
});
const porcelain = status.stdout ?? "";
const forbiddenTouched = porcelain
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((line) => {
    if (/^\?\?/.test(line)) return false;
    return /lib\/frontend|lib\/backend|lib\/data|lib\/integration|lib\/delivery|lib\/implementation|lib\/closure|lib\/product|docs\/product-definition|lib\/application\/ae[12]\//.test(
      line,
    );
  });

console.log("");
if (forbiddenTouched.length > 0) {
  console.log("FAIL No redesign of AE-1/AE-2 / upstream — unexpected diffs:");
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log("PASS No AE-1 / AE-2 / Product Definition / Governance / PI redesign");

console.log("");
console.log(
  report.passed
    ? "AE-3 Application Workflow COMPLETE — workflow only; verification PASS"
    : "AE-3 Application Workflow FAILED",
);

assertApplicationWorkflowGate(report);
