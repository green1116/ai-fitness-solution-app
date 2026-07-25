/**
 * Product Complete — Release Gate
 * Isolated — does not mutate P1–P12
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_COMPLETE_ID,
  isProductCompleteFreezeLockIntact,
  PRODUCT_COMPLETE_FREEZE_BASE,
  PRODUCT_COMPLETE_FREEZE_LOCK,
  PRODUCT_COMPLETE_ID,
} from "../freeze/freeze.lock";

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

export function checkProductCompleteReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_COMPLETE_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "PC-ID",
      "complete",
      "Product complete ID locked",
      PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === PRODUCT_COMPLETE_ID &&
        PRODUCT_COMPLETE_FREEZE_BASE ===
          "enterprise-product-p12-production-launch-v1",
      `id=${PRODUCT_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "PC-CHAIN",
      "complete",
      "P1→P12 phase chain intact",
      isProductCompleteFreezeLockIntact(lock) &&
        lock.phases.p1.base === "enterprise-operations-complete-v1" &&
        lock.phases.p12.id === "enterprise-product-p12-production-launch-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "PC-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "PC-READONLY",
      "complete",
      "Freeze lock is read-only",
      lock.readOnly === true && lock.components.length === 13,
      `components=${lock.components.length}`,
    ),
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
      `product-complete-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductCompleteReleaseGatePass(
  gate: ReleaseGateResult = checkProductCompleteReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product complete release gate failed: ${gate.summary}`);
  }
}
