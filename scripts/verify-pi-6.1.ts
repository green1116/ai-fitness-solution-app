/**
 * PI-6.1 — Delivery Readiness Foundation verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertDeliveryFoundationGate,
  runDeliveryFoundationGate,
} from "../lib/delivery/verify/delivery.foundation.gate";

const root = path.resolve(__dirname, "..");
const report = runDeliveryFoundationGate(root);

console.log("=== PI-6.1 Delivery Foundation ===");
console.log(
  `foundation=${report.foundationId} gate=${report.gateId} readiness=${report.readinessId}`,
);
console.log(
  `summary: concerns=${report.summary.readinessConcerns} layers=${report.summary.layers} envs=${report.summary.environments} ownership=${report.summary.ownershipRows} domains=${report.summary.domains}`,
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
    /lib\/frontend|lib\/backend|lib\/data|lib\/integration|components\/|app\/\(application\)|app\/\(marketing\)|scripts\/verify-fe|scripts\/verify-pi-[2345]/.test(
      line,
    ),
  );

console.log("");
if (forbiddenTouched.length > 0) {
  console.log(
    "FAIL No FE/BE/Data/Integration architecture changes — unexpected diffs:",
  );
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log("PASS No FE/BE/Data/Integration architecture changes");

console.log("");
console.log(
  report.passed
    ? "PI-6.1 Delivery Foundation COMPLETE — registry established; existing layers reused"
    : "PI-6.1 Delivery Foundation FAILED",
);

assertDeliveryFoundationGate(report);
