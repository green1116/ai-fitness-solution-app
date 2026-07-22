/**
 * Evolution P4 — Enterprise Intelligence Dashboard Readiness
 */

import { getExecutiveOpsDashboard } from "../../operations/control/control.dashboard";
import { getOperationsOrchestration } from "../../operations/control/control.orchestration";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID } from "../customer/customer.constants";
import { getCustomerIntelligenceProfile } from "../customer/customer.intelligence";
import { getPredictionModel } from "../predictive/predictive.model";
import { EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE } from "./dashboard.constants";
import { listBusinessIntelligenceViews } from "./dashboard.bi";
import { listExecutiveAnalytics } from "./dashboard.executive";
import { listOperationalInsights } from "./dashboard.insights";
import { listCrossPlatformMetrics } from "./dashboard.metrics";
import { getIntelligenceDashboard } from "./dashboard.model";
import type {
  DashboardReadinessCheck,
  DashboardReadinessResult,
} from "./dashboard.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): DashboardReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateDashboardReadiness(
  intelligenceDashboardId: string,
): DashboardReadinessResult {
  const dashboard = getIntelligenceDashboard(intelligenceDashboardId.trim());
  if (!dashboard) {
    return {
      intelligenceDashboardId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "EID-MODEL",
          "dashboard",
          "Intelligence dashboard exists",
          false,
          `dashboard not found: ${intelligenceDashboardId}`,
        ),
      ],
      summary: "dashboard readiness not ready: model missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: DashboardReadinessCheck[] = [];

  checks.push(
    check(
      "EID-BASE",
      "evolution",
      "P3 autonomous customer success baseline aligned",
      EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE ===
        EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
      `base=${EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE}`,
    ),
  );

  const orch = getOperationsOrchestration(dashboard.orchestrationId);
  checks.push(
    check(
      "EID-CONTROL",
      "control",
      "Operations control orchestration bound",
      !!orch && orch.productId === dashboard.productId,
      orch
        ? `orch=${orch.id} status=${orch.status}`
        : "orchestration missing",
    ),
  );

  if (dashboard.predictionModelId) {
    const model = getPredictionModel(dashboard.predictionModelId);
    checks.push(
      check(
        "EID-PREDICTIVE",
        "predictive",
        "Predictive intelligence model bound",
        !!model && model.productId === dashboard.productId,
        model
          ? `model=${model.id} confidence=${model.confidence}`
          : "prediction model missing",
      ),
    );
  } else {
    checks.push(
      check(
        "EID-PREDICTIVE",
        "predictive",
        "Predictive intelligence model bound",
        false,
        "predictionModelId missing",
      ),
    );
  }

  if (dashboard.customerIntelligenceId) {
    const cs = getCustomerIntelligenceProfile(dashboard.customerIntelligenceId);
    checks.push(
      check(
        "EID-CUSTOMER",
        "customer",
        "Autonomous customer success bound",
        !!cs && cs.productId === dashboard.productId,
        cs
          ? `cs=${cs.id} score=${cs.intelligenceScore}`
          : "customer intelligence missing",
      ),
    );
  } else {
    checks.push(
      check(
        "EID-CUSTOMER",
        "customer",
        "Autonomous customer success bound",
        false,
        "customerIntelligenceId missing",
      ),
    );
  }

  if (dashboard.growthDashboardId) {
    const growth = getGrowthDashboard(dashboard.growthDashboardId);
    checks.push(
      check(
        "EID-GROWTH",
        "growth",
        "Growth analytics dashboard bound",
        !!growth && growth.productId === dashboard.productId,
        growth
          ? `dashboard=${growth.id} score=${growth.growthScore}`
          : "growth dashboard missing",
      ),
    );
  } else {
    checks.push(
      check(
        "EID-GROWTH",
        "growth",
        "Growth analytics dashboard bound",
        false,
        "growthDashboardId missing",
      ),
    );
  }

  if (dashboard.executiveOpsDashboardId) {
    const exec = getExecutiveOpsDashboard(dashboard.executiveOpsDashboardId);
    checks.push(
      check(
        "EID-OPS-DASH",
        "operations",
        "Executive ops dashboard bound",
        !!exec && exec.productId === dashboard.productId,
        exec
          ? `exec=${exec.id} score=${exec.executiveScore}`
          : "executive ops dashboard missing",
      ),
    );
  } else {
    checks.push(
      check(
        "EID-OPS-DASH",
        "operations",
        "Executive ops dashboard bound",
        false,
        "executiveOpsDashboardId missing",
      ),
    );
  }

  const execAnalytics = listExecutiveAnalytics({
    intelligenceDashboardId: dashboard.id,
  });
  checks.push(
    check(
      "EID-EXEC",
      "executive",
      "Executive analytics present",
      execAnalytics.length >= 1,
      `analytics=${execAnalytics.length}`,
    ),
  );

  const cross = listCrossPlatformMetrics({
    intelligenceDashboardId: dashboard.id,
  });
  checks.push(
    check(
      "EID-METRICS",
      "metrics",
      "Cross-platform metrics present",
      cross.length >= 1,
      `metrics=${cross.length}`,
    ),
  );

  const insights = listOperationalInsights({
    intelligenceDashboardId: dashboard.id,
  });
  checks.push(
    check(
      "EID-INSIGHTS",
      "insights",
      "Operational insights present",
      insights.length >= 1,
      `insights=${insights.length}`,
    ),
  );

  const views = listBusinessIntelligenceViews({
    intelligenceDashboardId: dashboard.id,
  });
  checks.push(
    check(
      "EID-BI",
      "bi",
      "Business intelligence view present",
      views.length >= 1,
      `views=${views.length}`,
    ),
  );

  checks.push(
    check(
      "EID-SCORE",
      "dashboard",
      "Composite score acceptable",
      dashboard.compositeScore >= 40,
      `composite=${dashboard.compositeScore}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    intelligenceDashboardId: dashboard.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `dashboard readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertDashboardReadinessReady(
  result: DashboardReadinessResult,
): asserts result is DashboardReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `enterprise intelligence dashboard not ready: ${result.summary}`,
    );
  }
}
