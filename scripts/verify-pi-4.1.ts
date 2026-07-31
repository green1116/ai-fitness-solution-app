/**
 * PI-4.1 — Data Foundation verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertDataFoundationGate,
  runDataFoundationGate,
} from "../lib/data/verify/data.foundation.gate";

const root = path.resolve(__dirname, "..");
const report = runDataFoundationGate(root);

console.log("=== PI-4.1 Data Foundation ===");
console.log(
  `foundation=${report.foundationId} gate=${report.gateId} persistence=${report.persistenceArchId}`,
);
console.log(
  `summary: families=${report.summary.storageFamilies} classes=${report.summary.dataClasses} durable=${report.summary.durableClasses} repos=${report.summary.repositories} models=${report.summary.persistenceModels} domains=${report.summary.domains}`,
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
const backendArchTouched = porcelain
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

if (backendArchTouched.length > 0) {
  console.log("FAIL No backend architecture changes — unexpected BE diffs:");
  for (const line of backendArchTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log("PASS No backend architecture changes");

console.log("");
console.log(
  report.passed
    ? "PI-4.1 Data Foundation COMPLETE — ownership registry established; existing persistence reused"
    : "PI-4.1 Data Foundation FAILED",
);

assertDataFoundationGate(report);
