/**
 * Product Customer Activity — Customer Activity Release Gate
 * MODULE: Customer Activity
 * BASE: enterprise-product-relationship-management-v1
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
import { PRODUCT_CUSTOMER_FOUNDATION_ID } from "../../customer/foundation/foundation.constants";
import { PRODUCT_CUSTOMER_PROFILE_ID } from "../../customer-profile/profile/profile.constants";
import { PRODUCT_ORGANIZATION_MANAGEMENT_ID } from "../../organization/management/management.constants";
import { PRODUCT_RELATIONSHIP_MANAGEMENT_ID } from "../../relationship/management/management.constants";
import {
  ACTIVITY_EVENT_KINDS,
  ACTIVITY_SESSION_STATUSES,
  CUSTOMER_ACTIVITY_MANAGER_STATUSES,
  CUSTOMER_ACTIVITY_READINESS_VERDICTS,
  ENGAGEMENT_LEVELS,
  PRODUCT_CUSTOMER_ACTIVITY_BASE,
  PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION,
  PRODUCT_CUSTOMER_ACTIVITY_ID,
  PRODUCT_CUSTOMER_ACTIVITY_LAYER_FREEZE_VERSION,
  PRODUCT_CUSTOMER_ACTIVITY_VERSION,
  TIMELINE_ENTRY_KINDS,
} from "../activity/activity.constants";
import {
  assertCustomerActivityReadinessReady,
  clearCustomerActivityLayer,
  createCustomerActivityManager,
  getCustomerActivityRegistryManifest,
} from "../customer-activity.manager";

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

export const PRODUCT_CUSTOMER_ACTIVITY_SIGNOFF_VERSION =
  "product-customer-activity-signoff-1" as const;

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
  clearCustomerActivityLayer();
}

export function checkProductCustomerActivityReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "CACT-CONSTANTS",
      "activity",
      "Product customer activity version constants",
      PRODUCT_CUSTOMER_ACTIVITY_ID ===
        "enterprise-product-customer-activity-v1" &&
        PRODUCT_CUSTOMER_ACTIVITY_VERSION ===
          "product-customer-activity-1" &&
        PRODUCT_CUSTOMER_ACTIVITY_BASE ===
          PRODUCT_RELATIONSHIP_MANAGEMENT_ID &&
        PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION ===
          "product-customer-activity-freeze-1" &&
        PRODUCT_CUSTOMER_ACTIVITY_LAYER_FREEZE_VERSION ===
          "product-customer-activity-freeze-1" &&
        ACTIVITY_EVENT_KINDS.length === 4 &&
        ACTIVITY_SESSION_STATUSES.length === 3 &&
        ENGAGEMENT_LEVELS.length === 3 &&
        TIMELINE_ENTRY_KINDS.length === 3 &&
        CUSTOMER_ACTIVITY_READINESS_VERDICTS.length === 3 &&
        CUSTOMER_ACTIVITY_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_CUSTOMER_ACTIVITY_ID} base=${PRODUCT_CUSTOMER_ACTIVITY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "CACT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "CACT-REL-BASE",
      "product-relationship-management",
      "Relationship management BASE preserved",
      PRODUCT_CUSTOMER_ACTIVITY_BASE ===
        "enterprise-product-relationship-management-v1" &&
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
      `base=${PRODUCT_CUSTOMER_ACTIVITY_BASE}`,
    ),
  );

  checks.push(
    check(
      "CACT-UPSTREAM",
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
    const mgr = createCustomerActivityManager({
      managerId: "prod-cact-gate",
    });
    mgr.initialize();
    mgr.start();

    const event = mgr.recordActivityEvent({
      id: "cact.gate.ev",
      customerId: "cus.gate.prf",
      kind: "ENGAGE",
      summary: "Portal visit",
    });
    const session = mgr.openActivitySession({
      id: "cact.gate.ss",
      customerId: "cus.gate.prf",
      channel: "web",
    });
    mgr.closeActivitySession({ sessionId: session.id });
    mgr.scoreEngagement({
      id: "cact.gate.eg",
      customerId: "cus.gate.prf",
      level: "HIGH",
      score: 92,
    });
    mgr.appendTimelineEntry({
      id: "cact.gate.tl",
      customerId: "cus.gate.prf",
      kind: "EVENT",
      refId: event.id,
      title: "Portal visit recorded",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getCustomerActivityRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.activityId === PRODUCT_CUSTOMER_ACTIVITY_ID &&
      registry.base === PRODUCT_CUSTOMER_ACTIVITY_BASE &&
      registry.eventCount >= 1 &&
      registry.sessionCount >= 1 &&
      registry.engagementCount >= 1 &&
      registry.timelineCount >= 1;

    try {
      assertCustomerActivityReadinessReady(readiness);
      checks.push(
        check(
          "CACT-STACK",
          "activity",
          "Event / session / engagement / timeline",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "CACT-STACK",
          "activity",
          "Event / session / engagement / timeline",
          false,
          error instanceof Error
            ? error.message
            : "product customer activity not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "CACT-STACK",
        "activity",
        "Event / session / engagement / timeline",
        false,
        error instanceof Error
          ? error.message
          : "product customer activity probe failed",
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
      `product-customer-activity-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductCustomerActivityReleaseGatePass(
  gate: ReleaseGateResult = checkProductCustomerActivityReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product customer activity release gate failed: ${gate.summary}`,
    );
  }
}
