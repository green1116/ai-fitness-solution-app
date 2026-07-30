/**
 * PI-2 — Frontend Implementation Freeze evidence.
 * Locks FE-1…FE-5 presentation delivery as complete for Product Implementation.
 * Reuses FE-5.3 readiness; no Domain/API/Persistence ownership.
 */
import {
  FRONTEND_READINESS_GATE,
  FRONTEND_READINESS_ID,
  assertFrontendReadiness,
  runFrontendReadiness,
} from "../lib/frontend/frontend-readiness";

export const PI2_FREEZE_ID = "pi-2-frontend-implementation-v1" as const;
export const PI2_BASELINE_ID = "product-implementation-frontend-v1" as const;

const report = runFrontendReadiness();

console.log("=== PI-2 Frontend Implementation Freeze ===");
console.log(
  `freeze=${PI2_FREEZE_ID} baseline=${PI2_BASELINE_ID} readiness=${report.readinessId} gate=${report.gateId}`,
);
console.log(
  `summary: ready=${report.ready} FE-1…FE-5 packages=${report.summary.packages} routes=${report.summary.routes} screens=${report.summary.screens} CMP=${report.summary.cmpCatalogue} INT=${report.summary.intCatalogue} ST=${report.summary.stateClasses} bindings=${report.summary.adapterBindings}`,
);
console.log("");

const packageRows = report.checks.filter((c) => c.id.startsWith("READY-FE-"));
for (const row of packageRows) {
  console.log(`${row.status} ${row.id} — ${row.evidence}`);
}

console.log("");
console.log(
  report.checks.find((c) => c.id === "READY-NO-TAXONOMY")?.status === "PASS"
    ? "PASS no new taxonomy"
    : "FAIL taxonomy",
);
console.log(
  report.checks.find((c) => c.id === "READY-NO-BIZ")?.status === "PASS"
    ? "PASS no Domain/API/Persistence ownership"
    : "FAIL ownership",
);

console.log("");
if (
  !report.ready ||
  report.gateId !== FRONTEND_READINESS_GATE ||
  report.readinessId !== FRONTEND_READINESS_ID
) {
  console.error("PI-2 Freeze FAILED — frontend not READY");
  process.exit(1);
}

assertFrontendReadiness(report);

console.log(
  "PI-2 Frontend Implementation Freeze COMPLETE — FE-1…FE-5 PASS; readiness=READY",
);
