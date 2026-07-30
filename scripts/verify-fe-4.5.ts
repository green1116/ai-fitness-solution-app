/**
 * FE-4.5 — Verification Consolidation runner.
 * OUTPUT: Verification + Evidence (presentation only).
 */
import {
  assertFe4Verification,
  runFe4Verification,
} from "../lib/frontend/fe4-verification";

const report = runFe4Verification();

console.log("=== FE-4.5 Verification Consolidation ===");
console.log(
  `summary: ST=${report.summary.stateClasses} bindings=${report.summary.adapterBindings} VIS=${report.summary.visibilityKeys} PF=${report.summary.prefetchIds} packages=${report.summary.packages} scanned=${report.summary.scannedFiles}`,
);
console.log("");

for (const row of report.checks) {
  console.log(`${row.status} [${row.source}] ${row.id} — ${row.title}`);
  console.log(`  evidence: ${row.evidence}`);
}

console.log("");
console.log(
  report.passed
    ? "FE-4.5 Verification Consolidation COMPLETE — all checks passed"
    : "FE-4.5 Verification Consolidation FAILED",
);

assertFe4Verification(report);
