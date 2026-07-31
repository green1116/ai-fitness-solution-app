/**
 * PI-7.3 — Product Implementation Runtime verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertImplementationRuntimeGate,
  runImplementationRuntimeGate,
} from "../lib/implementation/verify/implementation.runtime.gate";

const root = path.resolve(__dirname, "..");
const report = runImplementationRuntimeGate(root);

console.log("=== PI-7.3 Implementation Runtime ===");
console.log(
  `runtime=${report.runtimeId} gate=${report.gateId} layers=${report.summary.layerAdapters} packages=${report.summary.packageBindings}`,
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
    /lib\/frontend|lib\/backend|lib\/data|lib\/integration|lib\/delivery\/(foundation|runtime|exposure|verification|hardening|verify)|components\/|app\/\(application\)|app\/\(marketing\)|scripts\/verify-fe|scripts\/verify-pi-[23456]/.test(
      line,
    ),
  );

console.log("");
if (forbiddenTouched.length > 0) {
  console.log(
    "FAIL No FE/BE/Data/Integration/Delivery architecture changes — unexpected diffs:",
  );
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log("PASS No FE/BE/Data/Integration/Delivery architecture changes");

console.log("");
console.log(
  report.passed
    ? "PI-7.3 Implementation Runtime COMPLETE — runtime bindings match package routing; existing layers reused"
    : "PI-7.3 Implementation Runtime FAILED",
);

assertImplementationRuntimeGate(report);
