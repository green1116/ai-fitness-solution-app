/**
 * Product Customer Insight — Customer Insight Release Gate
 * MODULE: Customer Insight
 * BASE: enterprise-product-customer-activity-v1
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
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../../billing-baseline/freeze/freeze.lock";
import { PRODUCT_CUSTOMER_ACTIVITY_ID } from "../../customer-activity/activity/activity.constants";
import { PRODUCT_CUSTOMER_FOUNDATION_ID } from "../../customer/foundation/foundation.constants";
import { PRODUCT_CUSTOMER_PROFILE_ID } from "../../customer-profile/profile/profile.constants";
import { PRODUCT_ORGANIZATION_MANAGEMENT_ID } from "../../organization/management/management.constants";
import { PRODUCT_RELATIONSHIP_MANAGEMENT_ID } from "../../relationship/management/management.constants";
import {
  assertCustomerInsightReadinessReady,
  clearCustomerInsightLayer,
  createCustomerInsightManager,
  getCustomerInsightRegistryManifest,
} from "../customer-insight.manager";
import {
  CUSTOMER_INSIGHT_MANAGER_STATUSES,
  CUSTOMER_INSIGHT_READINESS_VERDICTS,
  INSIGHT_RECOMMENDATION_KINDS,
  INSIGHT_SCORE_KINDS,
  INSIGHT_SEGMENT_CODES,
  INSIGHT_SIGNAL_KINDS,
  PRODUCT_CUSTOMER_INSIGHT_BASE,
  PRODUCT_CUSTOMER_INSIGHT_FREEZE_VERSION,
  PRODUCT_CUSTOMER_INSIGHT_ID,
  PRODUCT_CUSTOMER_INSIGHT_LAYER_FREEZE_VERSION,
  PRODUCT_CUSTOMER_INSIGHT_VERSION,
} from "../insight/insight.constants";

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

export const PRODUCT_CUSTOMER_INSIGHT_SIGNOFF_VERSION =
  "product-customer-insight-signoff-1" as const;

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
  clearCustomerInsightLayer();
}

export function checkProductCustomerInsightReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "CINS-CONSTANTS",
      "insight",
      "Product customer insight version constants",
      PRODUCT_CUSTOMER_INSIGHT_ID ===
        "enterprise-product-customer-insight-v1" &&
        PRODUCT_CUSTOMER_INSIGHT_VERSION === "product-customer-insight-1" &&
        PRODUCT_CUSTOMER_INSIGHT_BASE === PRODUCT_CUSTOMER_ACTIVITY_ID &&
        PRODUCT_CUSTOMER_INSIGHT_FREEZE_VERSION ===
          "product-customer-insight-freeze-1" &&
        PRODUCT_CUSTOMER_INSIGHT_LAYER_FREEZE_VERSION ===
          "product-customer-insight-freeze-1" &&
        INSIGHT_SIGNAL_KINDS.length === 4 &&
        INSIGHT_SCORE_KINDS.length === 3 &&
        INSIGHT_SEGMENT_CODES.length === 3 &&
        INSIGHT_RECOMMENDATION_KINDS.length === 3 &&
        CUSTOMER_INSIGHT_READINESS_VERDICTS.length === 3 &&
        CUSTOMER_INSIGHT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_CUSTOMER_INSIGHT_ID} base=${PRODUCT_CUSTOMER_INSIGHT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "CINS-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "CINS-CACT-BASE",
      "product-customer-activity",
      "Customer activity BASE preserved",
      PRODUCT_CUSTOMER_INSIGHT_BASE ===
        "enterprise-product-customer-activity-v1" &&
        PRODUCT_CUSTOMER_ACTIVITY_ID ===
          "enterprise-product-customer-activity-v1" &&
        PRODUCT_RELATIONSHIP_MANAGEMENT_ID ===
          "enterprise-product-relationship-management-v1" &&
        PRODUCT_CUSTOMER_PROFILE_ID ===
          "enterprise-product-customer-profile-v1" &&
        PRODUCT_ORGANIZATION_MANAGEMENT_ID ===
          "enterprise-product-organization-management-v1" &&
        PRODUCT_CUSTOMER_FOUNDATION_ID ===
          "enterprise-product-customer-foundation-v1" &&
        ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
          "enterprise-product-billing-baseline-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_CUSTOMER_INSIGHT_BASE}`,
    ),
  );

  checks.push(
    check(
      "CINS-UPSTREAM",
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
    const mgr = createCustomerInsightManager({
      managerId: "prod-cins-gate",
    });
    mgr.initialize();
    mgr.start();

    mgr.detectSignal({
      id: "cins.gate.sig",
      customerId: "cus.gate.prf",
      kind: "ENGAGEMENT",
      strength: 0.86,
    });
    mgr.computeScore({
      id: "cins.gate.scr",
      customerId: "cus.gate.prf",
      kind: "HEALTH",
      value: 88,
    });
    mgr.assignInsightSegment({
      id: "cins.gate.seg",
      customerId: "cus.gate.prf",
      segment: "GROWTH",
    });
    mgr.issueRecommendation({
      id: "cins.gate.rec",
      customerId: "cus.gate.prf",
      kind: "EXPAND",
      action: "Offer premium seats",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getCustomerInsightRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.insightId === PRODUCT_CUSTOMER_INSIGHT_ID &&
      registry.base === PRODUCT_CUSTOMER_INSIGHT_BASE &&
      registry.signalCount >= 1 &&
      registry.scoreCount >= 1 &&
      registry.segmentCount >= 1 &&
      registry.recommendationCount >= 1;

    try {
      assertCustomerInsightReadinessReady(readiness);
      checks.push(
        check(
          "CINS-STACK",
          "insight",
          "Signal / score / segment / recommendation",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "CINS-STACK",
          "insight",
          "Signal / score / segment / recommendation",
          false,
          error instanceof Error
            ? error.message
            : "product customer insight not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "CINS-STACK",
        "insight",
        "Signal / score / segment / recommendation",
        false,
        error instanceof Error
          ? error.message
          : "product customer insight probe failed",
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
      `product-customer-insight-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductCustomerInsightReleaseGatePass(
  gate: ReleaseGateResult = checkProductCustomerInsightReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product customer insight release gate failed: ${gate.summary}`,
    );
  }
}
