/**
 * AE-5 — Application Verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertApplicationVerificationGate,
  runApplicationVerificationGate,
} from "../lib/application/ae5/verify/application.verification.gate";

const root = path.resolve(__dirname, "..");
const report = runApplicationVerificationGate(root);

console.log("=== AE-5 Application Verification ===");
console.log(
  `verification=${report.verificationId} gate=${report.gateId} base=${report.baseFreezeRef}`,
);
console.log(
  `summary: packages=${report.summary.packages} checks=${report.summary.checkCatalogue} invariants=${report.summary.invariants} integration=${report.summary.integrationPassed} tsc=${report.summary.tscPassed}`,
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
    return /lib\/frontend|lib\/backend|lib\/data|lib\/integration|lib\/delivery|lib\/implementation|lib\/closure|lib\/product|docs\/product-definition|lib\/application\/ae[1234]\//.test(
      line,
    );
  });

console.log("");
if (forbiddenTouched.length > 0) {
  console.log(
    "FAIL No redesign / integration changes of AE-1…AE-4 / upstream — unexpected diffs:",
  );
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log(
  "PASS No AE-1…AE-4 / Product Definition / Governance / PI redesign",
);

console.log("");
console.log(
  report.passed
    ? "AE-5 Application Verification COMPLETE — verification only; verification PASS"
    : "AE-5 Application Verification FAILED",
);

assertApplicationVerificationGate(report);
