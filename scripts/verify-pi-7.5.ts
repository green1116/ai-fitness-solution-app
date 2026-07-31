/**
 * PI-7.5 — Product Implementation Verification / Hardening runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertImplementationHardeningGate,
  runImplementationHardeningGate,
} from "../lib/implementation/verify/implementation.hardening.gate";

const root = path.resolve(__dirname, "..");
const report = runImplementationHardeningGate(root);

console.log("=== PI-7.5 Implementation Verification / Hardening ===");
console.log(
  `hardening=${report.hardeningId} gate=${report.gateId} baseline=${report.baselineId} freeze=${report.freezeId}`,
);
console.log(
  `summary: packages=${report.summary.packages} invariants=${report.summary.invariants} domains=${report.summary.domains} layers=${report.summary.layers} signals=${report.summary.signals}`,
);
console.log(
  `children: foundation=${report.summary.foundationPassed} routing=${report.summary.routingPassed} runtime=${report.summary.runtimePassed} exposure=${report.summary.exposurePassed}`,
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
  report.passed && report.hardened
    ? "PI-7.5 Implementation Verification / Hardening COMPLETE — all hardening gates passed"
    : "PI-7.5 Implementation Verification / Hardening FAILED",
);

assertImplementationHardeningGate(report);
