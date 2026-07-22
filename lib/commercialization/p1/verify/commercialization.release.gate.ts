/**
 * Commercialization P1 — Sales Foundation Release Gate
 * BASE: enterprise-evolution-complete-v1
 * Isolated namespace — does not mutate E01–E12 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_GOVERNANCE_COMPLETE_ID,
} from "../../../operations/signoff/governance.freeze.lock";
import {
  ENTERPRISE_EVOLUTION_COMPLETE_ID,
  EVOLUTION_GOVERNANCE_COMPLETE_ID,
} from "../../../evolution/signoff/governance.freeze.lock";
import {
  COMMERCIALIZATION_P1_SALES_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_BASE,
  COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_ID,
  COMMERCIALIZATION_SALES_FOUNDATION_VERSION,
  CUSTOMER_LIFECYCLE_STAGES,
  OFFER_KINDS,
  OPPORTUNITY_STATUSES,
  PIPELINE_STAGES,
  PRICING_MODELS,
  SALES_MANAGER_STATUSES,
  SALES_READINESS_VERDICTS,
} from "../sales/sales.constants";
import {
  assertSalesFoundationReadinessReady,
  clearSalesFoundationLayer,
  createSalesFoundationManager,
  getSalesRegistryManifest,
} from "../sales.manager";

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

export const COMMERCIALIZATION_P1_SIGNOFF_VERSION =
  "commercialization-p1-signoff-1" as const;

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
  clearSalesFoundationLayer();
}

export function checkCommercializationP1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "COM-P1-CONSTANTS",
      "sales",
      "Sales foundation version constants",
      COMMERCIALIZATION_SALES_FOUNDATION_ID ===
        "enterprise-commercialization-p1-sales-foundation-v1" &&
        COMMERCIALIZATION_SALES_FOUNDATION_VERSION ===
          "commercialization-p1-1" &&
        COMMERCIALIZATION_SALES_FOUNDATION_BASE ===
          ENTERPRISE_EVOLUTION_COMPLETE_ID &&
        COMMERCIALIZATION_SALES_FOUNDATION_BASE ===
          "enterprise-evolution-complete-v1" &&
        COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION ===
          "commercialization-sales-foundation-freeze-1" &&
        COMMERCIALIZATION_P1_SALES_FREEZE_VERSION ===
          "commercialization-p1-sales-foundation-freeze-1" &&
        PIPELINE_STAGES.length === 6 &&
        OPPORTUNITY_STATUSES.length === 4 &&
        CUSTOMER_LIFECYCLE_STAGES.length === 5 &&
        OFFER_KINDS.length === 4 &&
        PRICING_MODELS.length === 4 &&
        SALES_READINESS_VERDICTS.length === 3 &&
        SALES_MANAGER_STATUSES.length === 4,
      `id=${COMMERCIALIZATION_SALES_FOUNDATION_ID} base=${COMMERCIALIZATION_SALES_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "COM-P1-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "COM-P1-EVOLUTION",
      "evolution",
      "Evolution complete freeze preserved as BASE",
      EVOLUTION_GOVERNANCE_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_EVOLUTION_COMPLETE_ID ===
          "enterprise-evolution-complete-v1" &&
        COMMERCIALIZATION_SALES_FOUNDATION_BASE ===
          ENTERPRISE_EVOLUTION_COMPLETE_ID,
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "COM-P1-UPSTREAM",
      "baselines",
      "Operations / launch / E12 baselines preserved",
      OPERATIONS_GOVERNANCE_COMPLETE_ID ===
        "enterprise-post-launch-operations-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `ops=${OPERATIONS_GOVERNANCE_COMPLETE_ID} launch=${ENTERPRISE_LAUNCH_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createSalesFoundationManager({
      managerId: "comm-p1-gate",
    });
    mgr.initialize();
    mgr.start();

    const offer = mgr.registerOffer({
      id: "comm.p1.gate.offer",
      name: "Enterprise Fitness Plan",
      kind: "PLAN",
      description: "Core commercial plan",
      active: true,
    });
    const pricing = mgr.createPricing({
      id: "comm.p1.gate.price",
      offerId: offer.id,
      model: "PER_SEAT",
      unitAmount: 99,
      seatsIncluded: 10,
      discountPercent: 10,
    });
    const customer = mgr.registerCustomer({
      id: "comm.p1.gate.customer",
      name: "Acme Fitness Co",
      segment: "ENTERPRISE",
      region: "US_EAST",
      lifecycleStage: "PROSPECT",
    });
    const lifecycle = mgr.transitionLifecycle({
      id: "comm.p1.gate.lifecycle",
      customerId: customer.id,
      stage: "ACTIVE",
      reason: "qualified pilot",
    });
    const opportunity = mgr.registerOpportunity({
      id: "comm.p1.gate.opp",
      name: "Acme Annual Deal",
      customerId: customer.id,
      offerId: offer.id,
      amount: pricing.listPrice,
      stage: "LEAD",
      owner: "ae-1",
    });
    const pipeline = mgr.advancePipeline({
      id: "comm.p1.gate.pipe",
      opportunityId: opportunity.id,
      stage: "QUALIFIED",
      note: "discovery complete",
    });
    const metrics = mgr.computeMetrics({
      id: "comm.p1.gate.metrics",
    });
    const readiness = mgr.evaluateReadiness();
    const registry = getSalesRegistryManifest();

    const ok =
      offer.active === true &&
      pricing.listPrice > 0 &&
      lifecycle.stage === "ACTIVE" &&
      pipeline.stage === "QUALIFIED" &&
      metrics.opportunityCount >= 1 &&
      metrics.pipelineValue >= 0 &&
      readiness.verdict === "READY" &&
      registry.foundationId === COMMERCIALIZATION_SALES_FOUNDATION_ID &&
      registry.base === COMMERCIALIZATION_SALES_FOUNDATION_BASE &&
      registry.offerCount >= 1 &&
      registry.pricingCount >= 1 &&
      registry.customerCount >= 1 &&
      registry.opportunityCount >= 1 &&
      registry.pipelineCount >= 1 &&
      registry.metricsCount >= 1;

    try {
      assertSalesFoundationReadinessReady(readiness);
      checks.push(
        check(
          "COM-P1-STACK",
          "sales",
          "Offer / pricing / customer / pipeline / metrics / readiness",
          ok,
          `pipeline=${metrics.pipelineValue} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "COM-P1-STACK",
          "sales",
          "Offer / pricing / customer / pipeline / metrics / readiness",
          false,
          error instanceof Error
            ? error.message
            : "sales foundation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "COM-P1-STACK",
        "sales",
        "Offer / pricing / customer / pipeline / metrics / readiness",
        false,
        error instanceof Error
          ? error.message
          : "sales foundation probe failed",
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
      `commercialization-p1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertCommercializationP1ReleaseGatePass(
  gate: ReleaseGateResult = checkCommercializationP1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Commercialization P1 release gate failed: ${gate.summary}`,
    );
  }
}
