/**
 * PI-5 — Integration Implementation Freeze evidence.
 * Locks PI-5.1…PI-5.5 integration delivery as complete for Product Implementation.
 * Reuses PI-5.5 hardening; no new Domains/integration families; no FE/BE/Data coupling.
 */
import {
  INTEGRATION_ARCHITECTURE_REF,
  INTEGRATION_BASELINE_REF,
  INTEGRATION_FREEZE_REF,
  INTEGRATION_HARDENING_GATE,
  INTEGRATION_HARDENING_ID,
} from "../lib/integration/hardening/integration.hardening";
import { INTEGRATION_ARCHITECTURE_ID } from "../lib/integration/foundation/integration.constants";
import {
  assertIntegrationHardeningGate,
  runIntegrationHardeningGate,
} from "../lib/integration/verify/integration.hardening.gate";

export const PI5_FREEZE_ID = "pi-5-integration-implementation-v1" as const;
export const PI5_BASELINE_ID = "product-implementation-integration-v1" as const;

const report = runIntegrationHardeningGate();

console.log("=== PI-5 Integration Implementation Freeze ===");
console.log(
  `freeze=${PI5_FREEZE_ID} baseline=${PI5_BASELINE_ID} hardening=${report.hardeningId} gate=${report.gateId}`,
);
console.log(
  `integrationArchitecture=${INTEGRATION_ARCHITECTURE_ID} baselineRef=${report.baselineId} freezeRef=${report.freezeId}`,
);
console.log(
  `summary: hardened=${report.hardened} packages=${report.summary.packages} domains=${report.summary.domains} points=${report.summary.points} workflows=${report.summary.workflows} contracts=${report.summary.contracts}`,
);
console.log(
  `children: foundation=${report.summary.foundationPassed} routing=${report.summary.routingPassed} runtime=${report.summary.runtimePassed} exposure=${report.summary.exposurePassed}`,
);
console.log("");

const packageRows = report.checks.filter((c) =>
  c.id.startsWith("IHARDEN-PI-5."),
);
for (const row of packageRows) {
  console.log(`${row.status} ${row.id} — ${row.evidence}`);
}

console.log("");
console.log(
  report.checks.find((c) => c.id === "IHARDEN-NO-NEW")?.status === "PASS"
    ? "PASS no new Domain / integration families"
    : "FAIL new Domain / integration families",
);
console.log(
  report.checks.find((c) => c.id === "IHARDEN-NO-COUPLE")?.status === "PASS"
    ? "PASS no FE/BE/Data coupling"
    : "FAIL FE/BE/Data coupling",
);
console.log(
  INTEGRATION_ARCHITECTURE_REF === INTEGRATION_ARCHITECTURE_ID &&
    report.baselineId === INTEGRATION_BASELINE_REF &&
    report.freezeId === INTEGRATION_FREEZE_REF
    ? "PASS integration architecture baseline intact"
    : "FAIL integration architecture baseline",
);

console.log("");
if (
  !report.passed ||
  !report.hardened ||
  report.gateId !== INTEGRATION_HARDENING_GATE ||
  report.hardeningId !== INTEGRATION_HARDENING_ID ||
  report.baselineId !== INTEGRATION_BASELINE_REF ||
  report.freezeId !== INTEGRATION_FREEZE_REF ||
  INTEGRATION_ARCHITECTURE_REF !== INTEGRATION_ARCHITECTURE_ID
) {
  console.error("PI-5 Freeze FAILED — integration hardening not complete");
  process.exit(1);
}

assertIntegrationHardeningGate(report);

console.log(
  "PI-5 Integration Implementation Freeze COMPLETE — PI-5.1…PI-5.5 PASS; hardening=PASS",
);
