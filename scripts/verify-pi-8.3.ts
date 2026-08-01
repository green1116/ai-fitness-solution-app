/**
 * PI-8.3 — Product Closure Runtime verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertClosureRuntimeGate,
  runClosureRuntimeGate,
} from "../lib/closure/verify/closure.runtime.gate";

const root = path.resolve(__dirname, "..");
const report = runClosureRuntimeGate(root);

console.log("=== PI-8.3 Closure Runtime ===");
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
    /lib\/frontend|lib\/backend|lib\/data|lib\/integration|lib\/delivery\/(foundation|runtime|exposure|verification|hardening|verify)|lib\/implementation\/(foundation|routing|runtime|exposure|hardening|verify)|components\/|app\/\(application\)|app\/\(marketing\)|scripts\/verify-fe|scripts\/verify-pi-[234567]/.test(
      line,
    ),
  );

console.log("");
if (forbiddenTouched.length > 0) {
  console.log(
    "FAIL No FE/BE/Data/Integration/Delivery/Implementation architecture changes — unexpected diffs:",
  );
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log(
  "PASS No FE/BE/Data/Integration/Delivery/Implementation architecture changes",
);

console.log("");
console.log(
  report.passed
    ? "PI-8.3 Closure Runtime COMPLETE — runtime bindings match routing; existing layers and domains reused"
    : "PI-8.3 Closure Runtime FAILED",
);

assertClosureRuntimeGate(report);
