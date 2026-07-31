/**
 * PI-3 — Backend Implementation Freeze evidence.
 * Locks PI-3.1…PI-3.5 backend delivery as complete for Product Implementation.
 * Reuses PI-3.5 hardening; no new Domains/API families; no frontend coupling.
 */
import { BACKEND_ARCHITECTURE_BASELINE_ID } from "../lib/backend/foundation/backend.constants";
import {
  BACKEND_ARCHITECTURE_FREEZE_ID,
  BACKEND_HARDENING_GATE,
  BACKEND_HARDENING_ID,
} from "../lib/backend/hardening/backend.hardening";
import {
  assertBackendHardeningGate,
  runBackendHardeningGate,
} from "../lib/backend/verify/backend.hardening.gate";

export const PI3_FREEZE_ID = "pi-3-backend-implementation-v1" as const;
export const PI3_BASELINE_ID = "product-implementation-backend-v1" as const;

const report = runBackendHardeningGate();

console.log("=== PI-3 Backend Implementation Freeze ===");
console.log(
  `freeze=${PI3_FREEZE_ID} baseline=${PI3_BASELINE_ID} hardening=${report.hardeningId} gate=${report.gateId}`,
);
console.log(
  `architectureBaseline=${report.baselineId} architectureFreeze=${report.freezeId}`,
);
console.log(
  `summary: hardened=${report.hardened} packages=${report.summary.packages} domains=${report.summary.domains} commands=${report.summary.commands} services=${report.summary.services} families=${report.summary.apiFamilies} bindings=${report.summary.apiBindings}`,
);
console.log("");

const packageRows = report.checks.filter((c) =>
  c.id.startsWith("HARDEN-PI-3."),
);
for (const row of packageRows) {
  console.log(`${row.status} ${row.id} — ${row.evidence}`);
}

console.log("");
console.log(
  report.checks.find((c) => c.id === "HARDEN-NO-NEW")?.status === "PASS"
    ? "PASS no new Domain / API families"
    : "FAIL new Domain / API families",
);
console.log(
  report.checks.find((c) => c.id === "HARDEN-NO-FE")?.status === "PASS"
    ? "PASS no frontend coupling"
    : "FAIL frontend coupling",
);
console.log(
  report.baselineId === BACKEND_ARCHITECTURE_BASELINE_ID &&
    report.freezeId === BACKEND_ARCHITECTURE_FREEZE_ID
    ? "PASS backend architecture baseline intact"
    : "FAIL backend architecture baseline",
);

console.log("");
if (
  !report.passed ||
  !report.hardened ||
  report.gateId !== BACKEND_HARDENING_GATE ||
  report.hardeningId !== BACKEND_HARDENING_ID ||
  report.baselineId !== BACKEND_ARCHITECTURE_BASELINE_ID
) {
  console.error("PI-3 Freeze FAILED — backend hardening not complete");
  process.exit(1);
}

assertBackendHardeningGate(report);

console.log(
  "PI-3 Backend Implementation Freeze COMPLETE — PI-3.1…PI-3.5 PASS; hardening=PASS",
);
