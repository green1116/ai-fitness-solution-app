/**
 * PI-7 — Product Implementation Freeze evidence.
 * Locks PI-7.1…PI-7.5 product implementation as complete.
 * Reuses PI-7.5 hardening; no new Domains/architecture; no cross-layer coupling.
 */
import {
  IMPLEMENTATION_BASELINE_REF,
  IMPLEMENTATION_FREEZE_REF,
  IMPLEMENTATION_HARDENING_GATE,
  IMPLEMENTATION_HARDENING_ID,
} from "../lib/implementation/hardening/implementation.hardening";
import { IMPLEMENTATION_BASELINE_ID } from "../lib/implementation/foundation/implementation.constants";
import {
  assertImplementationHardeningGate,
  runImplementationHardeningGate,
} from "../lib/implementation/verify/implementation.hardening.gate";

export const PI7_FREEZE_ID = "pi-7-product-implementation-v1" as const;
export const PI7_BASELINE_ID =
  "product-implementation-complete-v1" as const;

const report = runImplementationHardeningGate();

console.log("=== PI-7 Product Implementation Freeze ===");
console.log(
  `freeze=${PI7_FREEZE_ID} baseline=${PI7_BASELINE_ID} hardening=${report.hardeningId} gate=${report.gateId}`,
);
console.log(
  `implementationBaseline=${IMPLEMENTATION_BASELINE_ID} baselineRef=${report.baselineId} freezeRef=${report.freezeId}`,
);
console.log(
  `summary: hardened=${report.hardened} packages=${report.summary.packages} domains=${report.summary.domains} layers=${report.summary.layers} signals=${report.summary.signals}`,
);
console.log(
  `children: foundation=${report.summary.foundationPassed} routing=${report.summary.routingPassed} runtime=${report.summary.runtimePassed} exposure=${report.summary.exposurePassed}`,
);
console.log("");

const packageRows = report.checks.filter((c) =>
  c.id.startsWith("IHARDEN-PI-7."),
);
for (const row of packageRows) {
  console.log(`${row.status} ${row.id} — ${row.evidence}`);
}

console.log("");
console.log(
  report.checks.find((c) => c.id === "IHARDEN-NO-NEW")?.status === "PASS"
    ? "PASS no new Domain / architecture"
    : "FAIL new Domain / architecture",
);
console.log(
  report.checks.find((c) => c.id === "IHARDEN-NO-COUPLE")?.status === "PASS"
    ? "PASS no cross-layer coupling"
    : "FAIL cross-layer coupling",
);
console.log(
  report.baselineId === IMPLEMENTATION_BASELINE_REF &&
    report.baselineId === IMPLEMENTATION_BASELINE_ID &&
    report.freezeId === IMPLEMENTATION_FREEZE_REF
    ? "PASS product implementation baseline intact"
    : "FAIL product implementation baseline",
);

console.log("");
if (
  !report.passed ||
  !report.hardened ||
  report.gateId !== IMPLEMENTATION_HARDENING_GATE ||
  report.hardeningId !== IMPLEMENTATION_HARDENING_ID ||
  report.baselineId !== IMPLEMENTATION_BASELINE_REF ||
  report.freezeId !== IMPLEMENTATION_FREEZE_REF ||
  report.baselineId !== IMPLEMENTATION_BASELINE_ID
) {
  console.error("PI-7 Freeze FAILED — implementation hardening not complete");
  process.exit(1);
}

assertImplementationHardeningGate(report);

console.log(
  "PI-7 Product Implementation Freeze COMPLETE — PI-7.1…PI-7.5 PASS; hardening=PASS",
);
