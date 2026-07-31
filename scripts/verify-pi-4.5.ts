/**
 * PI-4.5 — Data Verification / Hardening runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertDataHardeningGate,
  runDataHardeningGate,
} from "../lib/data/verify/data.hardening.gate";

const root = path.resolve(__dirname, "..");
const report = runDataHardeningGate(root);

console.log("=== PI-4.5 Data Verification / Hardening ===");
console.log(
  `hardening=${report.hardeningId} gate=${report.gateId} persistence=${report.persistenceArchId}`,
);
console.log(
  `summary: packages=${report.summary.packages} invariants=${report.summary.invariants} domains=${report.summary.domains} repos=${report.summary.repositories} families=${report.summary.storageFamilies} models=${report.summary.models} exposures=${report.summary.exposures}`,
);
console.log(
  `children: foundation=${report.summary.foundationPassed} repository=${report.summary.repositoryPassed} runtime=${report.summary.runtimePassed} exposure=${report.summary.exposurePassed}`,
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
const backendTouched = porcelain
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((line) => /lib\/backend\//.test(line));

console.log("");
if (frontendTouched.length > 0) {
  console.log("FAIL No frontend changes — unexpected FE diffs:");
  for (const line of frontendTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log("PASS No frontend changes");

if (backendTouched.length > 0) {
  console.log("FAIL No backend architecture changes — unexpected BE diffs:");
  for (const line of backendTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log("PASS No backend architecture changes");

console.log("");
console.log(
  report.passed && report.hardened
    ? "PI-4.5 Data Verification / Hardening COMPLETE — all hardening gates passed"
    : "PI-4.5 Data Verification / Hardening FAILED",
);

assertDataHardeningGate(report);
