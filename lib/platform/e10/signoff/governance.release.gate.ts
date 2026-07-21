/**
 * E10-P8 — Governance Release Gate
 * Aggregates P1–P7 release gates → PASS / FAIL (freeze only)
 */

import { checkE10P4ReleaseGate } from "./event.release.gate";
import { checkE10P5ReleaseGate } from "./gateway.release.gate";
import {
  E10_P8_COMPONENT_LOCK,
  E10_P8_FREEZE_LOCK,
  e10P8FreezeLockMatchesExpected,
  isE10P8FreezeLockIntact,
  validateE10P8DependencyChain,
} from "./governance.freeze.lock";
import { checkE10P6ReleaseGate } from "./marketplace.release.gate";
import { checkE10P7ReleaseGate } from "./os.release.gate";
import {
  checkE10P1ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./release.gate";
import { checkE10P3ReleaseGate } from "./resource.release.gate";
import { checkE10P2ReleaseGate } from "./runtime.release.gate";

export type {
  GateCheckItem,
  GateVerdict,
  ReleaseGateResult,
};

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function pushPhaseGate(
  checks: GateCheckItem[],
  phaseId: string,
  component: string,
  label: string,
  gate: ReleaseGateResult,
): void {
  checks.push(
    check(
      phaseId,
      component,
      label,
      gate.result === "PASS",
      gate.summary,
    ),
  );
}

/** Probe P8 governance via prior phase gates + freeze lock. */
export function checkE10P8ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "GV-P8-LOCK",
      "signoff",
      "Governance freeze lock intact",
      isE10P8FreezeLockIntact() && e10P8FreezeLockMatchesExpected(),
      `version=${E10_P8_FREEZE_LOCK.version} base=${E10_P8_FREEZE_LOCK.base}`,
    ),
  );

  const chain = validateE10P8DependencyChain();
  checks.push(
    check(
      "GV-P8-CHAIN",
      "signoff",
      "P1–P7 dependency chain valid",
      chain.ok,
      chain.ok ? "chain=ok" : chain.failures.join("; "),
    ),
  );

  const requiredIds = [
    "p1-foundation",
    "p2-runtime",
    "p3-resource",
    "p4-event",
    "p5-gateway",
    "p6-marketplace",
    "p7-os",
    "signoff",
  ];
  const lockedIds = E10_P8_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "GV-P8-COMPONENTS",
      "signoff",
      "P8 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ),
      `components=${lockedIds.join(",")}`,
    ),
  );

  pushPhaseGate(
    checks,
    "GV-P8-P1",
    "p1-foundation",
    "E10-P1 Foundation release gate",
    checkE10P1ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P2",
    "p2-runtime",
    "E10-P2 Runtime release gate",
    checkE10P2ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P3",
    "p3-resource",
    "E10-P3 Resource release gate",
    checkE10P3ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P4",
    "p4-event",
    "E10-P4 Event release gate",
    checkE10P4ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P5",
    "p5-gateway",
    "E10-P5 Gateway release gate",
    checkE10P5ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P6",
    "p6-marketplace",
    "E10-P6 Marketplace release gate",
    checkE10P6ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P7",
    "p7-os",
    "E10-P7 OS release gate",
    checkE10P7ReleaseGate(),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `e10-p8-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE10P8ReleaseGatePass(
  gate: ReleaseGateResult = checkE10P8ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E10-P8 release gate failed: ${gate.summary}`);
  }
}
