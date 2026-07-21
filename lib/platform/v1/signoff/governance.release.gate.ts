/**
 * Platform v1 — Governance Release Gate
 * Freezes E09 / E10 / E11 complete + platform v1 alignment
 */

import {
  e09P8FreezeLockMatchesExpected,
  isE09P8FreezeLockIntact,
} from "../../../global-network/e09/signoff/governance.freeze.lock";
import { checkE09P8ReleaseGate } from "../../../global-network/e09/signoff/governance.release.gate";
import {
  e11P8FreezeLockMatchesExpected,
  isE11P8FreezeLockIntact,
} from "../../../cloud-runtime/e11/signoff/governance.freeze.lock";
import { checkE11P8ReleaseGate } from "../../../cloud-runtime/e11/signoff/governance.release.gate";
import {
  e10P8FreezeLockMatchesExpected,
  isE10P8FreezeLockIntact,
} from "../../e10/signoff/governance.freeze.lock";
import { checkE10P8ReleaseGate } from "../../e10/signoff/governance.release.gate";
import {
  checkPlatformV1ReleaseGate,
  type ReleaseGateResult as AlignmentGateResult,
} from "../alignment.release.gate";
import { isEnterpriseDependencyMapAligned } from "../dependency.map";
import { buildPlatformV1Manifest } from "../platform.manifest";
import {
  E09_ENTERPRISE_COMPLETE_ID,
  E10_ENTERPRISE_COMPLETE_ID,
  E11_ENTERPRISE_COMPLETE_ID,
} from "../platform.v1.constants";
import {
  PLATFORM_V1_P8_COMPONENT_LOCK,
  PLATFORM_V1_P8_FREEZE_LOCK,
  platformV1P8FreezeLockMatchesExpected,
  isPlatformV1P8FreezeLockIntact,
  validatePlatformV1P8CompleteChain,
} from "./governance.freeze.lock";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
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

function pushGate(
  checks: GateCheckItem[],
  phaseId: string,
  component: string,
  label: string,
  gate: { result: GateVerdict; summary: string },
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

export function checkPlatformV1GovernanceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const manifest = buildPlatformV1Manifest();

  checks.push(
    check(
      "GV-PV1-LOCK",
      "signoff",
      "Platform v1 governance freeze lock intact",
      isPlatformV1P8FreezeLockIntact() &&
        platformV1P8FreezeLockMatchesExpected(),
      `version=${PLATFORM_V1_P8_FREEZE_LOCK.version} base=${PLATFORM_V1_P8_FREEZE_LOCK.base}`,
    ),
  );

  const chain = validatePlatformV1P8CompleteChain();
  checks.push(
    check(
      "GV-PV1-CHAIN",
      "signoff",
      "E09/E10/E11 complete chain valid",
      chain.ok,
      chain.ok ? "chain=ok" : chain.failures.join("; "),
    ),
  );

  const requiredIds = [
    "e09-complete",
    "e10-complete",
    "e11-complete",
    "v1-alignment",
    "signoff",
  ];
  const lockedIds = PLATFORM_V1_P8_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "GV-PV1-COMPONENTS",
      "signoff",
      "P8 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ),
      `components=${lockedIds.join(",")}`,
    ),
  );

  checks.push(
    check(
      "GV-PV1-E09-COMPLETE",
      "e09",
      "E09 enterprise complete",
      PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e09.completeId ===
        E09_ENTERPRISE_COMPLETE_ID &&
        isE09P8FreezeLockIntact() &&
        e09P8FreezeLockMatchesExpected(),
      `complete=${E09_ENTERPRISE_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "GV-PV1-E10-COMPLETE",
      "e10",
      "E10 enterprise complete",
      PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e10.completeId ===
        E10_ENTERPRISE_COMPLETE_ID &&
        isE10P8FreezeLockIntact() &&
        e10P8FreezeLockMatchesExpected(),
      `complete=${E10_ENTERPRISE_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "GV-PV1-E11-COMPLETE",
      "e11",
      "E11 enterprise complete",
      PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e11.completeId ===
        E11_ENTERPRISE_COMPLETE_ID &&
        isE11P8FreezeLockIntact() &&
        e11P8FreezeLockMatchesExpected(),
      `complete=${E11_ENTERPRISE_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "GV-PV1-ALIGNMENT",
      "platform-v1",
      "Platform v1 alignment manifest",
      manifest.aligned && isEnterpriseDependencyMapAligned(),
      manifest.summary,
    ),
  );

  pushGate(
    checks,
    "GV-PV1-E09-GATE",
    "e09",
    "E09-P8 governance release gate",
    checkE09P8ReleaseGate(),
  );
  pushGate(
    checks,
    "GV-PV1-E10-GATE",
    "e10",
    "E10-P8 governance release gate",
    checkE10P8ReleaseGate(),
  );
  pushGate(
    checks,
    "GV-PV1-E11-GATE",
    "e11",
    "E11-P8 governance release gate",
    checkE11P8ReleaseGate(),
  );

  const alignmentGate: AlignmentGateResult = checkPlatformV1ReleaseGate();
  pushGate(
    checks,
    "GV-PV1-ALIGN-GATE",
    "platform-v1",
    "Platform v1 alignment release gate",
    alignmentGate,
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
      `platform-v1-governance-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertPlatformV1GovernanceReleaseGatePass(
  gate: ReleaseGateResult = checkPlatformV1GovernanceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Platform v1 governance release gate failed: ${gate.summary}`,
    );
  }
}
