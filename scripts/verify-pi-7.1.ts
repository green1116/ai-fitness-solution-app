/**
 * PI-7.1 — Product Implementation Foundation verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertImplementationFoundationGate,
  runImplementationFoundationGate,
} from "../lib/implementation/verify/implementation.foundation.gate";

const root = path.resolve(__dirname, "..");
const report = runImplementationFoundationGate(root);

console.log("=== PI-7.1 Implementation Foundation ===");
console.log(
  `foundation=${report.foundationId} gate=${report.gateId} baseline=${report.baselineId}`,
);
console.log(
  `summary: packages=${report.summary.packages} layers=${report.summary.layers} ownership=${report.summary.ownershipRows} domains=${report.summary.domains}`,
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
    ? "PI-7.1 Implementation Foundation COMPLETE — registry established; existing layers reused"
    : "PI-7.1 Implementation Foundation FAILED",
);

assertImplementationFoundationGate(report);
