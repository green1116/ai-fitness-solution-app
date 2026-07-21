/**
 * E11-P8 — Governance Release Gate
 * Aggregates P1–P7 release gates → PASS / FAIL (freeze only)
 */

import { checkE11P6ReleaseGate } from "../verify/autonomous.release.gate";
import { checkE11P7ReleaseGate } from "../verify/control-plane.release.gate";
import { checkE11P2ReleaseGate } from "../verify/execution.release.gate";
import { checkE11P4ReleaseGate } from "../verify/governance.release.gate";
import { checkE11P5ReleaseGate } from "../verify/observability.release.gate";
import {
  checkE11P1ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "../verify/release.gate";
import { checkE11P3ReleaseGate } from "../verify/tenant.release.gate";
import {
  E11_P8_COMPONENT_LOCK,
  E11_P8_FREEZE_LOCK,
  e11P8FreezeLockMatchesExpected,
  isE11P8FreezeLockIntact,
  validateE11P8DependencyChain,
} from "./governance.freeze.lock";
import { validateE11P8ComponentLockStructure } from "./component.integrity";

export type { GateCheckItem, GateVerdict, ReleaseGateResult };

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
export function checkE11P8ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "GV-P8-LOCK",
      "signoff",
      "Governance freeze lock intact",
      isE11P8FreezeLockIntact() && e11P8FreezeLockMatchesExpected(),
      `version=${E11_P8_FREEZE_LOCK.version} base=${E11_P8_FREEZE_LOCK.base}`,
    ),
  );

  const chain = validateE11P8DependencyChain();
  checks.push(
    check(
      "GV-P8-CHAIN",
      "signoff",
      "P1–P7 dependency chain valid",
      chain.ok,
      chain.ok ? "chain=ok" : chain.failures.join("; "),
    ),
  );

  const componentStructure = validateE11P8ComponentLockStructure();
  const requiredIds = [
    "p1-foundation",
    "p2-execution",
    "p3-tenant",
    "p4-governance",
    "p5-observability",
    "p6-autonomous",
    "p7-control-plane",
    "signoff",
  ];
  const lockedIds = E11_P8_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "GV-P8-COMPONENTS",
      "signoff",
      "P8 component lock complete",
      componentStructure.ok &&
        requiredIds.every((id) =>
          lockedIds.includes(id as (typeof lockedIds)[number]),
        ),
      componentStructure.ok
        ? `components=${lockedIds.join(",")}`
        : componentStructure.failures.join("; "),
    ),
  );

  pushPhaseGate(
    checks,
    "GV-P8-P1",
    "p1-foundation",
    "E11-P1 Foundation release gate",
    checkE11P1ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P2",
    "p2-execution",
    "E11-P2 Execution release gate",
    checkE11P2ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P3",
    "p3-tenant",
    "E11-P3 Tenant release gate",
    checkE11P3ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P4",
    "p4-governance",
    "E11-P4 Governance release gate",
    checkE11P4ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P5",
    "p5-observability",
    "E11-P5 Observability release gate",
    checkE11P5ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P6",
    "p6-autonomous",
    "E11-P6 Autonomous release gate",
    checkE11P6ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P7",
    "p7-control-plane",
    "E11-P7 Control plane release gate",
    checkE11P7ReleaseGate(),
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
      `e11-p8-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE11P8ReleaseGatePass(
  gate: ReleaseGateResult = checkE11P8ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E11-P8 release gate failed: ${gate.summary}`);
  }
}
