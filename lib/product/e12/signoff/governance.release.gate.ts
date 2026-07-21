/**
 * E12-P8 — Productization Governance Release Gate
 * Aggregates P1–P7 release gates + platform v1 baseline
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { checkE12P3ReleaseGate } from "../verify/admin.release.gate";
import { checkE12P5ReleaseGate } from "../verify/api.release.gate";
import { checkE12P4ReleaseGate } from "../verify/billing.release.gate";
import { checkE12P7ReleaseGate } from "../verify/commercial.release.gate";
import { checkE12P6ReleaseGate } from "../verify/deployment.release.gate";
import {
  checkE12P1ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "../verify/release.gate";
import { checkE12P2ReleaseGate } from "../verify/tenant.release.gate";
import {
  E12_P8_COMPONENT_LOCK,
  E12_P8_FREEZE_LOCK,
  e12P8FreezeLockMatchesExpected,
  isE12P8FreezeLockIntact,
  validateE12P8DependencyChain,
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

export function checkE12P8ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "GV-P8-LOCK",
      "signoff",
      "Productization freeze lock intact",
      isE12P8FreezeLockIntact() && e12P8FreezeLockMatchesExpected(),
      `version=${E12_P8_FREEZE_LOCK.version} base=${E12_P8_FREEZE_LOCK.base}`,
    ),
  );

  const chain = validateE12P8DependencyChain();
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
    "p1-product-foundation",
    "p2-tenant-product",
    "p3-admin-console",
    "p4-billing",
    "p5-api-product",
    "p6-deployment",
    "p7-commercial-control",
    "signoff",
  ];
  const lockedIds = E12_P8_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "GV-P8-COMPONENTS",
      "signoff",
      "P8 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ) && E12_P8_COMPONENT_LOCK.length === 8,
      `components=${lockedIds.join(",")}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "GV-P8-PLATFORM",
      "platform-v1",
      "Platform v1 complete baseline aligned",
      platform.aligned === true &&
        E12_P8_FREEZE_LOCK.platformBaseline ===
          "enterprise-platform-v1-complete",
      platform.summary,
    ),
  );

  pushPhaseGate(
    checks,
    "GV-P8-P1",
    "product",
    "P1 product foundation gate",
    checkE12P1ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P2",
    "tenant",
    "P2 tenant product gate",
    checkE12P2ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P3",
    "admin",
    "P3 admin console gate",
    checkE12P3ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P4",
    "billing",
    "P4 billing commercial gate",
    checkE12P4ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P5",
    "api",
    "P5 API productization gate",
    checkE12P5ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P6",
    "deployment",
    "P6 deployment package gate",
    checkE12P6ReleaseGate(),
  );
  pushPhaseGate(
    checks,
    "GV-P8-P7",
    "commercial",
    "P7 commercial control plane gate",
    checkE12P7ReleaseGate(),
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
      `e12-p8-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
      `complete=${E12_P8_FREEZE_LOCK.completeId}`,
    ].join(" "),
  };
}

export function assertE12P8ReleaseGatePass(
  gate: ReleaseGateResult = checkE12P8ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E12-P8 release gate failed: ${gate.summary}`);
  }
}
