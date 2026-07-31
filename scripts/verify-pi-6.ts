/**
 * PI-6 — Delivery Readiness Freeze evidence.
 * Locks PI-6.1…PI-6.5 delivery readiness as complete for Product Implementation.
 * Reuses PI-6.5 hardening; no new Domains/architecture; no FE/BE/Data/Integration coupling.
 */
import {
  DELIVERY_BASELINE_REF,
  DELIVERY_FREEZE_REF,
  DELIVERY_HARDENING_GATE,
  DELIVERY_HARDENING_ID,
} from "../lib/delivery/hardening/delivery.hardening";
import { DELIVERY_READINESS_ID } from "../lib/delivery/foundation/delivery.constants";
import {
  assertDeliveryHardeningGate,
  runDeliveryHardeningGate,
} from "../lib/delivery/verify/delivery.hardening.gate";

export const PI6_FREEZE_ID = "pi-6-delivery-readiness-v1" as const;
export const PI6_BASELINE_ID =
  "product-implementation-delivery-readiness-v1" as const;

const report = runDeliveryHardeningGate();

console.log("=== PI-6 Delivery Readiness Freeze ===");
console.log(
  `freeze=${PI6_FREEZE_ID} baseline=${PI6_BASELINE_ID} hardening=${report.hardeningId} gate=${report.gateId}`,
);
console.log(
  `deliveryReadiness=${DELIVERY_READINESS_ID} baselineRef=${report.baselineId} freezeRef=${report.freezeId}`,
);
console.log(
  `summary: hardened=${report.hardened} packages=${report.summary.packages} domains=${report.summary.domains} concerns=${report.summary.concerns} layers=${report.summary.layers} signals=${report.summary.signals}`,
);
console.log(
  `children: foundation=${report.summary.foundationPassed} runtime=${report.summary.runtimePassed} exposure=${report.summary.exposurePassed} verification=${report.summary.verificationPassed}`,
);
console.log("");

const packageRows = report.checks.filter((c) =>
  c.id.startsWith("DHARDEN-PI-6."),
);
for (const row of packageRows) {
  console.log(`${row.status} ${row.id} — ${row.evidence}`);
}

console.log("");
console.log(
  report.checks.find((c) => c.id === "DHARDEN-NO-NEW")?.status === "PASS"
    ? "PASS no new Domain / architecture"
    : "FAIL new Domain / architecture",
);
console.log(
  report.checks.find((c) => c.id === "DHARDEN-NO-COUPLE")?.status === "PASS"
    ? "PASS no cross-layer coupling"
    : "FAIL cross-layer coupling",
);
console.log(
  report.baselineId === DELIVERY_BASELINE_REF &&
    report.baselineId === DELIVERY_READINESS_ID &&
    report.freezeId === DELIVERY_FREEZE_REF
    ? "PASS delivery readiness baseline intact"
    : "FAIL delivery readiness baseline",
);

console.log("");
if (
  !report.passed ||
  !report.hardened ||
  report.gateId !== DELIVERY_HARDENING_GATE ||
  report.hardeningId !== DELIVERY_HARDENING_ID ||
  report.baselineId !== DELIVERY_BASELINE_REF ||
  report.freezeId !== DELIVERY_FREEZE_REF ||
  report.baselineId !== DELIVERY_READINESS_ID
) {
  console.error("PI-6 Freeze FAILED — delivery hardening not complete");
  process.exit(1);
}

assertDeliveryHardeningGate(report);

console.log(
  "PI-6 Delivery Readiness Freeze COMPLETE — PI-6.1…PI-6.5 PASS; hardening=PASS",
);
