/**
 * E09-P8 — Governance Release Gate
 * Aggregates P1–P6 release gates + P7 civilization probe → PASS / FAIL
 */

import {
  E09_CIVILIZATION_BASE,
  E09_CIVILIZATION_ID,
  E09_CIVILIZATION_VERSION,
} from "../civilization/civilization.constants";
import {
  clearOrchestratorState,
  evaluate,
  orchestrate,
  synchronize,
} from "../civilization/civilization.orchestrator";
import {
  buildCivilizationRegistryManifest,
  clearCivilizations,
  getCivilization,
  registerCivilization,
  removeCivilization,
} from "../civilization/civilization.registry";
import { createCivilizationRuntime } from "../civilization/civilization.runtime";
import { checkE09P6ReleaseGate } from "./agent.release.gate";
import { checkE09P5ReleaseGate } from "./economy.release.gate";
import { checkE09P4ReleaseGate } from "./federation.release.gate";
import {
  E09_P8_COMPONENT_LOCK,
  E09_P8_FREEZE_LOCK,
  e09P8FreezeLockMatchesExpected,
  isE09P8FreezeLockIntact,
} from "./governance.freeze.lock";
import { checkE09P3ReleaseGate } from "./market.release.gate";
import { checkE09P2ReleaseGate } from "./regional.release.gate";
import {
  checkE09P1ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./release.gate";

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

function cleanupCivilizationGateState(): void {
  clearOrchestratorState();
  clearCivilizations();
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

/** Probe P8 governance via prior phase gates + civilization OS. */
export function checkE09P8ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  // Lock
  checks.push(
    check(
      "GV-P8-LOCK",
      "signoff",
      "Governance freeze lock intact",
      isE09P8FreezeLockIntact() && e09P8FreezeLockMatchesExpected(),
      `version=${E09_P8_FREEZE_LOCK.version} base=${E09_P8_FREEZE_LOCK.base}`,
    ),
  );

  // Component catalog completeness
  const requiredIds = [
    "p1-global",
    "p2-regional",
    "p3-market",
    "p4-federation",
    "p5-economy",
    "p6-agent",
    "p7-civilization",
    "signoff",
  ];
  const lockedIds = E09_P8_COMPONENT_LOCK.map((c) => c.id);
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

  // Upstream phase gates
  pushPhaseGate(
    checks,
    "GV-P8-P1",
    "p1-global",
    "E09-P1 release gate",
    checkE09P1ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P2",
    "p2-regional",
    "E09-P2 release gate",
    checkE09P2ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P3",
    "p3-market",
    "E09-P3 release gate",
    checkE09P3ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P4",
    "p4-federation",
    "E09-P4 release gate",
    checkE09P4ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P5",
    "p5-economy",
    "E09-P5 release gate",
    checkE09P5ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P6",
    "p6-agent",
    "E09-P6 release gate",
    checkE09P6ReleaseGate(),
  );

  // P7 civilization foundation + orchestrator
  try {
    cleanupCivilizationGateState();
    const civilization = registerCivilization({
      id: "e09.p8.gate.civilization",
      name: "Governance Gate Civ",
      code: "GVC",
      stage: "FORMING",
      score: 30,
    });
    const fetched = getCivilization(civilization.id);
    const plan = orchestrate(civilization.id, { mode: "UNIFIED" });
    const sync = synchronize(civilization.id);
    const evaluation = evaluate(civilization.id);
    const manifest = buildCivilizationRegistryManifest();
    const removed = removeCivilization(civilization.id);
    const civilizationOk =
      fetched?.id === civilization.id &&
      plan.mode === "UNIFIED" &&
      sync.aligned === true &&
      evaluation.civilizationId === civilization.id &&
      removed === true &&
      manifest.civilizationId === E09_CIVILIZATION_ID &&
      manifest.version === E09_CIVILIZATION_VERSION &&
      manifest.base === E09_CIVILIZATION_BASE;
    checks.push(
      check(
        "GV-P8-P7-FOUNDATION",
        "p7-civilization",
        "Civilization foundation + orchestrator",
        civilizationOk,
        `civ=${civilization.id} sync=${sync.aligned} score=${evaluation.score}`,
      ),
    );
    cleanupCivilizationGateState();
  } catch (error) {
    checks.push(
      check(
        "GV-P8-P7-FOUNDATION",
        "p7-civilization",
        "Civilization foundation + orchestrator",
        false,
        error instanceof Error ? error.message : "civilization probe failed",
      ),
    );
  }

  // P7 civilization runtime
  try {
    cleanupCivilizationGateState();
    const runtime = createCivilizationRuntime({ runtimeId: "e09-p8-gate" });
    runtime.initialize();
    runtime.start();
    runtime.registerCivilization({
      id: "e09.p8.gate.runtime.civ",
      name: "Runtime Civ",
      code: "RCV",
    });
    const plan = runtime.orchestrate("e09.p8.gate.runtime.civ", {
      mode: "AGENTIC",
    });
    const sync = runtime.synchronize("e09.p8.gate.runtime.civ");
    const evaluation = runtime.evaluate("e09.p8.gate.runtime.civ");
    const snap = runtime.status();
    runtime.stop();

    const runtimeOk =
      plan.mode === "AGENTIC" &&
      sync.aligned === true &&
      evaluation.civilizationId === "e09.p8.gate.runtime.civ" &&
      snap.status === "RUNNING" &&
      snap.civilizationCount === 1 &&
      snap.planCount === 1;
    checks.push(
      check(
        "GV-P8-P7-RUNTIME",
        "p7-civilization",
        "Civilization runtime",
        runtimeOk,
        `status=${snap.status} civs=${snap.civilizationCount} plans=${snap.planCount}`,
      ),
    );
    cleanupCivilizationGateState();
  } catch (error) {
    checks.push(
      check(
        "GV-P8-P7-RUNTIME",
        "p7-civilization",
        "Civilization runtime",
        false,
        error instanceof Error
          ? error.message
          : "civilization runtime probe failed",
      ),
    );
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `e09-p8-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE09P8ReleaseGatePass(
  gate: ReleaseGateResult = checkE09P8ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E09-P8 release gate failed: ${gate.summary}`);
  }
}
