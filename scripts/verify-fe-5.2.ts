/**
 * FE-5.2 — Regression Verification runner.
 * OUTPUT: Verification + Evidence (presentation only).
 */
import {
  assertFrontendRegression,
  runFrontendRegression,
} from "../lib/frontend/frontend-regression";

const report = runFrontendRegression();

console.log("=== FE-5.2 Regression Verification ===");
console.log(
  `summary: packages=${report.summary.packages} baselineChecks=${report.summary.baselineChecks} regressionChecks=${report.summary.regressionChecks} CMP=${report.summary.cmpCatalogue} INT=${report.summary.intCatalogue} ST=${report.summary.stateClasses} bindings=${report.summary.adapterBindings}`,
);
console.log("");

for (const row of report.checks) {
  console.log(`${row.status} [${row.source}] ${row.id} — ${row.title}`);
  console.log(`  evidence: ${row.evidence}`);
}

console.log("");
console.log(
  report.baseline.passed
    ? `BASELINE FE-5.1 PASS (${report.baseline.checks.length} checks; FE-3=${report.baseline.summary.fe3Checks} FE-4=${report.baseline.summary.fe4Checks})`
    : "BASELINE FE-5.1 FAIL",
);

console.log("");
console.log(
  report.passed
    ? "FE-5.2 Regression Verification COMPLETE — all checks passed"
    : "FE-5.2 Regression Verification FAILED",
);

assertFrontendRegression(report);
