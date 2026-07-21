/**
 * Enterprise Platform v1 — Alignment Release Gate
 * Validates E09 / E10 / E11 P8 gates + v1 alignment catalog
 */

import { checkE09P8ReleaseGate } from "../../global-network/e09/signoff/governance.release.gate";
import {
  e09P8FreezeLockMatchesExpected,
  isE09P8FreezeLockIntact,
} from "../../global-network/e09/signoff/governance.freeze.lock";
import { checkE11P8ReleaseGate } from "../../cloud-runtime/e11/signoff/governance.release.gate";
import {
  e11P8FreezeLockMatchesExpected,
  isE11P8FreezeLockIntact,
} from "../../cloud-runtime/e11/signoff/governance.freeze.lock";
import { checkE10P8ReleaseGate } from "../e10/signoff/governance.release.gate";
import {
  e10P8FreezeLockMatchesExpected,
  isE10P8FreezeLockIntact,
} from "../e10/signoff/governance.freeze.lock";
import { isCapabilityIndexComplete } from "./capability.index";
import { isEnterpriseDependencyMapAligned } from "./dependency.map";
import { isEnterpriseLayerRegistryComplete } from "./layer.registry";
import {
  PLATFORM_V1_BASE,
  PLATFORM_V1_ID,
} from "./platform.v1.constants";
import { buildPlatformV1Manifest } from "./platform.manifest";
import { isReleaseBaselineAligned } from "./release.baseline";

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

export const PLATFORM_V1_SIGNOFF_GATE_VERSION = "platform-v1-signoff-gate-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function pushLayerGate(
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

export function checkPlatformV1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const manifest = buildPlatformV1Manifest();

  checks.push(
    check(
      "PV1-REGISTRY",
      "platform-v1",
      "Enterprise layer registry complete",
      isEnterpriseLayerRegistryComplete(),
      `layers=${manifest.layers.length}`,
    ),
  );

  checks.push(
    check(
      "PV1-CHAIN",
      "platform-v1",
      "E09→E10→E11 dependency chain aligned",
      isEnterpriseDependencyMapAligned(),
      manifest.dependency.failures.join("; ") || "chain=ok",
    ),
  );

  checks.push(
    check(
      "PV1-CAPABILITIES",
      "platform-v1",
      "Capability index complete",
      isCapabilityIndexComplete(),
      `capabilities=${manifest.capabilities.count}`,
    ),
  );

  checks.push(
    check(
      "PV1-BASELINE",
      "platform-v1",
      "Release baseline aligned",
      isReleaseBaselineAligned(),
      manifest.baseline.summary,
    ),
  );

  checks.push(
    check(
      "PV1-MANIFEST",
      "platform-v1",
      "Platform manifest aligned",
      manifest.aligned,
      manifest.summary,
    ),
  );

  checks.push(
    check(
      "PV1-CONSTANTS",
      "platform-v1",
      "Platform v1 constants",
      PLATFORM_V1_ID === "enterprise-platform-v1" &&
        PLATFORM_V1_BASE === "enterprise-e11-cloud-runtime-complete-v1",
      `id=${PLATFORM_V1_ID} base=${PLATFORM_V1_BASE}`,
    ),
  );

  checks.push(
    check(
      "PV1-E09-LOCK",
      "e09",
      "E09 freeze lock intact",
      isE09P8FreezeLockIntact() && e09P8FreezeLockMatchesExpected(),
      "e09 lock ok",
    ),
  );

  checks.push(
    check(
      "PV1-E10-LOCK",
      "e10",
      "E10 freeze lock intact",
      isE10P8FreezeLockIntact() && e10P8FreezeLockMatchesExpected(),
      "e10 lock ok",
    ),
  );

  checks.push(
    check(
      "PV1-E11-LOCK",
      "e11",
      "E11 freeze lock intact",
      isE11P8FreezeLockIntact() && e11P8FreezeLockMatchesExpected(),
      "e11 lock ok",
    ),
  );

  pushLayerGate(
    checks,
    "PV1-E09-GATE",
    "e09",
    "E09-P8 governance release gate",
    checkE09P8ReleaseGate(),
  );
  pushLayerGate(
    checks,
    "PV1-E10-GATE",
    "e10",
    "E10-P8 governance release gate",
    checkE10P8ReleaseGate(),
  );
  pushLayerGate(
    checks,
    "PV1-E11-GATE",
    "e11",
    "E11-P8 governance release gate",
    checkE11P8ReleaseGate(),
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
      `platform-v1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertPlatformV1ReleaseGatePass(
  gate: ReleaseGateResult = checkPlatformV1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Platform v1 release gate failed: ${gate.summary}`);
  }
}
