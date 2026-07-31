/**
 * PI-3.2 — Backend Service / Command Layer verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertBackendServiceLayerGate,
  runBackendServiceLayerGate,
} from "../lib/backend/verify/backend.service.gate";

const root = path.resolve(__dirname, "..");
const report = runBackendServiceLayerGate(root);

console.log("=== PI-3.2 Backend Service / Command Layer ===");
console.log(
  `serviceLayer=${report.serviceLayerId} services=${report.summary.services} routed=${report.summary.routedActions} gp=${report.summary.goldenPaths} foundation=${report.summary.foundationPassed}`,
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
  report.passed
    ? "PI-3.2 Backend Service / Command Layer COMPLETE — all checks passed"
    : "PI-3.2 Backend Service / Command Layer FAILED",
);

assertBackendServiceLayerGate(report);
