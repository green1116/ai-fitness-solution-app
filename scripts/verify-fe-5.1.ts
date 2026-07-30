/**
 * FE-5.1 — Frontend Verification runner.
 * OUTPUT: Verification + Evidence (presentation only).
 */
import {
  assertFrontendVerification,
  runFrontendVerification,
} from "../lib/frontend/frontend-verification";

const report = runFrontendVerification();

console.log("=== FE-5.1 Frontend Verification ===");
console.log(
  `summary: routes=${report.summary.routes} screens=${report.summary.screens} layouts=${report.summary.layouts} CMP=${report.summary.cmpCatalogue} INT=${report.summary.intCatalogue} ST=${report.summary.stateClasses} fe3Checks=${report.summary.fe3Checks} fe4Checks=${report.summary.fe4Checks} scanned=${report.summary.scannedFiles}`,
);
console.log("");

for (const row of report.checks) {
  console.log(`${row.status} [${row.source}] ${row.id} — ${row.title}`);
  console.log(`  evidence: ${row.evidence}`);
}

console.log("");
console.log(
  report.children.fe3.passed
    ? `CHILD FE-3.3 PASS (${report.children.fe3.checks.length} checks)`
    : `CHILD FE-3.3 FAIL`,
);
console.log(
  report.children.fe4.passed
    ? `CHILD FE-4.5 PASS (${report.children.fe4.checks.length} checks)`
    : `CHILD FE-4.5 FAIL`,
);

console.log("");
console.log(
  report.passed
    ? "FE-5.1 Frontend Verification COMPLETE — all checks passed"
    : "FE-5.1 Frontend Verification FAILED",
);

assertFrontendVerification(report);
