/**
 * PI-4 — Data Implementation Freeze evidence.
 * Locks PI-4.1…PI-4.5 data delivery as complete for Product Implementation.
 * Reuses PI-4.5 hardening; no new Domains/repo/storage families; no FE/BE coupling.
 */
import { PERSISTENCE_ARCHITECTURE_ID } from "../lib/data/foundation/data.constants";
import {
  DATA_HARDENING_GATE,
  DATA_HARDENING_ID,
  PERSISTENCE_ARCHITECTURE_REF,
} from "../lib/data/hardening/data.hardening";
import {
  assertDataHardeningGate,
  runDataHardeningGate,
} from "../lib/data/verify/data.hardening.gate";

export const PI4_FREEZE_ID = "pi-4-data-implementation-v1" as const;
export const PI4_BASELINE_ID = "product-implementation-data-v1" as const;

const report = runDataHardeningGate();

console.log("=== PI-4 Data Implementation Freeze ===");
console.log(
  `freeze=${PI4_FREEZE_ID} baseline=${PI4_BASELINE_ID} hardening=${report.hardeningId} gate=${report.gateId}`,
);
console.log(`persistenceArchitecture=${report.persistenceArchId}`);
console.log(
  `summary: hardened=${report.hardened} packages=${report.summary.packages} domains=${report.summary.domains} repos=${report.summary.repositories} families=${report.summary.storageFamilies} models=${report.summary.models} exposures=${report.summary.exposures}`,
);
console.log("");

const packageRows = report.checks.filter((c) =>
  c.id.startsWith("DHARDEN-PI-4."),
);
for (const row of packageRows) {
  console.log(`${row.status} ${row.id} — ${row.evidence}`);
}

console.log("");
console.log(
  report.checks.find((c) => c.id === "DHARDEN-NO-NEW")?.status === "PASS"
    ? "PASS no new Domain / repo / storage families"
    : "FAIL new Domain / repo / storage families",
);
console.log(
  report.checks.find((c) => c.id === "DHARDEN-NO-COUPLE")?.status === "PASS"
    ? "PASS no frontend/backend coupling"
    : "FAIL frontend/backend coupling",
);
console.log(
  report.persistenceArchId === PERSISTENCE_ARCHITECTURE_ID &&
    PERSISTENCE_ARCHITECTURE_REF === PERSISTENCE_ARCHITECTURE_ID
    ? "PASS persistence architecture baseline intact"
    : "FAIL persistence architecture baseline",
);

console.log("");
if (
  !report.passed ||
  !report.hardened ||
  report.gateId !== DATA_HARDENING_GATE ||
  report.hardeningId !== DATA_HARDENING_ID ||
  report.persistenceArchId !== PERSISTENCE_ARCHITECTURE_ID
) {
  console.error("PI-4 Freeze FAILED — data hardening not complete");
  process.exit(1);
}

assertDataHardeningGate(report);

console.log(
  "PI-4 Data Implementation Freeze COMPLETE — PI-4.1…PI-4.5 PASS; hardening=PASS",
);
