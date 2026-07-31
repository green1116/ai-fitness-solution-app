/**
 * PI-5.1 — Integration Foundation verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertIntegrationFoundationGate,
  runIntegrationFoundationGate,
} from "../lib/integration/verify/integration.foundation.gate";

const root = path.resolve(__dirname, "..");
const report = runIntegrationFoundationGate(root);

console.log("=== PI-5.1 Integration Foundation ===");
console.log(
  `foundation=${report.foundationId} gate=${report.gateId} architecture=${report.architectureId}`,
);
console.log(
  `summary: stages=${report.summary.pipelineStages} kinds=${report.summary.bindingKinds} points=${report.summary.integrationPoints} ownership=${report.summary.ownershipRows} domains=${report.summary.domains}`,
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
    /lib\/frontend|lib\/backend|lib\/data|components\/|app\/\(application\)|app\/\(marketing\)|scripts\/verify-fe|scripts\/verify-pi-3|scripts\/verify-pi-4/.test(
      line,
    ),
  );

console.log("");
if (forbiddenTouched.length > 0) {
  console.log(
    "FAIL No frontend/backend/data architecture changes — unexpected diffs:",
  );
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log("PASS No frontend/backend/data architecture changes");

console.log("");
console.log(
  report.passed
    ? "PI-5.1 Integration Foundation COMPLETE — registry established; existing seams reused"
    : "PI-5.1 Integration Foundation FAILED",
);

assertIntegrationFoundationGate(report);
