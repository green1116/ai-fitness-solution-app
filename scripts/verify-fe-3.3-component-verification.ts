/**
 * FE-3.3 — Component Verification runner.
 * OUTPUT: Verification + Evidence (presentation only).
 */
import {
  assertComponentVerification,
  runComponentVerification,
} from "../lib/frontend/component-verification";

const report = runComponentVerification();

console.log("=== FE-3.3 Component Verification ===");
console.log(
  `summary: CMP=${report.summary.cmpCatalogue} INT=${report.summary.intCatalogue} FEATCMP=${report.summary.featcmpCount} SCRCMP=${report.summary.scrcmpCount} screens=${report.summary.screensVerified}`,
);
console.log("");

for (const check of report.checks) {
  console.log(
    `${check.status} [${check.source}] ${check.id} — ${check.title}`,
  );
  console.log(`  evidence: ${check.evidence}`);
}

console.log("");
console.log(
  report.passed
    ? "FE-3.3 Component Verification COMPLETE — all checks passed"
    : "FE-3.3 Component Verification FAILED",
);

assertComponentVerification(report);
