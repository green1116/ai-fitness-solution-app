/**
 * PI-3.1 — Backend Foundation verification runner.
 * OUTPUT: Code evidence — Domain boundaries respected; frontend unchanged.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertBackendFoundationGate,
  runBackendFoundationGate,
} from "../lib/backend/verify/backend.foundation.gate";

const root = path.resolve(__dirname, "..");
const report = runBackendFoundationGate(root);

console.log("=== PI-3.1 Backend Foundation ===");
console.log(
  `foundation=${report.foundationId} architecture=${report.architectureId} gate=${report.gateId}`,
);
console.log(
  `summary: layers=${report.summary.layers} domains=${report.summary.domains} commands=${report.summary.commands} services=${report.summary.services} apiFamilies=${report.summary.apiFamilies}`,
);
console.log("");

for (const row of report.checks) {
  console.log(`${row.status} [${row.source}] ${row.id} — ${row.title}`);
  console.log(`  evidence: ${row.evidence}`);
}

// Frontend unchanged: working tree must not include lib/frontend or app/(application) edits in this package.
const status = spawnSync("git", ["status", "--porcelain"], {
  cwd: root,
  encoding: "utf8",
});
const porcelain = status.stdout ?? "";
const frontendTouched = porcelain
  .split(/\r?\n/)
  .filter(Boolean)
  .filter(
    (line) =>
      /lib\/frontend|components\/|app\/\(application\)|app\/\(marketing\)|scripts\/verify-fe/.test(
        line,
      ),
  );

console.log("");
if (frontendTouched.length > 0) {
  console.log("FAIL Frontend unchanged — unexpected frontend diffs:");
  for (const line of frontendTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log("PASS Frontend unchanged (no FE paths in working tree diff)");

console.log("");
console.log(
  report.passed
    ? "PI-3.1 Backend Foundation COMPLETE — established; Domain boundaries respected"
    : "PI-3.1 Backend Foundation FAILED",
);

assertBackendFoundationGate(report);
