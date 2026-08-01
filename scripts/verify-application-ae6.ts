/**
 * AE-6 — Application Freeze verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertApplicationFreezeGate,
  runApplicationFreezeGate,
} from "../lib/application/ae6/verify/application.freeze.gate";

const root = path.resolve(__dirname, "..");
const report = runApplicationFreezeGate(root);

console.log("=== AE-6 Application Freeze ===");
console.log(
  `freeze=${report.freezeId} gate=${report.gateId} base=${report.baseFreezeRef}`,
);
console.log(
  `summary: packages=${report.summary.packages} locks=${report.summary.locks} rollbacks=${report.summary.rollbacks} baselines=${report.summary.baselines} verification=${report.summary.verificationPassed} tsc=${report.summary.tscPassed}`,
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
    return /lib\/frontend|lib\/backend|lib\/data|lib\/integration|lib\/delivery|lib\/implementation|lib\/closure|lib\/product|docs\/product-definition|lib\/application\/ae[12345]\//.test(
      line,
    );
  });

console.log("");
if (forbiddenTouched.length > 0) {
  console.log(
    "FAIL No redesign of AE-1…AE-5 / upstream — unexpected diffs:",
  );
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log(
  "PASS No AE-1…AE-5 / Product Definition / Governance / PI redesign",
);

console.log("");
console.log(
  report.passed
    ? "AE-6 Application Freeze COMPLETE — freeze only; verification PASS"
    : "AE-6 Application Freeze FAILED",
);

assertApplicationFreezeGate(report);
