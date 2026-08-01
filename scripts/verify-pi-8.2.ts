/**
 * PI-8.2 — Product Closure Routing verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertClosureRoutingGate,
  runClosureRoutingGate,
} from "../lib/closure/verify/closure.routing.gate";

const root = path.resolve(__dirname, "..");
const report = runClosureRoutingGate(root);

console.log("=== PI-8.2 Closure Routing ===");
console.log(
  `layer=${report.layerId} gate=${report.gateId} packages=${report.summary.packages} layerRoutes=${report.summary.layerRoutes} deps=${report.summary.dependencyRoutes}`,
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
    /lib\/frontend|lib\/backend|lib\/data|lib\/integration|lib\/delivery\/(foundation|runtime|exposure|verification|hardening|verify)|lib\/implementation\/(foundation|routing|runtime|exposure|hardening|verify)|components\/|app\/\(application\)|app\/\(marketing\)|scripts\/verify-fe|scripts\/verify-pi-[234567]/.test(
      line,
    ),
  );

console.log("");
if (forbiddenTouched.length > 0) {
  console.log(
    "FAIL No FE/BE/Data/Integration/Delivery/Implementation architecture changes — unexpected diffs:",
  );
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log(
  "PASS No FE/BE/Data/Integration/Delivery/Implementation architecture changes",
);

console.log("");
console.log(
  report.passed
    ? "PI-8.2 Closure Routing COMPLETE — routes match foundation; existing layers and domains reused"
    : "PI-8.2 Closure Routing FAILED",
);

assertClosureRoutingGate(report);
