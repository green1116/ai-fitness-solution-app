/**
 * PI-4.4 — Data Exposure verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertDataExposureGate,
  runDataExposureGate,
} from "../lib/data/verify/data.exposure.gate";

const root = path.resolve(__dirname, "..");
const report = runDataExposureGate(root);

console.log("=== PI-4.4 Data Exposure ===");
console.log(
  `layer=${report.layerId} gate=${report.gateId} exposures=${report.summary.exposures} repos=${report.summary.repositories} families=${report.summary.storageFamilies} models=${report.summary.models}`,
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
  report.passed
    ? "PI-4.4 Data Exposure COMPLETE — exposure bindings match runtime/repository; existing models reused"
    : "PI-4.4 Data Exposure FAILED",
);

assertDataExposureGate(report);
