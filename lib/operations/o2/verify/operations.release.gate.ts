/**
 * Operations O2 — Usage Intelligence Foundation Release Gate
 * BASE: enterprise-operations-o1-customer-success-foundation-v1
 * Isolated namespace — does not mutate E01–E12, commercialization, launch, or o1 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID } from "../../o1/success/success.constants";
import {
  ACTIVITY_EVENT_KINDS,
  FEATURE_ADOPTION_LEVELS,
  O2_MANAGER_STATUSES,
  O2_READINESS_VERDICTS,
  OPERATIONS_O2_USAGE_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION,
  REPORT_KINDS,
  USAGE_STREAM_KINDS,
  VALUE_BANDS,
} from "../usage/usage.constants";
import {
  assertO2UsageIntelligenceReadinessReady,
  clearO2UsageIntelligenceLayer,
  createO2UsageIntelligenceManager,
  getO2RegistryManifest,
} from "../usage.manager";

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

export const OPERATIONS_O2_SIGNOFF_VERSION = "operations-o2-signoff-1" as const;

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
  clearO2UsageIntelligenceLayer();
}

export function checkOperationsO2ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "O2-CONSTANTS",
      "usage",
      "O2 usage intelligence foundation version constants",
      OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID ===
        "enterprise-operations-o2-usage-intelligence-foundation-v1" &&
        OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION ===
          "operations-o2-1" &&
        OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE ===
          OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID &&
        OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION ===
          "operations-o2-usage-intelligence-foundation-freeze-1" &&
        OPERATIONS_O2_USAGE_FREEZE_VERSION ===
          "operations-o2-usage-intelligence-foundation-freeze-1" &&
        USAGE_STREAM_KINDS.length === 4 &&
        FEATURE_ADOPTION_LEVELS.length === 4 &&
        ACTIVITY_EVENT_KINDS.length === 4 &&
        VALUE_BANDS.length === 4 &&
        REPORT_KINDS.length === 4 &&
        O2_READINESS_VERDICTS.length === 3 &&
        O2_MANAGER_STATUSES.length === 4,
      `id=${OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID} base=${OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "O2-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "O2-O1-BASE",
      "operations-o1",
      "O1 customer success foundation BASE preserved",
      OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE ===
        "enterprise-operations-o1-customer-success-foundation-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "O2-UPSTREAM",
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
    const mgr = createO2UsageIntelligenceManager({
      managerId: "ops-o2-gate",
    });
    mgr.initialize();
    mgr.start();

    const stream = mgr.registerStream({
      id: "o2.gate.stream",
      accountRef: "acme-fitness",
      name: "Coach Sessions",
      kind: "SESSION",
    });
    const tracking = mgr.trackUsage({
      id: "o2.gate.track",
      streamId: stream.id,
      units: 86,
      period: "weekly",
    });
    mgr.recordAdoption({
      id: "o2.gate.adopt.coach",
      accountRef: "acme-fitness",
      featureKey: "coach-console",
      level: "POWER",
      activeUsers: 42,
    });
    mgr.recordAdoption({
      id: "o2.gate.adopt.export",
      accountRef: "acme-fitness",
      featureKey: "export-hub",
      level: "ACTIVE",
      activeUsers: 18,
    });
    const featureMetrics = mgr.computeFeatureMetrics({
      id: "o2.gate.fmet",
      accountRef: "acme-fitness",
    });
    mgr.recordActivity({
      id: "o2.gate.act.login",
      accountRef: "acme-fitness",
      kind: "LOGIN",
      actor: "coach.alex",
      message: "Coach signed in",
    });
    mgr.recordActivity({
      id: "o2.gate.act.use",
      accountRef: "acme-fitness",
      kind: "FEATURE_USE",
      actor: "coach.alex",
      message: "Opened coach console",
    });
    const analytics = mgr.analyzeActivity({
      id: "o2.gate.aan",
      accountRef: "acme-fitness",
    });
    const valueMetrics = mgr.recordValueMetrics({
      id: "o2.gate.vmet",
      accountRef: "acme-fitness",
      usageUnits: tracking.units,
      adoptionRate: featureMetrics.adoptionRate,
      activityIntensity: analytics.intensityScore,
    });
    const valueScore = mgr.scoreValue({
      id: "o2.gate.vsc",
      accountRef: "acme-fitness",
      metricsId: valueMetrics.id,
    });
    const report = mgr.generateReport({
      id: "o2.gate.report",
      kind: "EXECUTIVE",
      accountRef: "acme-fitness",
      title: "Acme Usage Intelligence",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getO2RegistryManifest();

    const ok =
      featureMetrics.adoptionRate >= 50 &&
      analytics.intensityScore >= 20 &&
      valueScore.score >= 25 &&
      report.overallScore >= 0 &&
      readiness.verdict === "READY" &&
      registry.foundationId ===
        OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID &&
      registry.base === OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE &&
      registry.streamCount >= 1 &&
      registry.trackingCount >= 1 &&
      registry.adoptionCount >= 1 &&
      registry.featureMetricsCount >= 1 &&
      registry.activityEventCount >= 1 &&
      registry.activityAnalyticsCount >= 1 &&
      registry.valueMetricsCount >= 1 &&
      registry.valueScoreCount >= 1 &&
      registry.reportCount >= 1;

    try {
      assertO2UsageIntelligenceReadinessReady(readiness);
      checks.push(
        check(
          "O2-STACK",
          "usage",
          "Usage / feature / activity / value / report / readiness",
          ok,
          `adoption=${featureMetrics.adoptionRate} value=${valueScore.band} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "O2-STACK",
          "usage",
          "Usage / feature / activity / value / report / readiness",
          false,
          error instanceof Error
            ? error.message
            : "o2 usage intelligence foundation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "O2-STACK",
        "usage",
        "Usage / feature / activity / value / report / readiness",
        false,
        error instanceof Error
          ? error.message
          : "o2 usage intelligence foundation probe failed",
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
      `operations-o2-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsO2ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsO2ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations O2 release gate failed: ${gate.summary}`);
  }
}
