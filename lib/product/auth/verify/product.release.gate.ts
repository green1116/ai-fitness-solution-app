/**
 * Product Auth — Governance Freeze Release Gate
 * Isolated — does not mutate auth modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_AUTH_BASELINE_ID,
  isProductAuthFreezeLockIntact,
  PRODUCT_AUTH_BASELINE_ID,
  PRODUCT_AUTH_FREEZE_BASE,
  PRODUCT_AUTH_FREEZE_LOCK,
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

export function checkProductAuthReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_AUTH_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "AUTH-ID",
      "auth-freeze",
      "Product auth baseline ID locked",
      PRODUCT_AUTH_BASELINE_ID === "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID === PRODUCT_AUTH_BASELINE_ID &&
        PRODUCT_AUTH_FREEZE_BASE ===
          "enterprise-product-audit-traceability-v1",
      `id=${PRODUCT_AUTH_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "AUTH-CHAIN",
      "auth-freeze",
      "Identity→Audit auth chain intact",
      isProductAuthFreezeLockIntact(lock) &&
        lock.phases.identity.id ===
          "enterprise-product-identity-foundation-v1" &&
        lock.phases.audit.id ===
          "enterprise-product-audit-traceability-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "AUTH-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AUTH-READONLY",
      "auth-freeze",
      "Freeze lock is read-only",
      lock.readOnly === true && lock.components.length === 7,
      `components=${lock.components.length}`,
    ),
  );

  checks.push(
    check(
      "AUTH-UPSTREAM",
      "baselines",
      "Product complete / upstream baselines preserved",
      lock.productCompleteBaseline === "enterprise-product-complete-v1" &&
        lock.operationsBaseline === "enterprise-operations-complete-v1" &&
        lock.launchBaseline === "enterprise-launch-complete-v1" &&
        lock.e12Baseline === "enterprise-e12-productization-complete-v1",
      `product=${lock.productCompleteBaseline}`,
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
      `product-auth-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAuthReleaseGatePass(
  gate: ReleaseGateResult = checkProductAuthReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product auth release gate failed: ${gate.summary}`);
  }
}
