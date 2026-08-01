/**
 * AE-4 — Application Integration verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertApplicationIntegrationGate,
  runApplicationIntegrationGate,
} from "../lib/application/ae4/verify/application.integration.gate";

const root = path.resolve(__dirname, "..");
const report = runApplicationIntegrationGate(root);

console.log("=== AE-4 Application Integration ===");
console.log(
  `integration=${report.integrationId} gate=${report.gateId} base=${report.baseFreezeRef}`,
);
console.log(
  `summary: families=${report.summary.families} bindings=${report.summary.bindings} endpoints=${report.summary.endpoints} invariants=${report.summary.invariants} workflow=${report.summary.workflowPassed} tsc=${report.summary.tscPassed}`,
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
    return /lib\/frontend|lib\/backend|lib\/data|lib\/integration|lib\/delivery|lib\/implementation|lib\/closure|lib\/product|docs\/product-definition|lib\/application\/ae[123]\//.test(
      line,
    );
  });

console.log("");
if (forbiddenTouched.length > 0) {
  console.log(
    "FAIL No redesign of AE-1…AE-3 / upstream — unexpected diffs:",
  );
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log(
  "PASS No AE-1…AE-3 / Product Definition / Governance / PI redesign",
);

console.log("");
console.log(
  report.passed
    ? "AE-4 Application Integration COMPLETE — integration only; verification PASS"
    : "AE-4 Application Integration FAILED",
);

assertApplicationIntegrationGate(report);
