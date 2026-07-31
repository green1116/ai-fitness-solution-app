/**
 * PI-3.5 — Backend Verification / Hardening runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertBackendHardeningGate,
  runBackendHardeningGate,
} from "../lib/backend/verify/backend.hardening.gate";

const root = path.resolve(__dirname, "..");
const report = runBackendHardeningGate(root);

console.log("=== PI-3.5 Backend Verification / Hardening ===");
console.log(
  `hardening=${report.hardeningId} gate=${report.gateId} baseline=${report.baselineId} freeze=${report.freezeId}`,
);
console.log(
  `summary: packages=${report.summary.packages} invariants=${report.summary.invariants} domains=${report.summary.domains} commands=${report.summary.commands} services=${report.summary.services} families=${report.summary.apiFamilies} bindings=${report.summary.apiBindings}`,
);
console.log(
  `children: foundation=${report.summary.foundationPassed} service=${report.summary.servicePassed} runtime=${report.summary.runtimePassed} api=${report.summary.apiPassed}`,
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
const frontendTouched = porcelain
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((line) =>
    /lib\/frontend|components\/|app\/\(application\)|app\/\(marketing\)|scripts\/verify-fe/.test(
      line,
    ),
  );

console.log("");
if (frontendTouched.length > 0) {
  console.log("FAIL No frontend changes — unexpected FE diffs:");
  for (const line of frontendTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log("PASS No frontend changes");

console.log("");
console.log(
  report.passed && report.hardened
    ? "PI-3.5 Backend Verification / Hardening COMPLETE — all hardening gates passed"
    : "PI-3.5 Backend Verification / Hardening FAILED",
);

assertBackendHardeningGate(report);
