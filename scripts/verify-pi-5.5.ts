/**
 * PI-5.5 — Integration Verification / Hardening runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertIntegrationHardeningGate,
  runIntegrationHardeningGate,
} from "../lib/integration/verify/integration.hardening.gate";

const root = path.resolve(__dirname, "..");
const report = runIntegrationHardeningGate(root);

console.log("=== PI-5.5 Integration Verification / Hardening ===");
console.log(
  `hardening=${report.hardeningId} gate=${report.gateId} baseline=${report.baselineId} freeze=${report.freezeId}`,
);
console.log(
  `summary: packages=${report.summary.packages} invariants=${report.summary.invariants} domains=${report.summary.domains} points=${report.summary.points} workflows=${report.summary.workflows} contracts=${report.summary.contracts}`,
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
  report.passed && report.hardened
    ? "PI-5.5 Integration Verification / Hardening COMPLETE — all hardening gates passed"
    : "PI-5.5 Integration Verification / Hardening FAILED",
);

assertIntegrationHardeningGate(report);
