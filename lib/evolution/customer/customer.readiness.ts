/**
 * Evolution P3 — Autonomous Customer Success Readiness
 */

import { getSlaAgreement } from "../../product/e12/commercial/commercial.sla";
import { getCustomerHealthProfile } from "../../operations/customer-success/success.health";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { EVOLUTION_PREDICTIVE_INTELLIGENCE_ID } from "../predictive/predictive.constants";
import { getCustomerRiskSignal } from "../predictive/predictive.customer";
import { getPredictionModel } from "../predictive/predictive.model";
import { EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE } from "./customer.constants";
import { listChurnPreventionPlans } from "./customer.churn";
import { listEngagementAutomations } from "./customer.engagement";
import { listExpansionOpportunities } from "./customer.expansion";
import { getCustomerIntelligenceProfile } from "./customer.intelligence";
import { listSuccessRecommendations } from "./customer.recommendation";
import type {
  AutonomousCsReadinessCheck,
  AutonomousCsReadinessResult,
} from "./customer.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AutonomousCsReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateAutonomousCsReadiness(
  customerIntelligenceId: string,
): AutonomousCsReadinessResult {
  const profile = getCustomerIntelligenceProfile(
    customerIntelligenceId.trim(),
  );
  if (!profile) {
    return {
      customerIntelligenceId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "ACS-INTEL",
          "intelligence",
          "Customer intelligence profile exists",
          false,
          `profile not found: ${customerIntelligenceId}`,
        ),
      ],
      summary: "autonomous CS readiness not ready: profile missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: AutonomousCsReadinessCheck[] = [];

  checks.push(
    check(
      "ACS-BASE",
      "evolution",
      "P2 predictive intelligence baseline aligned",
      EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE ===
        EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
      `base=${EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE}`,
    ),
  );

  const health = getCustomerHealthProfile(profile.customerHealthProfileId);
  checks.push(
    check(
      "ACS-CS-OPS",
      "customer-success",
      "Customer success health profile bound",
      !!health && health.productId === profile.productId,
      health
        ? `health=${health.id} score=${health.score}`
        : "customer health missing",
    ),
  );

  if (profile.predictionModelId || profile.customerRiskSignalId) {
    const model = profile.predictionModelId
      ? getPredictionModel(profile.predictionModelId)
      : undefined;
    const risk = profile.customerRiskSignalId
      ? getCustomerRiskSignal(profile.customerRiskSignalId)
      : undefined;
    checks.push(
      check(
        "ACS-PREDICTIVE",
        "predictive",
        "Predictive customer signals bound",
        (!!model && model.productId === profile.productId) || !!risk,
        `model=${model?.id ?? "n/a"} risk=${risk?.id ?? "n/a"}`,
      ),
    );
  } else {
    checks.push(
      check(
        "ACS-PREDICTIVE",
        "predictive",
        "Predictive customer signals bound",
        false,
        "predictionModelId/customerRiskSignalId missing",
      ),
    );
  }

  if (profile.growthDashboardId) {
    const dash = getGrowthDashboard(profile.growthDashboardId);
    checks.push(
      check(
        "ACS-GROWTH",
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
        "ACS-GROWTH",
        "growth",
        "Growth analytics dashboard bound",
        false,
        "growthDashboardId missing",
      ),
    );
  }

  if (profile.commercialSlaId) {
    const sla = getSlaAgreement(profile.commercialSlaId);
    checks.push(
      check(
        "ACS-COMMERCIAL",
        "commercial",
        "Commercial control SLA bound",
        !!sla && sla.productId === profile.productId,
        sla ? `sla=${sla.id} tier=${sla.tier}` : "commercial sla missing",
      ),
    );
  } else {
    checks.push(
      check(
        "ACS-COMMERCIAL",
        "commercial",
        "Commercial control SLA bound",
        false,
        "commercialSlaId missing",
      ),
    );
  }

  const engagements = listEngagementAutomations({
    customerIntelligenceId: profile.id,
  });
  checks.push(
    check(
      "ACS-ENGAGEMENT",
      "engagement",
      "Engagement automation present",
      engagements.length >= 1,
      `engagements=${engagements.length}`,
    ),
  );

  const recommendations = listSuccessRecommendations({
    customerIntelligenceId: profile.id,
  });
  checks.push(
    check(
      "ACS-RECOMMENDATION",
      "recommendation",
      "Success recommendations present",
      recommendations.length >= 1,
      `recommendations=${recommendations.length}`,
    ),
  );

  const churnPlans = listChurnPreventionPlans({
    customerIntelligenceId: profile.id,
  });
  checks.push(
    check(
      "ACS-CHURN",
      "churn",
      "Churn prevention plan present",
      churnPlans.length >= 1,
      `plans=${churnPlans.length}`,
    ),
  );

  const expansions = listExpansionOpportunities({
    customerIntelligenceId: profile.id,
  });
  checks.push(
    check(
      "ACS-EXPANSION",
      "expansion",
      "Expansion opportunity present",
      expansions.length >= 1,
      `opportunities=${expansions.length}`,
    ),
  );

  checks.push(
    check(
      "ACS-SCORE",
      "intelligence",
      "Customer intelligence score acceptable",
      profile.intelligenceScore >= 40,
      `intelligence=${profile.intelligenceScore}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    customerIntelligenceId: profile.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `autonomous CS readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAutonomousCsReadinessReady(
  result: AutonomousCsReadinessResult,
): asserts result is AutonomousCsReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `autonomous customer success not ready: ${result.summary}`,
    );
  }
}
