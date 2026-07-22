/**
 * Post-Launch P8 — Operations Governance Release Gate
 * Aggregates Operations P1–P7 release gates + launch / E12 / Platform baselines
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../product/e12/signoff/governance.freeze.lock";
import {
  ENTERPRISE_LAUNCH_COMPLETE_ID,
} from "../../launch/signoff/governance.freeze.lock";
import {
  checkOperationsP7ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "../control/verify/operations.control.gate";
import { checkOperationsP2ReleaseGate } from "../customer-success/verify/success.release.gate";
import { checkOperationsP5ReleaseGate } from "../growth/verify/growth.release.gate";
import { checkOperationsP3ReleaseGate } from "../incident/verify/incident.release.gate";
import { checkOperationsP1ReleaseGate } from "../production/verify/production.release.gate";
import { checkOperationsP4ReleaseGate } from "../release/verify/release.management.gate";
import { checkOperationsP6ReleaseGate } from "../support/verify/enterprise.support.gate";
import {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_GOVERNANCE_COMPLETE_ID,
  OPERATIONS_P8_COMPONENT_LOCK,
  OPERATIONS_P8_FREEZE_LOCK,
  isOperationsP8FreezeLockIntact,
  operationsP8FreezeLockMatchesExpected,
  validateOperationsP8DependencyChain,
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

export function checkOperationsP8ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "OPS-P8-LOCK",
      "signoff",
      "Operations governance freeze lock intact",
      isOperationsP8FreezeLockIntact() &&
        operationsP8FreezeLockMatchesExpected(),
      `version=${OPERATIONS_P8_FREEZE_LOCK.version} base=${OPERATIONS_P8_FREEZE_LOCK.base}`,
    ),
  );

  const chain = validateOperationsP8DependencyChain();
  checks.push(
    check(
      "OPS-P8-CHAIN",
      "signoff",
      "P1–P7 dependency chain valid",
      chain.ok,
      chain.ok ? "chain=ok" : chain.failures.join("; "),
    ),
  );

  const requiredIds = [
    "p1-production",
    "p2-customer-success",
    "p3-incident",
    "p4-release",
    "p5-growth",
    "p6-support",
    "p7-control-plane",
    "signoff",
  ];
  const lockedIds = OPERATIONS_P8_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "OPS-P8-COMPONENTS",
      "signoff",
      "P8 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ) && OPERATIONS_P8_COMPONENT_LOCK.length === 8,
      `components=${lockedIds.join(",")}`,
    ),
  );

  checks.push(
    check(
      "OPS-P8-LAUNCH",
      "launch",
      "Enterprise launch complete baseline integrated",
      ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        OPERATIONS_P8_FREEZE_LOCK.launchBaseline ===
          ENTERPRISE_LAUNCH_COMPLETE_ID &&
        OPERATIONS_P8_FREEZE_LOCK.phases.p1.base ===
          ENTERPRISE_LAUNCH_COMPLETE_ID,
      `launch=${ENTERPRISE_LAUNCH_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "OPS-P8-E12",
      "e12",
      "E12 productization complete baseline preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1" &&
        OPERATIONS_P8_FREEZE_LOCK.e12Baseline ===
          E12_PRODUCTIZATION_COMPLETE_ID,
      `e12=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OPS-P8-PLATFORM",
      "platform-v1",
      "Platform v1 complete baseline aligned",
      platform.aligned === true &&
        OPERATIONS_P8_FREEZE_LOCK.platformBaseline ===
          "enterprise-platform-v1-complete",
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OPS-P8-COMPLETE",
      "signoff",
      "Operations complete id + alias frozen",
      OPERATIONS_GOVERNANCE_COMPLETE_ID ===
        "enterprise-post-launch-operations-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1",
      `complete=${OPERATIONS_GOVERNANCE_COMPLETE_ID} alias=${ENTERPRISE_OPERATIONS_COMPLETE_ID}`,
    ),
  );

  pushPhaseGate(
    checks,
    "OPS-P8-P1",
    "production",
    "P1 production release gate PASS",
    checkOperationsP1ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "OPS-P8-P2",
    "customer-success",
    "P2 customer success release gate PASS",
    checkOperationsP2ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "OPS-P8-P3",
    "incident",
    "P3 incident response release gate PASS",
    checkOperationsP3ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "OPS-P8-P4",
    "release",
    "P4 release management release gate PASS",
    checkOperationsP4ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "OPS-P8-P5",
    "growth",
    "P5 growth analytics release gate PASS",
    checkOperationsP5ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "OPS-P8-P6",
    "support",
    "P6 enterprise support release gate PASS",
    checkOperationsP6ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "OPS-P8-P7",
    "control",
    "P7 operations control plane release gate PASS",
    checkOperationsP7ReleaseGate(),
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
      `operations-p8-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsP8ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsP8ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations P8 release gate failed: ${gate.summary}`);
  }
}
