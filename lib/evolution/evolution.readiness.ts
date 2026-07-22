/**
 * Evolution P1 — AI Operations Optimization Readiness
 */

import { OPERATIONS_GOVERNANCE_COMPLETE_ID } from "../operations/signoff/governance.freeze.lock";
import { getOperationsOrchestration } from "../operations/control/control.orchestration";
import { getGrowthDashboard } from "../operations/growth/growth.dashboard";
import { getSupportSlaProfile } from "../launch/support/support.profile";
import { checkRuntimeHealth } from "../cloud-runtime/e11/runtime/cloud.health";
import { EVOLUTION_AI_OPS_OPTIMIZATION_BASE } from "./evolution.constants";
import { listEfficiencyAnalyses } from "./evolution.efficiency";
import { listImprovementRecords } from "./evolution.improvement";
import { getOperationsIntelligenceProfile } from "./evolution.intelligence";
import { listOptimizationRecommendations } from "./evolution.recommendation";
import { listResourceInsights } from "./evolution.resource";
import type {
  EvolutionReadinessCheck,
  EvolutionReadinessResult,
} from "./evolution.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): EvolutionReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateEvolutionReadiness(
  intelligenceProfileId: string,
): EvolutionReadinessResult {
  const profile = getOperationsIntelligenceProfile(
    intelligenceProfileId.trim(),
  );
  if (!profile) {
    return {
      intelligenceProfileId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "EV-INTEL",
          "intelligence",
          "Operations intelligence profile exists",
          false,
          `profile not found: ${intelligenceProfileId}`,
        ),
      ],
      summary: "evolution readiness not ready: profile missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: EvolutionReadinessCheck[] = [];

  checks.push(
    check(
      "EV-BASE",
      "operations",
      "Post-launch operations complete baseline aligned",
      EVOLUTION_AI_OPS_OPTIMIZATION_BASE === OPERATIONS_GOVERNANCE_COMPLETE_ID,
      `base=${EVOLUTION_AI_OPS_OPTIMIZATION_BASE}`,
    ),
  );

  const orch = getOperationsOrchestration(profile.orchestrationId);
  checks.push(
    check(
      "EV-CONTROL",
      "control",
      "Operations control orchestration bound",
      !!orch && orch.productId === profile.productId,
      orch
        ? `orch=${orch.id} status=${orch.status}`
        : "orchestration missing",
    ),
  );

  if (profile.growthDashboardId) {
    const dash = getGrowthDashboard(profile.growthDashboardId);
    checks.push(
      check(
        "EV-GROWTH",
        "growth",
        "Growth analytics dashboard bound",
        !!dash && dash.productId === profile.productId,
        dash
          ? `dashboard=${dash.id} score=${dash.growthScore}`
          : "growth dashboard missing",
      ),
    );
  } else {
    checks.push(
      check(
        "EV-GROWTH",
        "growth",
        "Growth analytics dashboard bound",
        false,
        "growthDashboardId missing",
      ),
    );
  }

  if (profile.supportSlaProfileId) {
    const sla = getSupportSlaProfile(profile.supportSlaProfileId);
    checks.push(
      check(
        "EV-SLA",
        "sla",
        "SLA support profile active",
        !!sla &&
          sla.productId === profile.productId &&
          sla.status === "ACTIVE",
        sla ? `sla=${sla.id} status=${sla.status}` : "sla missing",
      ),
    );
  } else {
    checks.push(
      check(
        "EV-SLA",
        "sla",
        "SLA support profile bound",
        false,
        "supportSlaProfileId missing",
      ),
    );
  }

  if (profile.cloudRuntimeId) {
    try {
      const report = checkRuntimeHealth(profile.cloudRuntimeId);
      checks.push(
        check(
          "EV-CLOUD",
          "cloud",
          "Cloud runtime metrics available",
          !!report,
          `runtime=${profile.cloudRuntimeId} level=${report.level}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "EV-CLOUD",
          "cloud",
          "Cloud runtime metrics available",
          false,
          error instanceof Error ? error.message : "cloud health failed",
        ),
      );
    }
  } else {
    checks.push(
      check(
        "EV-CLOUD",
        "cloud",
        "Cloud runtime bound",
        false,
        "cloudRuntimeId missing",
      ),
    );
  }

  const analyses = listEfficiencyAnalyses({
    intelligenceProfileId: profile.id,
  });
  checks.push(
    check(
      "EV-EFFICIENCY",
      "efficiency",
      "Efficiency analysis present",
      analyses.length >= 1,
      `analyses=${analyses.length}`,
    ),
  );

  const recommendations = listOptimizationRecommendations({
    intelligenceProfileId: profile.id,
  });
  checks.push(
    check(
      "EV-RECOMMENDATION",
      "recommendation",
      "Optimization recommendations present",
      recommendations.length >= 1,
      `recommendations=${recommendations.length}`,
    ),
  );

  const resources = listResourceInsights({
    intelligenceProfileId: profile.id,
  });
  checks.push(
    check(
      "EV-RESOURCE",
      "resource",
      "Resource insight present",
      resources.length >= 1,
      `insights=${resources.length}`,
    ),
  );

  const improvements = listImprovementRecords({
    intelligenceProfileId: profile.id,
  });
  checks.push(
    check(
      "EV-IMPROVEMENT",
      "improvement",
      "Improvement tracking present",
      improvements.length >= 1,
      `improvements=${improvements.length}`,
    ),
  );

  checks.push(
    check(
      "EV-SCORE",
      "intelligence",
      "Intelligence score acceptable",
      profile.intelligenceScore >= 40,
      `intelligence=${profile.intelligenceScore}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    intelligenceProfileId: profile.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `evolution readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertEvolutionReadinessReady(
  result: EvolutionReadinessResult,
): asserts result is EvolutionReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`evolution AI ops not ready: ${result.summary}`);
  }
}
