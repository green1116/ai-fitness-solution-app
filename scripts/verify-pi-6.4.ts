/**
 * PI-6.4 — Delivery Readiness Verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertDeliveryVerificationGate,
  runDeliveryVerificationGate,
} from "../lib/delivery/verify/delivery.verification.gate";

const root = path.resolve(__dirname, "..");
const report = runDeliveryVerificationGate(root);

console.log("=== PI-6.4 Delivery Readiness Verification ===");
console.log(
  `verification=${report.verificationId} gate=${report.gateId} baseline=${report.baselineId} freeze=${report.freezeId}`,
);
console.log(
  `summary: packages=${report.summary.packages} invariants=${report.summary.invariants} domains=${report.summary.domains} concerns=${report.summary.concerns} layers=${report.summary.layers} signals=${report.summary.signals}`,
);
console.log(
  `children: foundation=${report.summary.foundationPassed} runtime=${report.summary.runtimePassed} exposure=${report.summary.exposurePassed}`,
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
  report.passed && report.verified
    ? "PI-6.4 Delivery Readiness Verification COMPLETE — all verification gates passed"
    : "PI-6.4 Delivery Readiness Verification FAILED",
);

assertDeliveryVerificationGate(report);
