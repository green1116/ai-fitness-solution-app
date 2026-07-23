/**
 * Operations O4 — Growth Analytics Foundation Release Gate
 * BASE: enterprise-operations-o3-support-operations-v1
 * Isolated namespace — does not mutate E01–E12, commercialization, launch, or o1–o3 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { OPERATIONS_O3_SUPPORT_OPERATIONS_ID } from "../../o3/ticket/ticket.constants";
import {
  COHORT_PERIODS,
  EXPANSION_SIGNAL_KINDS,
  FORECAST_HORIZONS,
  GROWTH_METRIC_KINDS,
  O4_MANAGER_STATUSES,
  O4_READINESS_VERDICTS,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION,
  OPERATIONS_O4_GROWTH_FREEZE_VERSION,
  RETENTION_BANDS,
} from "../growth/growth.constants";
import {
  assertO4GrowthAnalyticsReadinessReady,
  clearO4GrowthAnalyticsLayer,
  createO4GrowthAnalyticsManager,
  getO4RegistryManifest,
} from "../growth.manager";

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

export const OPERATIONS_O4_SIGNOFF_VERSION = "operations-o4-signoff-1" as const;

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
  clearO4GrowthAnalyticsLayer();
}

export function checkOperationsO4ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "O4-CONSTANTS",
      "growth",
      "O4 growth analytics foundation version constants",
      OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID ===
        "enterprise-operations-o4-growth-analytics-foundation-v1" &&
        OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION ===
          "operations-o4-1" &&
        OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE ===
          OPERATIONS_O3_SUPPORT_OPERATIONS_ID &&
        OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION ===
          "operations-o4-growth-analytics-foundation-freeze-1" &&
        OPERATIONS_O4_GROWTH_FREEZE_VERSION ===
          "operations-o4-growth-analytics-foundation-freeze-1" &&
        GROWTH_METRIC_KINDS.length === 4 &&
        RETENTION_BANDS.length === 4 &&
        EXPANSION_SIGNAL_KINDS.length === 4 &&
        COHORT_PERIODS.length === 3 &&
        FORECAST_HORIZONS.length === 4 &&
        O4_READINESS_VERDICTS.length === 3 &&
        O4_MANAGER_STATUSES.length === 4,
      `id=${OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID} base=${OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "O4-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "O4-O3-BASE",
      "operations-o3",
      "O3 support operations BASE preserved",
      OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE ===
        "enterprise-operations-o3-support-operations-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "O4-UPSTREAM",
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
    const mgr = createO4GrowthAnalyticsManager({
      managerId: "ops-o4-gate",
    });
    mgr.initialize();
    mgr.start();

    const growth = mgr.recordGrowthMetrics({
      id: "o4.gate.gmet",
      accountRef: "acme-fitness",
      kind: "ACTIVATION",
      value: 120,
      period: "monthly",
    });
    const tracking = mgr.trackGrowth({
      id: "o4.gate.gtrk",
      metricsId: growth.id,
      previousValue: 95,
    });
    const retention = mgr.scoreRetention({
      id: "o4.gate.rsc",
      accountRef: "acme-fitness",
      retainedUsers: 88,
      startingUsers: 100,
    });
    const retentionAnalysis = mgr.analyzeRetention({
      id: "o4.gate.ran",
      accountRef: "acme-fitness",
      scoreId: retention.id,
    });
    const signal = mgr.detectExpansionSignal({
      id: "o4.gate.sig",
      accountRef: "acme-fitness",
      kind: "SEAT_GROWTH",
      strength: 78,
      note: "Coach seats trending up",
    });
    const opportunity = mgr.createExpansionOpportunity({
      id: "o4.gate.opp",
      accountRef: "acme-fitness",
      signalId: signal.id,
      estimatedValue: 24000,
    });
    mgr.analyzeCohort({
      id: "o4.gate.coh",
      accountRef: "acme-fitness",
      period: "MONTHLY",
      cohortLabel: "2026-06",
      size: 100,
      retainedCount: 82,
    });
    const cohortReport = mgr.generateCohortReport({
      id: "o4.gate.crep",
      accountRef: "acme-fitness",
      title: "Acme Cohort Report",
    });
    const model = mgr.registerForecastModel({
      id: "o4.gate.fmod",
      name: "Activation Growth Model",
      horizon: "90D",
      baselineValue: growth.value,
      growthRate: 8,
    });
    const prediction = mgr.runForecastPrediction({
      id: "o4.gate.fprd",
      modelId: model.id,
      accountRef: "acme-fitness",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getO4RegistryManifest();

    const ok =
      tracking.trend === "UP" &&
      retention.score >= 70 &&
      retentionAnalysis.recommendation.length > 0 &&
      opportunity.priority === "HIGH" &&
      cohortReport.averageRetainedRate >= 50 &&
      prediction.predictedValue > 0 &&
      readiness.verdict === "READY" &&
      registry.foundationId ===
        OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID &&
      registry.base === OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE &&
      registry.growthMetricsCount >= 1 &&
      registry.growthTrackingCount >= 1 &&
      registry.retentionScoreCount >= 1 &&
      registry.retentionAnalysisCount >= 1 &&
      registry.expansionSignalCount >= 1 &&
      registry.expansionOpportunityCount >= 1 &&
      registry.cohortAnalysisCount >= 1 &&
      registry.cohortReportCount >= 1 &&
      registry.forecastModelCount >= 1 &&
      registry.forecastPredictionCount >= 1;

    try {
      assertO4GrowthAnalyticsReadinessReady(readiness);
      checks.push(
        check(
          "O4-STACK",
          "growth",
          "Growth / retention / expansion / cohort / forecast / readiness",
          ok,
          `trend=${tracking.trend} retention=${retention.band} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "O4-STACK",
          "growth",
          "Growth / retention / expansion / cohort / forecast / readiness",
          false,
          error instanceof Error
            ? error.message
            : "o4 growth analytics foundation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "O4-STACK",
        "growth",
        "Growth / retention / expansion / cohort / forecast / readiness",
        false,
        error instanceof Error
          ? error.message
          : "o4 growth analytics foundation probe failed",
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
      `operations-o4-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsO4ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsO4ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations O4 release gate failed: ${gate.summary}`);
  }
}
