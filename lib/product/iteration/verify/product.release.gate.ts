/**
 * Product Iteration — Commercial Product Iteration Foundation Release Gate
 * BASE: enterprise-product-complete-v1
 * Isolated — does not mutate P1–P12 / E / O layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import {
  BACKLOG_PRIORITIES,
  CADENCE_KINDS,
  CYCLE_STATUSES,
  EXPERIMENT_STATUSES,
  IMPACT_BANDS,
  ITERATION_MANAGER_STATUSES,
  ITERATION_READINESS_VERDICTS,
  PRODUCT_ITERATION_FOUNDATION_BASE,
  PRODUCT_ITERATION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ITERATION_FOUNDATION_ID,
  PRODUCT_ITERATION_FOUNDATION_VERSION,
  PRODUCT_ITERATION_FREEZE_VERSION,
  ROADMAP_HORIZONS,
} from "../cycle/cycle.constants";
import {
  assertIterationFoundationReadinessReady,
  clearIterationFoundationLayer,
  createIterationManager,
  getIterationRegistryManifest,
} from "../iteration.manager";

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

export const PRODUCT_ITERATION_SIGNOFF_VERSION =
  "product-iteration-signoff-1" as const;

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
  clearIterationFoundationLayer();
}

export function checkProductIterationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "ITER-CONSTANTS",
      "cycle",
      "Product iteration foundation version constants",
      PRODUCT_ITERATION_FOUNDATION_ID ===
        "enterprise-product-iteration-foundation-v1" &&
        PRODUCT_ITERATION_FOUNDATION_VERSION === "product-iteration-1" &&
        PRODUCT_ITERATION_FOUNDATION_BASE === ENTERPRISE_PRODUCT_COMPLETE_ID &&
        PRODUCT_ITERATION_FOUNDATION_FREEZE_VERSION ===
          "product-iteration-foundation-freeze-1" &&
        PRODUCT_ITERATION_FREEZE_VERSION ===
          "product-iteration-foundation-freeze-1" &&
        CYCLE_STATUSES.length === 5 &&
        BACKLOG_PRIORITIES.length === 4 &&
        EXPERIMENT_STATUSES.length === 4 &&
        ROADMAP_HORIZONS.length === 3 &&
        IMPACT_BANDS.length === 4 &&
        CADENCE_KINDS.length === 4 &&
        ITERATION_READINESS_VERDICTS.length === 3 &&
        ITERATION_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_ITERATION_FOUNDATION_ID} base=${PRODUCT_ITERATION_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "ITER-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "ITER-COMPLETE-BASE",
      "product-complete",
      "Product complete BASE preserved",
      PRODUCT_ITERATION_FOUNDATION_BASE ===
        "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_ITERATION_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "ITER-UPSTREAM",
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
    const mgr = createIterationManager({ managerId: "prod-iter-gate" });
    mgr.initialize();
    mgr.start();

    const cycle = mgr.createCycle({
      id: "iter.gate.cyc",
      name: "Q3 Commercial Iteration",
      goal: "Ship low-risk coach activation improvements",
      owner: "pm.product",
    });
    mgr.updateCycleStatus({
      cycleId: cycle.id,
      status: "ACTIVE",
    });
    const backlog = mgr.createBacklogItem({
      id: "iter.gate.bl",
      cycleId: cycle.id,
      title: "Simplify coach seat invite flow",
      priority: "P1",
    });
    const experiment = mgr.createExperiment({
      id: "iter.gate.exp",
      cycleId: cycle.id,
      hypothesis: "Shorter invite copy increases activation",
    });
    mgr.concludeExperiment({
      experimentId: experiment.id,
      status: "CONCLUDED",
      result: "Activation +8%",
    });
    mgr.createRoadmapItem({
      id: "iter.gate.rm",
      cycleId: cycle.id,
      title: "Activation UX polish",
      horizon: "NOW",
    });
    mgr.scoreImpact({
      id: "iter.gate.imp",
      cycleId: cycle.id,
      subjectRef: backlog.id,
      score: 72,
    });
    mgr.createCadence({
      id: "iter.gate.cad",
      cycleId: cycle.id,
      kind: "BIWEEKLY",
      name: "Iteration review",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getIterationRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_ITERATION_FOUNDATION_ID &&
      registry.base === PRODUCT_ITERATION_FOUNDATION_BASE &&
      registry.cycleCount >= 1 &&
      registry.backlogCount >= 1 &&
      registry.experimentCount >= 1 &&
      registry.roadmapCount >= 1 &&
      registry.impactCount >= 1 &&
      registry.cadenceCount >= 1;

    try {
      assertIterationFoundationReadinessReady(readiness);
      checks.push(
        check(
          "ITER-STACK",
          "cycle",
          "Cycle / backlog / experiment / roadmap / impact / cadence",
          ok,
          `readiness=${readiness.verdict} cycles=${registry.cycleCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "ITER-STACK",
          "cycle",
          "Cycle / backlog / experiment / roadmap / impact / cadence",
          false,
          error instanceof Error
            ? error.message
            : "product iteration not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "ITER-STACK",
        "cycle",
        "Cycle / backlog / experiment / roadmap / impact / cadence",
        false,
        error instanceof Error
          ? error.message
          : "product iteration probe failed",
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
      `product-iteration-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductIterationReleaseGatePass(
  gate: ReleaseGateResult = checkProductIterationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product iteration release gate failed: ${gate.summary}`,
    );
  }
}
