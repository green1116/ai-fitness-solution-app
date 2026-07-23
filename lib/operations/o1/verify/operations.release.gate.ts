/**
 * Operations O1 — Customer Success Foundation Release Gate
 * BASE: enterprise-launch-v1-release
 * Isolated namespace — does not mutate E01–E12, commercialization, or launch layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import {
  CUSTOMER_STATUSES,
  FEEDBACK_CHANNELS,
  HEALTH_BANDS,
  O1_MANAGER_STATUSES,
  O1_READINESS_VERDICTS,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION,
  OPERATIONS_O1_SUCCESS_FREEZE_VERSION,
  RENEWAL_STATUSES,
  SUCCESS_PLAN_STATUSES,
} from "../success/success.constants";
import {
  assertO1CustomerSuccessReadinessReady,
  clearO1CustomerSuccessLayer,
  createO1CustomerSuccessManager,
  getO1RegistryManifest,
} from "../success.manager";

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

export const OPERATIONS_O1_SIGNOFF_VERSION = "operations-o1-signoff-1" as const;

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
  clearO1CustomerSuccessLayer();
}

export function checkOperationsO1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "O1-CONSTANTS",
      "success",
      "O1 customer success foundation version constants",
      OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID ===
        "enterprise-operations-o1-customer-success-foundation-v1" &&
        OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION ===
          "operations-o1-1" &&
        OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE ===
          "enterprise-launch-v1-release" &&
        OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION ===
          "operations-o1-customer-success-foundation-freeze-1" &&
        OPERATIONS_O1_SUCCESS_FREEZE_VERSION ===
          "operations-o1-customer-success-foundation-freeze-1" &&
        CUSTOMER_STATUSES.length === 4 &&
        HEALTH_BANDS.length === 5 &&
        SUCCESS_PLAN_STATUSES.length === 4 &&
        FEEDBACK_CHANNELS.length === 4 &&
        RENEWAL_STATUSES.length === 5 &&
        O1_READINESS_VERDICTS.length === 3 &&
        O1_MANAGER_STATUSES.length === 4,
      `id=${OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID} base=${OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "O1-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "O1-LAUNCH-BASE",
      "launch",
      "Launch v1 release BASE + readiness complete preserved",
      OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE ===
        "enterprise-launch-v1-release" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "O1-UPSTREAM",
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
    const mgr = createO1CustomerSuccessManager({
      managerId: "ops-o1-gate",
    });
    mgr.initialize();
    mgr.start();

    const customer = mgr.registerCustomer({
      id: "o1.gate.customer",
      name: "Acme Fitness",
      accountRef: "acme-fitness",
      owner: "csm.jordan",
      status: "ACTIVE",
    });
    const metrics = mgr.recordMetrics({
      id: "o1.gate.metrics",
      customerId: customer.id,
      adoptionScore: 82,
      engagementScore: 78,
      supportLoad: 18,
    });
    const health = mgr.scoreHealth({
      id: "o1.gate.health",
      customerId: customer.id,
      metricsId: metrics.id,
    });
    const plan = mgr.createPlan({
      id: "o1.gate.plan",
      customerId: customer.id,
      title: "Acme Q3 Success Plan",
      objectives: ["Increase coach adoption", "Reduce support load"],
    });
    mgr.trackProgress({
      id: "o1.gate.track",
      planId: plan.id,
      progress: 45,
      milestone: "Mid-quarter check-in",
    });
    mgr.collectFeedback({
      id: "o1.gate.fbk",
      customerId: customer.id,
      channel: "NPS",
      comment: "Strong coaching workflows",
      rating: 9,
    });
    const analysis = mgr.analyzeFeedback({
      id: "o1.gate.analysis",
      customerId: customer.id,
    });
    const renewal = mgr.registerRenewal({
      id: "o1.gate.renewal",
      customerId: customer.id,
      amount: 48000,
      termMonths: 12,
    });
    mgr.updateRenewalStatus({
      renewalId: renewal.id,
      status: "IN_PROGRESS",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getO1RegistryManifest();

    const ok =
      health.score >= 70 &&
      analysis.sentiment === "POSITIVE" &&
      readiness.verdict === "READY" &&
      registry.foundationId === OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID &&
      registry.base === OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE &&
      registry.customerCount >= 1 &&
      registry.metricsCount >= 1 &&
      registry.healthScoreCount >= 1 &&
      registry.planCount >= 1 &&
      registry.trackingCount >= 1 &&
      registry.feedbackCount >= 1 &&
      registry.analysisCount >= 1 &&
      registry.renewalCount >= 1;

    try {
      assertO1CustomerSuccessReadinessReady(readiness);
      checks.push(
        check(
          "O1-STACK",
          "success",
          "Customer / health / success / feedback / renewal / readiness",
          ok,
          `health=${health.band} sentiment=${analysis.sentiment} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "O1-STACK",
          "success",
          "Customer / health / success / feedback / renewal / readiness",
          false,
          error instanceof Error
            ? error.message
            : "o1 customer success foundation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "O1-STACK",
        "success",
        "Customer / health / success / feedback / renewal / readiness",
        false,
        error instanceof Error
          ? error.message
          : "o1 customer success foundation probe failed",
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
      `operations-o1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsO1ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsO1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations O1 release gate failed: ${gate.summary}`);
  }
}
