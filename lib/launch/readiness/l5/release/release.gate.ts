/**
 * Launch L5 — Release gate
 * Aggregates Launch Readiness L1–L4 release gates + upstream baselines
 * Isolated — does not mutate E01–E12 or commercialization layers
 */

import { buildPlatformV1Manifest } from "../../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../../commercialization/p8/freeze/freeze.lock";
import {
  checkLaunchL1ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "../../l1/verify/launch.release.gate";
import { checkLaunchL2ReleaseGate } from "../../l2/verify/launch.release.gate";
import { checkLaunchL3ReleaseGate } from "../../l3/verify/launch.release.gate";
import { checkLaunchL4ReleaseGate } from "../../l4/verify/launch.release.gate";
import { validateLaunchL5DependencyChain } from "../freeze/freeze.dependency";
import {
  ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
  LAUNCH_L5_COMPONENT_LOCK,
  LAUNCH_L5_FREEZE_LOCK,
  LAUNCH_READINESS_COMPLETE_ID,
  isLaunchL5FreezeLockIntact,
  launchL5FreezeLockMatchesExpected,
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

export function checkLaunchL5ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "L5-LOCK",
      "freeze",
      "Launch readiness freeze lock intact",
      isLaunchL5FreezeLockIntact() && launchL5FreezeLockMatchesExpected(),
      `version=${LAUNCH_L5_FREEZE_LOCK.version} base=${LAUNCH_L5_FREEZE_LOCK.base}`,
    ),
  );

  const chain = validateLaunchL5DependencyChain();
  checks.push(
    check(
      "L5-CHAIN",
      "freeze",
      "L1–L4 dependency chain valid",
      chain.ok,
      chain.ok ? "chain=ok" : chain.failures.join("; "),
    ),
  );

  const requiredIds = [
    "l1-demo",
    "l2-pilot",
    "l3-hardening",
    "l4-validation",
    "l5-freeze",
  ];
  const lockedIds = LAUNCH_L5_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "L5-COMPONENTS",
      "freeze",
      "L5 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ) && LAUNCH_L5_COMPONENT_LOCK.length === 5,
      `components=${lockedIds.join(",")}`,
    ),
  );

  checks.push(
    check(
      "L5-COMM",
      "commercialization",
      "Commercialization complete baseline integrated",
      ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
        "enterprise-commercialization-complete-v1" &&
        LAUNCH_L5_FREEZE_LOCK.commercializationBaseline ===
          ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID &&
        LAUNCH_L5_FREEZE_LOCK.phases.l1.base ===
          "enterprise-commercialization-v1-release",
      `commercialization=${ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "L5-EVOLUTION",
      "evolution",
      "Evolution complete baseline integrated",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        LAUNCH_L5_FREEZE_LOCK.evolutionBaseline ===
          ENTERPRISE_EVOLUTION_COMPLETE_ID,
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "L5-LAUNCH",
      "launch",
      "Enterprise launch complete baseline integrated",
      ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        LAUNCH_L5_FREEZE_LOCK.launchBaseline === ENTERPRISE_LAUNCH_COMPLETE_ID,
      `launch=${ENTERPRISE_LAUNCH_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "L5-E12",
      "e12",
      "E12 productization complete baseline preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1" &&
        LAUNCH_L5_FREEZE_LOCK.e12Baseline === E12_PRODUCTIZATION_COMPLETE_ID,
      `e12=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "L5-PLATFORM",
      "platform-v1",
      "Platform v1 complete baseline aligned",
      platform.aligned === true &&
        LAUNCH_L5_FREEZE_LOCK.platformBaseline ===
          "enterprise-platform-v1-complete",
      platform.summary,
    ),
  );

  checks.push(
    check(
      "L5-COMPLETE",
      "freeze",
      "Launch readiness complete id + alias frozen",
      LAUNCH_READINESS_COMPLETE_ID ===
        "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1",
      `complete=${LAUNCH_READINESS_COMPLETE_ID} alias=${ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID}`,
    ),
  );

  pushPhaseGate(
    checks,
    "L5-L1",
    "demo",
    "L1 demo foundation release gate PASS",
    checkLaunchL1ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "L5-L2",
    "pilot",
    "L2 pilot customer flow release gate PASS",
    checkLaunchL2ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "L5-L3",
    "hardening",
    "L3 production hardening release gate PASS",
    checkLaunchL3ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "L5-L4",
    "validation",
    "L4 enterprise delivery validation release gate PASS",
    checkLaunchL4ReleaseGate(),
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
      `launch-l5-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchL5ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchL5ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch L5 release gate failed: ${gate.summary}`);
  }
}
