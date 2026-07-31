/**
 * PI-5.3 — Integration Runtime verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertIntegrationRuntimeGate,
  runIntegrationRuntimeGate,
} from "../lib/integration/verify/integration.runtime.gate";

const root = path.resolve(__dirname, "..");
const report = runIntegrationRuntimeGate(root);

console.log("=== PI-5.3 Integration Runtime ===");
console.log(
  `runtime=${report.runtimeId} gate=${report.gateId} seams=${report.summary.seamAdapters} workflows=${report.summary.workflowBindings} kinds=${report.summary.bindingKinds}`,
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
  .filter((line) =>
    /lib\/frontend|lib\/backend|lib\/data|components\/|app\/\(application\)|app\/\(marketing\)|scripts\/verify-fe|scripts\/verify-pi-[234]/.test(
      line,
    ),
  );

console.log("");
if (forbiddenTouched.length > 0) {
  console.log(
    "FAIL No FE/BE/Data architecture changes — unexpected diffs:",
  );
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log("PASS No FE/BE/Data architecture changes");

console.log("");
console.log(
  report.passed
    ? "PI-5.3 Integration Runtime COMPLETE — runtime bindings match routing; existing seams reused"
    : "PI-5.3 Integration Runtime FAILED",
);

assertIntegrationRuntimeGate(report);
