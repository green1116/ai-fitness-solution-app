/**
 * PI-5.2 — Integration Routing verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertIntegrationRoutingGate,
  runIntegrationRoutingGate,
} from "../lib/integration/verify/integration.routing.gate";

const root = path.resolve(__dirname, "..");
const report = runIntegrationRoutingGate(root);

console.log("=== PI-5.2 Integration Routing ===");
console.log(
  `layer=${report.layerId} gate=${report.gateId} workflows=${report.summary.workflows} kinds=${report.summary.bindingKinds} gps=${report.summary.goldenPaths} domains=${report.summary.domains}`,
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
  report.passed
    ? "PI-5.2 Integration Routing COMPLETE — routes match foundation; existing points reused"
    : "PI-5.2 Integration Routing FAILED",
);

assertIntegrationRoutingGate(report);
