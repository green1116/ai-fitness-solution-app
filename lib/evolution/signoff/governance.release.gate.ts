/**
 * Evolution P8 — Evolution Governance Release Gate
 * Aggregates Evolution P1–P7 release gates + operations / launch / E12 / Platform baselines
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../launch/signoff/governance.freeze.lock";
import { OPERATIONS_GOVERNANCE_COMPLETE_ID } from "../../operations/signoff/governance.freeze.lock";
import {
  checkEvolutionP7ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "../control/verify/evolution.control.gate";
import { checkEvolutionP3ReleaseGate } from "../customer/verify/customer.release.gate";
import { checkEvolutionP4ReleaseGate } from "../dashboard/verify/dashboard.release.gate";
import { checkEvolutionP5ReleaseGate } from "../global/verify/global.release.gate";
import { checkEvolutionP6ReleaseGate } from "../marketplace/verify/marketplace.release.gate";
import { checkEvolutionP2ReleaseGate } from "../predictive/verify/predictive.release.gate";
import { checkEvolutionP1ReleaseGate } from "../verify/evolution.release.gate";
import {
  ENTERPRISE_EVOLUTION_COMPLETE_ID,
  EVOLUTION_GOVERNANCE_COMPLETE_ID,
  EVOLUTION_P8_COMPONENT_LOCK,
  EVOLUTION_P8_FREEZE_LOCK,
  isEvolutionP8FreezeLockIntact,
  evolutionP8FreezeLockMatchesExpected,
  validateEvolutionP8DependencyChain,
} from "./governance.freeze.lock";

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
    check(phaseId, component, label, gate.result === "PASS", gate.summary),
  );
}

export function checkEvolutionP8ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "EVO-P8-LOCK",
      "signoff",
      "Evolution governance freeze lock intact",
      isEvolutionP8FreezeLockIntact() &&
        evolutionP8FreezeLockMatchesExpected(),
      `version=${EVOLUTION_P8_FREEZE_LOCK.version} base=${EVOLUTION_P8_FREEZE_LOCK.base}`,
    ),
  );

  const chain = validateEvolutionP8DependencyChain();
  checks.push(
    check(
      "EVO-P8-CHAIN",
      "signoff",
      "P1–P7 dependency chain valid",
      chain.ok,
      chain.ok ? "chain=ok" : chain.failures.join("; "),
    ),
  );

  const requiredIds = [
    "p1-optimization",
    "p2-predictive",
    "p3-customer",
    "p4-dashboard",
    "p5-global",
    "p6-marketplace",
    "p7-control-plane",
    "signoff",
  ];
  const lockedIds = EVOLUTION_P8_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "EVO-P8-COMPONENTS",
      "signoff",
      "P8 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ) && EVOLUTION_P8_COMPONENT_LOCK.length === 8,
      `components=${lockedIds.join(",")}`,
    ),
  );

  checks.push(
    check(
      "EVO-P8-OPERATIONS",
      "operations",
      "Post-launch operations complete baseline integrated",
      OPERATIONS_GOVERNANCE_COMPLETE_ID ===
        "enterprise-post-launch-operations-complete-v1" &&
        EVOLUTION_P8_FREEZE_LOCK.operationsBaseline ===
          OPERATIONS_GOVERNANCE_COMPLETE_ID &&
        EVOLUTION_P8_FREEZE_LOCK.phases.p1.base ===
          OPERATIONS_GOVERNANCE_COMPLETE_ID,
      `operations=${OPERATIONS_GOVERNANCE_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "EVO-P8-LAUNCH",
      "launch",
      "Enterprise launch complete baseline integrated",
      ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        EVOLUTION_P8_FREEZE_LOCK.launchBaseline ===
          ENTERPRISE_LAUNCH_COMPLETE_ID,
      `launch=${ENTERPRISE_LAUNCH_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "EVO-P8-E12",
      "e12",
      "E12 productization complete baseline preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1" &&
        EVOLUTION_P8_FREEZE_LOCK.e12Baseline ===
          E12_PRODUCTIZATION_COMPLETE_ID,
      `e12=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "EVO-P8-PLATFORM",
      "platform-v1",
      "Platform v1 complete baseline aligned",
      platform.aligned === true &&
        EVOLUTION_P8_FREEZE_LOCK.platformBaseline ===
          "enterprise-platform-v1-complete",
      platform.summary,
    ),
  );

  checks.push(
    check(
      "EVO-P8-COMPLETE",
      "signoff",
      "Evolution complete id + alias frozen",
      EVOLUTION_GOVERNANCE_COMPLETE_ID === "enterprise-evolution-complete-v1" &&
        ENTERPRISE_EVOLUTION_COMPLETE_ID ===
          "enterprise-evolution-complete-v1",
      `complete=${EVOLUTION_GOVERNANCE_COMPLETE_ID} alias=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  pushPhaseGate(
    checks,
    "EVO-P8-P1",
    "optimization",
    "P1 AI operations optimization release gate PASS",
    checkEvolutionP1ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "EVO-P8-P2",
    "predictive",
    "P2 predictive intelligence release gate PASS",
    checkEvolutionP2ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "EVO-P8-P3",
    "customer",
    "P3 autonomous customer success release gate PASS",
    checkEvolutionP3ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "EVO-P8-P4",
    "dashboard",
    "P4 intelligence dashboard release gate PASS",
    checkEvolutionP4ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "EVO-P8-P5",
    "global",
    "P5 global deployment network release gate PASS",
    checkEvolutionP5ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "EVO-P8-P6",
    "marketplace",
    "P6 marketplace ecosystem release gate PASS",
    checkEvolutionP6ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "EVO-P8-P7",
    "control",
    "P7 evolution control plane release gate PASS",
    checkEvolutionP7ReleaseGate(),
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
      `evolution-p8-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertEvolutionP8ReleaseGatePass(
  gate: ReleaseGateResult = checkEvolutionP8ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Evolution P8 release gate failed: ${gate.summary}`);
  }
}
