/**
 * PI-6.3 — Delivery Readiness Exposure verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertDeliveryExposureGate,
  runDeliveryExposureGate,
} from "../lib/delivery/verify/delivery.exposure.gate";

const root = path.resolve(__dirname, "..");
const report = runDeliveryExposureGate(root);

console.log("=== PI-6.3 Delivery Readiness Exposure ===");
console.log(
  `layer=${report.layerId} gate=${report.gateId} exposures=${report.summary.exposures} signals=${report.summary.signals} concerns=${report.summary.concerns}`,
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
    ? "PI-6.3 Delivery Readiness Exposure COMPLETE — exposure matches runtime; existing layers reused"
    : "PI-6.3 Delivery Readiness Exposure FAILED",
);

assertDeliveryExposureGate(report);
