/**
 * Product Subscription — Lifecycle Release Gate
 * MODULE: Subscription
 * BASE: enterprise-product-billing-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { PRODUCT_BILLING_FOUNDATION_ID } from "../../billing/foundation/foundation.constants";
import {
  CHANGE_KINDS,
  ENTITLEMENT_STATUSES,
  PRODUCT_SUBSCRIPTION_FREEZE_VERSION,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_ID,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION,
  RENEWAL_RESULTS,
  SUBSCRIPTION_MANAGER_STATUSES,
  SUBSCRIPTION_READINESS_VERDICTS,
  SUBSCRIPTION_STATUSES,
} from "../lifecycle/lifecycle.constants";
import {
  assertSubscriptionLifecycleReadinessReady,
  clearSubscriptionLifecycleLayer,
  createSubscriptionManager,
  getSubscriptionRegistryManifest,
} from "../subscription.manager";

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

export const PRODUCT_SUBSCRIPTION_SIGNOFF_VERSION =
  "product-subscription-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearSubscriptionLifecycleLayer();
}

export function checkProductSubscriptionReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "SUB-CONSTANTS",
      "lifecycle",
      "Product subscription lifecycle version constants",
      PRODUCT_SUBSCRIPTION_LIFECYCLE_ID ===
        "enterprise-product-subscription-lifecycle-v1" &&
        PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION === "product-subscription-1" &&
        PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE === PRODUCT_BILLING_FOUNDATION_ID &&
        PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION ===
          "product-subscription-lifecycle-freeze-1" &&
        PRODUCT_SUBSCRIPTION_FREEZE_VERSION ===
          "product-subscription-lifecycle-freeze-1" &&
        SUBSCRIPTION_STATUSES.length === 5 &&
        ENTITLEMENT_STATUSES.length === 2 &&
        RENEWAL_RESULTS.length === 2 &&
        CHANGE_KINDS.length === 3 &&
        SUBSCRIPTION_READINESS_VERDICTS.length === 3 &&
        SUBSCRIPTION_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_SUBSCRIPTION_LIFECYCLE_ID} base=${PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "SUB-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "SUB-BIL-BASE",
      "product-billing",
      "Billing foundation BASE preserved",
      PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE ===
        "enterprise-product-billing-foundation-v1" &&
        PRODUCT_BILLING_FOUNDATION_ID ===
          "enterprise-product-billing-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE}`,
    ),
  );

  checks.push(
    check(
      "SUB-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createSubscriptionManager({ managerId: "prod-sub-gate" });
    mgr.initialize();
    mgr.start();

    const subscription = mgr.createSubscription({
      id: "sub.gate.sub",
      accountId: "bil.gate.acc",
      planId: "bil.gate.pln",
      seats: 5,
    });
    mgr.grantEntitlement({
      id: "sub.gate.ent",
      subscriptionId: subscription.id,
      featureKey: "workspace.pro",
    });
    const renewal = mgr.renewSubscription({
      id: "sub.gate.ren",
      subscriptionId: subscription.id,
      succeed: true,
    });
    const change = mgr.changeSubscription({
      id: "sub.gate.chg",
      subscriptionId: subscription.id,
      kind: "UPGRADE",
      toPlanId: "bil.gate.pln.ent",
      toSeats: 10,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getSubscriptionRegistryManifest();

    const ok =
      renewal.result === "RENEWED" &&
      change.toSeats === 10 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_SUBSCRIPTION_LIFECYCLE_ID &&
      registry.base === PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE &&
      registry.subscriptionCount >= 1 &&
      registry.entitlementCount >= 1 &&
      registry.renewalCount >= 1 &&
      registry.changeCount >= 1;

    try {
      assertSubscriptionLifecycleReadinessReady(readiness);
      checks.push(
        check(
          "SUB-STACK",
          "lifecycle",
          "Subscription / entitlement / renewal / change",
          ok,
          `readiness=${readiness.verdict} renewal=${renewal.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "SUB-STACK",
          "lifecycle",
          "Subscription / entitlement / renewal / change",
          false,
          error instanceof Error
            ? error.message
            : "product subscription not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "SUB-STACK",
        "lifecycle",
        "Subscription / entitlement / renewal / change",
        false,
        error instanceof Error
          ? error.message
          : "product subscription probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-subscription-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductSubscriptionReleaseGatePass(
  gate: ReleaseGateResult = checkProductSubscriptionReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product subscription release gate failed: ${gate.summary}`,
    );
  }
}
