/**
 * PI-8 — Product Closure Freeze evidence.
 * Locks PI-8.1…PI-8.5 product closure as complete.
 * Reuses PI-8.5 hardening; no new Domains/architecture; no cross-layer coupling.
 */
import {
  CLOSURE_BASELINE_REF,
  CLOSURE_FREEZE_REF,
  CLOSURE_HARDENING_GATE,
  CLOSURE_HARDENING_ID,
} from "../lib/closure/hardening/closure.hardening";
import { CLOSURE_BASELINE_ID } from "../lib/closure/foundation/closure.constants";
import {
  assertClosureHardeningGate,
  runClosureHardeningGate,
} from "../lib/closure/verify/closure.hardening.gate";

export const PI8_FREEZE_ID = "pi-8-product-closure-v1" as const;
export const PI8_BASELINE_ID = "product-closure-complete-v1" as const;

const report = runClosureHardeningGate();

console.log("=== PI-8 Product Closure Freeze ===");
console.log(
  `freeze=${PI8_FREEZE_ID} baseline=${PI8_BASELINE_ID} hardening=${report.hardeningId} gate=${report.gateId}`,
);
console.log(
  `closureBaseline=${CLOSURE_BASELINE_ID} baselineRef=${report.baselineId} freezeRef=${report.freezeId}`,
);
console.log(
  `summary: hardened=${report.hardened} packages=${report.summary.packages} domains=${report.summary.domains} layers=${report.summary.layers} signals=${report.summary.signals}`,
);
console.log(
  `children: foundation=${report.summary.foundationPassed} routing=${report.summary.routingPassed} runtime=${report.summary.runtimePassed} exposure=${report.summary.exposurePassed}`,
);
console.log("");

const packageRows = report.checks.filter((c) =>
  c.id.startsWith("CHARDEN-PI-8."),
);
for (const row of packageRows) {
  console.log(`${row.status} ${row.id} — ${row.evidence}`);
}

console.log("");
console.log(
  report.checks.find((c) => c.id === "CHARDEN-NO-NEW")?.status === "PASS"
    ? "PASS no new Domain / architecture"
    : "FAIL new Domain / architecture",
);
console.log(
  report.checks.find((c) => c.id === "CHARDEN-NO-COUPLE")?.status === "PASS"
    ? "PASS no cross-layer coupling"
    : "FAIL cross-layer coupling",
);
console.log(
  report.baselineId === CLOSURE_BASELINE_REF &&
    report.baselineId === CLOSURE_BASELINE_ID &&
    report.freezeId === CLOSURE_FREEZE_REF
    ? "PASS product closure baseline intact"
    : "FAIL product closure baseline",
);

console.log("");
if (
  !report.passed ||
  !report.hardened ||
  report.gateId !== CLOSURE_HARDENING_GATE ||
  report.hardeningId !== CLOSURE_HARDENING_ID ||
  report.baselineId !== CLOSURE_BASELINE_REF ||
  report.freezeId !== CLOSURE_FREEZE_REF ||
  report.baselineId !== CLOSURE_BASELINE_ID
) {
  console.error("PI-8 Freeze FAILED — closure hardening not complete");
  process.exit(1);
}

assertClosureHardeningGate(report);

console.log(
  "PI-8 Product Closure Freeze COMPLETE — PI-8.1…PI-8.5 PASS; hardening=PASS",
);
