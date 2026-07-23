/**
 * Operations O5 — Release gate
 * Aggregates Operations O1–O4 release gates + upstream baselines
 * Isolated — does not mutate E01–E12, commercialization, launch, or o1–o4 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import {
  checkOperationsO1ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "../../o1/verify/operations.release.gate";
import { checkOperationsO2ReleaseGate } from "../../o2/verify/operations.release.gate";
import { checkOperationsO3ReleaseGate } from "../../o3/verify/operations.release.gate";
import { checkOperationsO4ReleaseGate } from "../../o4/verify/operations.release.gate";
import { validateOperationsO5DependencyChain } from "../freeze/freeze.dependency";
import {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_COMPLETE_ID,
  OPERATIONS_O5_COMPONENT_LOCK,
  OPERATIONS_O5_FREEZE_LOCK,
  isOperationsO5FreezeLockIntact,
  operationsO5FreezeLockMatchesExpected,
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

export function checkOperationsO5ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "O5-LOCK",
      "freeze",
      "Operations governance freeze lock intact",
      isOperationsO5FreezeLockIntact() &&
        operationsO5FreezeLockMatchesExpected(),
      `version=${OPERATIONS_O5_FREEZE_LOCK.version} base=${OPERATIONS_O5_FREEZE_LOCK.base}`,
    ),
  );

  const chain = validateOperationsO5DependencyChain();
  checks.push(
    check(
      "O5-CHAIN",
      "freeze",
      "O1–O4 dependency chain valid",
      chain.ok,
      chain.ok ? "chain=ok" : chain.failures.join("; "),
    ),
  );

  const requiredIds = [
    "o1-customer-success",
    "o2-usage-intelligence",
    "o3-support-operations",
    "o4-growth-analytics",
    "o5-freeze",
  ];
  const lockedIds = OPERATIONS_O5_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "O5-COMPONENTS",
      "freeze",
      "O5 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ) && OPERATIONS_O5_COMPONENT_LOCK.length === 5,
      `components=${lockedIds.join(",")}`,
    ),
  );

  checks.push(
    check(
      "O5-LAUNCH-READINESS",
      "launch-readiness",
      "Launch readiness complete baseline integrated",
      ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
        "enterprise-launch-readiness-complete-v1" &&
        OPERATIONS_O5_FREEZE_LOCK.launchReadinessBaseline ===
          ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
      `launchReadiness=${ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "O5-COMMERCIALIZATION",
      "commercialization",
      "Commercialization complete baseline integrated",
      ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
        "enterprise-commercialization-complete-v1" &&
        OPERATIONS_O5_FREEZE_LOCK.commercializationBaseline ===
          ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
      `commercialization=${ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "O5-EVOLUTION",
      "evolution",
      "Evolution complete baseline integrated",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        OPERATIONS_O5_FREEZE_LOCK.evolutionBaseline ===
          ENTERPRISE_EVOLUTION_COMPLETE_ID,
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "O5-LAUNCH",
      "launch",
      "Enterprise launch complete baseline integrated",
      ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        OPERATIONS_O5_FREEZE_LOCK.launchBaseline ===
          ENTERPRISE_LAUNCH_COMPLETE_ID,
      `launch=${ENTERPRISE_LAUNCH_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "O5-E12",
      "e12",
      "E12 productization complete baseline preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1" &&
        OPERATIONS_O5_FREEZE_LOCK.e12Baseline ===
          E12_PRODUCTIZATION_COMPLETE_ID,
      `e12=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "O5-PLATFORM",
      "platform-v1",
      "Platform v1 complete baseline aligned",
      platform.aligned === true &&
        OPERATIONS_O5_FREEZE_LOCK.platformBaseline ===
          "enterprise-platform-v1-complete",
      platform.summary,
    ),
  );

  checks.push(
    check(
      "O5-COMPLETE",
      "freeze",
      "Operations complete id + alias frozen",
      OPERATIONS_COMPLETE_ID === "enterprise-operations-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1",
      `complete=${OPERATIONS_COMPLETE_ID} alias=${ENTERPRISE_OPERATIONS_COMPLETE_ID}`,
    ),
  );

  pushPhaseGate(
    checks,
    "O5-O1",
    "customer-success",
    "O1 customer success foundation release gate PASS",
    checkOperationsO1ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "O5-O2",
    "usage-intelligence",
    "O2 usage intelligence foundation release gate PASS",
    checkOperationsO2ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "O5-O3",
    "support-operations",
    "O3 support operations release gate PASS",
    checkOperationsO3ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "O5-O4",
    "growth-analytics",
    "O4 growth analytics foundation release gate PASS",
    checkOperationsO4ReleaseGate(),
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
      `operations-o5-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsO5ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsO5ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations O5 release gate failed: ${gate.summary}`);
  }
}
