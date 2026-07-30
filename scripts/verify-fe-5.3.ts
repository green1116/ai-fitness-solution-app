/**
 * FE-5.3 — Frontend Readiness runner.
 * OUTPUT: Verification + Evidence (presentation only).
 */
import {
  assertFrontendReadiness,
  runFrontendReadiness,
} from "../lib/frontend/frontend-readiness";

const report = runFrontendReadiness();

console.log("=== FE-5.3 Frontend Readiness ===");
console.log(
  `summary: ready=${report.ready} gate=${report.gateId} packages=${report.summary.packages} routes=${report.summary.routes} screens=${report.summary.screens} CMP=${report.summary.cmpCatalogue} INT=${report.summary.intCatalogue} ST=${report.summary.stateClasses} bindings=${report.summary.adapterBindings}`,
);
console.log("");

for (const row of report.checks) {
  console.log(`${row.status} [${row.source}] ${row.id} — ${row.title}`);
  console.log(`  evidence: ${row.evidence}`);
}

console.log("");
console.log(
  report.regression.passed
    ? `CHILD FE-5.2 PASS (${report.regression.checks.length} checks; FE-5.1=${report.regression.baseline.checks.length})`
    : "CHILD FE-5.2 FAIL",
);

console.log("");
console.log(
  report.ready
    ? "FE-5.3 Frontend Readiness COMPLETE — READY"
    : "FE-5.3 Frontend Readiness FAILED — NOT READY",
);

assertFrontendReadiness(report);
