/**
 * Commercialization P8 — Release gate
 * Aggregates Commercialization P1–P7 release gates + evolution / launch / E12 / Platform baselines
 * Isolated — does not mutate E01–E12 or P1–P7 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import {
  checkCommercializationP1ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "../../p1/verify/commercialization.release.gate";
import { checkCommercializationP2ReleaseGate } from "../../p2/verify/commercialization.release.gate";
import { checkCommercializationP3ReleaseGate } from "../../p3/verify/commercialization.release.gate";
import { checkCommercializationP4ReleaseGate } from "../../p4/verify/commercialization.release.gate";
import { checkCommercializationP5ReleaseGate } from "../../p5/verify/commercialization.release.gate";
import { checkCommercializationP6ReleaseGate } from "../../p6/verify/commercialization.release.gate";
import { checkCommercializationP7ReleaseGate } from "../../p7/verify/commercialization.release.gate";
import { validateCommercializationP8DependencyChain } from "../freeze/freeze.dependency";
import {
  COMMERCIALIZATION_COMPLETE_ID,
  COMMERCIALIZATION_P8_COMPONENT_LOCK,
  COMMERCIALIZATION_P8_FREEZE_LOCK,
  ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  commercializationP8FreezeLockMatchesExpected,
  isCommercializationP8FreezeLockIntact,
} from "../freeze/freeze.lock";

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

export function checkCommercializationP8ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "COM-P8-LOCK",
      "freeze",
      "Commercialization freeze lock intact",
      isCommercializationP8FreezeLockIntact() &&
        commercializationP8FreezeLockMatchesExpected(),
      `version=${COMMERCIALIZATION_P8_FREEZE_LOCK.version} base=${COMMERCIALIZATION_P8_FREEZE_LOCK.base}`,
    ),
  );

  const chain = validateCommercializationP8DependencyChain();
  checks.push(
    check(
      "COM-P8-CHAIN",
      "freeze",
      "P1–P7 dependency chain valid",
      chain.ok,
      chain.ok ? "chain=ok" : chain.failures.join("; "),
    ),
  );

  const requiredIds = [
    "p1-sales",
    "p2-packaging",
    "p3-pricing",
    "p4-onboarding",
    "p5-delivery",
    "p6-revenue",
    "p7-governance",
    "p8-freeze",
  ];
  const lockedIds = COMMERCIALIZATION_P8_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "COM-P8-COMPONENTS",
      "freeze",
      "P8 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ) && COMMERCIALIZATION_P8_COMPONENT_LOCK.length === 8,
      `components=${lockedIds.join(",")}`,
    ),
  );

  checks.push(
    check(
      "COM-P8-EVOLUTION",
      "evolution",
      "Evolution complete baseline integrated",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        COMMERCIALIZATION_P8_FREEZE_LOCK.evolutionBaseline ===
          ENTERPRISE_EVOLUTION_COMPLETE_ID &&
        COMMERCIALIZATION_P8_FREEZE_LOCK.phases.p1.base ===
          ENTERPRISE_EVOLUTION_COMPLETE_ID,
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "COM-P8-LAUNCH",
      "launch",
      "Enterprise launch complete baseline integrated",
      ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        COMMERCIALIZATION_P8_FREEZE_LOCK.launchBaseline ===
          ENTERPRISE_LAUNCH_COMPLETE_ID,
      `launch=${ENTERPRISE_LAUNCH_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "COM-P8-E12",
      "e12",
      "E12 productization complete baseline preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1" &&
        COMMERCIALIZATION_P8_FREEZE_LOCK.e12Baseline ===
          E12_PRODUCTIZATION_COMPLETE_ID,
      `e12=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "COM-P8-PLATFORM",
      "platform-v1",
      "Platform v1 complete baseline aligned",
      platform.aligned === true &&
        COMMERCIALIZATION_P8_FREEZE_LOCK.platformBaseline ===
          "enterprise-platform-v1-complete",
      platform.summary,
    ),
  );

  checks.push(
    check(
      "COM-P8-COMPLETE",
      "freeze",
      "Commercialization complete id + alias frozen",
      COMMERCIALIZATION_COMPLETE_ID ===
        "enterprise-commercialization-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `complete=${COMMERCIALIZATION_COMPLETE_ID} alias=${ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID}`,
    ),
  );

  pushPhaseGate(
    checks,
    "COM-P8-P1",
    "sales",
    "P1 sales foundation release gate PASS",
    checkCommercializationP1ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "COM-P8-P2",
    "packaging",
    "P2 product packaging release gate PASS",
    checkCommercializationP2ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "COM-P8-P3",
    "pricing",
    "P3 pricing contract release gate PASS",
    checkCommercializationP3ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "COM-P8-P4",
    "onboarding",
    "P4 customer onboarding release gate PASS",
    checkCommercializationP4ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "COM-P8-P5",
    "delivery",
    "P5 delivery operations release gate PASS",
    checkCommercializationP5ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "COM-P8-P6",
    "revenue",
    "P6 revenue intelligence release gate PASS",
    checkCommercializationP6ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "COM-P8-P7",
    "governance",
    "P7 commercial governance release gate PASS",
    checkCommercializationP7ReleaseGate(),
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
      `commercialization-p8-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertCommercializationP8ReleaseGatePass(
  gate: ReleaseGateResult = checkCommercializationP8ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Commercialization P8 release gate failed: ${gate.summary}`,
    );
  }
}
