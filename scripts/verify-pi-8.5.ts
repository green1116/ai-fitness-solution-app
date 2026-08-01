/**
 * PI-8.5 — Product Closure Verification / Hardening runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertClosureHardeningGate,
  runClosureHardeningGate,
} from "../lib/closure/verify/closure.hardening.gate";

const root = path.resolve(__dirname, "..");
const report = runClosureHardeningGate(root);

console.log("=== PI-8.5 Closure Verification / Hardening ===");
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
  report.passed && report.hardened
    ? "PI-8.5 Closure Verification / Hardening COMPLETE — all hardening gates passed"
    : "PI-8.5 Closure Verification / Hardening FAILED",
);

assertClosureHardeningGate(report);
