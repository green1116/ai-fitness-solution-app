/**
 * Product P9 — Customer Success Release Gate
 * BASE: enterprise-product-p8-tender-delivery-v1
 * Isolated — product layer only
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { PRODUCT_P8_TENDER_DELIVERY_ID } from "../../p8/tender/tender.constants";
import {
  EXPANSION_STATUSES,
  FEEDBACK_KINDS,
  HEALTH_STATUSES,
  P9_MANAGER_STATUSES,
  P9_READINESS_VERDICTS,
  PRODUCT_P9_CUSTOMER_SUCCESS_BASE,
  PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION,
  PRODUCT_P9_CUSTOMER_SUCCESS_ID,
  PRODUCT_P9_CUSTOMER_SUCCESS_VERSION,
  PRODUCT_P9_SUCCESS_FREEZE_VERSION,
  RENEWAL_STATUSES,
  SATISFACTION_LEVELS,
  SUCCESS_PLAN_STATUSES,
  USAGE_TRENDS,
} from "../customer-health/health.constants";
import {
  assertP9CustomerSuccessReadinessReady,
  clearP9CustomerSuccessLayer,
  createP9CustomerSuccessManager,
  getP9RegistryManifest,
} from "../customer-success.manager";

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

export const PRODUCT_P9_SIGNOFF_VERSION = "product-p9-signoff-1" as const;

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
  clearP9CustomerSuccessLayer();
}

export function checkProductP9ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P9-CONSTANTS",
      "customer-health",
      "Product P9 customer success version constants",
      PRODUCT_P9_CUSTOMER_SUCCESS_ID ===
        "enterprise-product-p9-customer-success-v1" &&
        PRODUCT_P9_CUSTOMER_SUCCESS_VERSION === "product-p9-1" &&
        PRODUCT_P9_CUSTOMER_SUCCESS_BASE === PRODUCT_P8_TENDER_DELIVERY_ID &&
        PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION ===
          "product-p9-customer-success-freeze-1" &&
        PRODUCT_P9_SUCCESS_FREEZE_VERSION ===
          "product-p9-customer-success-freeze-1" &&
        HEALTH_STATUSES.length === 5 &&
        USAGE_TRENDS.length === 5 &&
        FEEDBACK_KINDS.length === 5 &&
        SATISFACTION_LEVELS.length === 5 &&
        SUCCESS_PLAN_STATUSES.length === 5 &&
        RENEWAL_STATUSES.length === 5 &&
        EXPANSION_STATUSES.length === 5 &&
        P9_READINESS_VERDICTS.length === 3 &&
        P9_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P9_CUSTOMER_SUCCESS_ID} base=${PRODUCT_P9_CUSTOMER_SUCCESS_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P9-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P9-P8-BASE",
      "product-p8",
      "P8 tender delivery BASE preserved",
      PRODUCT_P9_CUSTOMER_SUCCESS_BASE ===
        "enterprise-product-p8-tender-delivery-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P9_CUSTOMER_SUCCESS_BASE}`,
    ),
  );

  checks.push(
    check(
      "P9-UPSTREAM",
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
    const mgr = createP9CustomerSuccessManager({ managerId: "prod-p9-gate" });
    mgr.initialize();
    mgr.start();

    const health = mgr.createCustomerHealth({
      id: "p9.gate.hlt",
      accountRef: "acme-fitness",
      tenderRef: "p8.gate.tnd",
      score: 82,
      owner: "csm.jordan",
    });
    mgr.createUsage({
      id: "p9.gate.usg",
      healthId: health.id,
      activeUsers: 48,
      sessions: 320,
      trend: "UP",
    });
    mgr.createFeedback({
      id: "p9.gate.fbk",
      healthId: health.id,
      kind: "NPS",
      author: "acme.coach.lead",
      score: 9,
      body: "Coaches love the AI programming assist.",
    });
    mgr.createSatisfaction({
      id: "p9.gate.sat",
      healthId: health.id,
      csat: 88,
      nps: 62,
    });
    const plan = mgr.createSuccessPlan({
      id: "p9.gate.pln",
      healthId: health.id,
      name: "Acme Year-1 Success Plan",
      objectives: ["Activation ≥ 80%", "Renewal ready by Q4"],
    });
    mgr.updateSuccessPlanStatus({
      planId: plan.id,
      status: "ON_TRACK",
    });
    const renewal = mgr.createRenewal({
      id: "p9.gate.rnw",
      healthId: health.id,
      amount: 180000,
      renewBy: "2026-12-01",
    });
    mgr.updateRenewalStatus({
      renewalId: renewal.id,
      status: "IN_DISCUSSION",
    });
    mgr.createExpansion({
      id: "p9.gate.exp",
      healthId: health.id,
      title: "Add 3 regional sites",
      estimatedArr: 90000,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getP9RegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_P9_CUSTOMER_SUCCESS_ID &&
      registry.base === PRODUCT_P9_CUSTOMER_SUCCESS_BASE &&
      registry.healthCount >= 1 &&
      registry.usageCount >= 1 &&
      registry.feedbackCount >= 1 &&
      registry.satisfactionCount >= 1 &&
      registry.successPlanCount >= 1 &&
      registry.renewalCount >= 1 &&
      registry.expansionCount >= 1;

    try {
      assertP9CustomerSuccessReadinessReady(readiness);
      checks.push(
        check(
          "P9-STACK",
          "customer-health",
          "Health / usage / feedback / satisfaction / plan / renewal / expansion",
          ok,
          `readiness=${readiness.verdict} health=${registry.healthCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P9-STACK",
          "customer-health",
          "Health / usage / feedback / satisfaction / plan / renewal / expansion",
          false,
          error instanceof Error
            ? error.message
            : "p9 customer success not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P9-STACK",
        "customer-health",
        "Health / usage / feedback / satisfaction / plan / renewal / expansion",
        false,
        error instanceof Error
          ? error.message
          : "p9 customer success probe failed",
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
      `product-p9-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP9ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP9ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P9 release gate failed: ${gate.summary}`);
  }
}
