/**
 * AE-2 — Application Runtime verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertApplicationRuntimeGate,
  runApplicationRuntimeGate,
} from "../lib/application/ae2/verify/application.runtime.gate";

const root = path.resolve(__dirname, "..");
const report = runApplicationRuntimeGate(root);

console.log("=== AE-2 Application Runtime ===");
console.log(
  `runtime=${report.runtimeId} gate=${report.gateId} base=${report.baseFreezeRef}`,
);
console.log(
  `summary: states=${report.summary.states} phases=${report.summary.phases} envs=${report.summary.environments} invariants=${report.summary.invariants} assembly=${report.summary.assemblyPassed} tsc=${report.summary.tscPassed}`,
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
    return /lib\/frontend|lib\/backend|lib\/data|lib\/integration|lib\/delivery|lib\/implementation|lib\/closure|lib\/product|docs\/product-definition|lib\/application\/ae1\//.test(
      line,
    );
  });

console.log("");
if (forbiddenTouched.length > 0) {
  console.log(
    "FAIL No redesign of AE-1 / upstream — unexpected diffs:",
  );
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log("PASS No AE-1 / Product Definition / Governance / PI redesign");

console.log("");
console.log(
  report.passed
    ? "AE-2 Application Runtime COMPLETE — runtime only; verification PASS"
    : "AE-2 Application Runtime FAILED",
);

assertApplicationRuntimeGate(report);
