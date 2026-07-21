/**
 * Launch P8 — Commercial Release Gate
 * Aggregates Launch P1–P7 release gates + E12 / Platform baselines
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../product/e12/signoff/governance.freeze.lock";
import {
  checkLaunchP7ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "../control/verify/control.release.gate";
import { checkLaunchP3ReleaseGate } from "../demo/verify/demo.release.gate";
import { checkLaunchP6ReleaseGate } from "../documentation/verify/documentation.release.gate";
import { checkLaunchP2ReleaseGate } from "../onboarding/verify/onboarding.release.gate";
import { checkLaunchP4ReleaseGate } from "../security/verify/security.release.gate";
import { checkLaunchP5ReleaseGate } from "../support/verify/support.release.gate";
import { checkLaunchP1ReleaseGate } from "../verify/release.gate";
import {
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
  LAUNCH_P8_COMPONENT_LOCK,
  LAUNCH_P8_FREEZE_LOCK,
  isLaunchP8FreezeLockIntact,
  launchP8FreezeLockMatchesExpected,
  validateLaunchP8DependencyChain,
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
    check(
      phaseId,
      component,
      label,
      gate.result === "PASS",
      gate.summary,
    ),
  );
}

export function checkLaunchP8ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "LN-P8-LOCK",
      "signoff",
      "Commercial release freeze lock intact",
      isLaunchP8FreezeLockIntact() && launchP8FreezeLockMatchesExpected(),
      `version=${LAUNCH_P8_FREEZE_LOCK.version} base=${LAUNCH_P8_FREEZE_LOCK.base}`,
    ),
  );

  const chain = validateLaunchP8DependencyChain();
  checks.push(
    check(
      "LN-P8-CHAIN",
      "signoff",
      "P1–P7 dependency chain valid",
      chain.ok,
      chain.ok ? "chain=ok" : chain.failures.join("; "),
    ),
  );

  const requiredIds = [
    "p1-production",
    "p2-onboarding",
    "p3-demo",
    "p4-security",
    "p5-sla",
    "p6-documentation",
    "p7-control-plane",
    "signoff",
  ];
  const lockedIds = LAUNCH_P8_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "LN-P8-COMPONENTS",
      "signoff",
      "P8 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ) && LAUNCH_P8_COMPONENT_LOCK.length === 8,
      `components=${lockedIds.join(",")}`,
    ),
  );

  checks.push(
    check(
      "LN-P8-E12",
      "e12",
      "E12 productization complete baseline preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1" &&
        LAUNCH_P8_FREEZE_LOCK.e12Baseline ===
          E12_PRODUCTIZATION_COMPLETE_ID,
      `e12=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "LN-P8-PLATFORM",
      "platform-v1",
      "Platform v1 complete baseline aligned",
      platform.aligned === true &&
        LAUNCH_P8_FREEZE_LOCK.platformBaseline ===
          "enterprise-platform-v1-complete",
      platform.summary,
    ),
  );

  checks.push(
    check(
      "LN-P8-COMPLETE",
      "signoff",
      "Commercial release complete id frozen",
      LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID ===
        "enterprise-launch-commercial-release-complete-v1",
      `complete=${LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID}`,
    ),
  );

  pushPhaseGate(
    checks,
    "LN-P8-P1",
    "production",
    "P1 production release gate PASS",
    checkLaunchP1ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "LN-P8-P2",
    "onboarding",
    "P2 onboarding release gate PASS",
    checkLaunchP2ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "LN-P8-P3",
    "demo",
    "P3 demo release gate PASS",
    checkLaunchP3ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "LN-P8-P4",
    "security",
    "P4 security release gate PASS",
    checkLaunchP4ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "LN-P8-P5",
    "sla",
    "P5 SLA support release gate PASS",
    checkLaunchP5ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "LN-P8-P6",
    "documentation",
    "P6 documentation release gate PASS",
    checkLaunchP6ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "LN-P8-P7",
    "control",
    "P7 control plane release gate PASS",
    checkLaunchP7ReleaseGate(),
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
      `launch-p8-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchP8ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchP8ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch P8 release gate failed: ${gate.summary}`);
  }
}
