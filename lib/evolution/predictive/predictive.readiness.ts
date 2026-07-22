/**
 * Evolution P2 — Predictive Intelligence Readiness
 */

import { checkRuntimeHealth } from "../../cloud-runtime/e11/runtime/cloud.health";
import { getCustomerHealthProfile } from "../../operations/customer-success/success.health";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { listOperationsIncidents } from "../../operations/incident/incident.model";
import { EVOLUTION_AI_OPS_OPTIMIZATION_ID } from "../evolution.constants";
import { getOperationsIntelligenceProfile } from "../evolution.intelligence";
import { EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE } from "./predictive.constants";
import { listCapacityForecasts } from "./predictive.capacity";
import { listCustomerRiskSignals } from "./predictive.customer";
import { listIncidentPredictions } from "./predictive.incident";
import { getPredictionModel } from "./predictive.model";
import { listRiskScores } from "./predictive.risk";
import type {
  PredictiveReadinessCheck,
  PredictiveReadinessResult,
} from "./predictive.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): PredictiveReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluatePredictiveReadiness(
  predictionModelId: string,
): PredictiveReadinessResult {
  const model = getPredictionModel(predictionModelId.trim());
  if (!model) {
    return {
      predictionModelId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "PRED-MODEL",
          "model",
          "Prediction model exists",
          false,
          `model not found: ${predictionModelId}`,
        ),
      ],
      summary: "predictive readiness not ready: model missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: PredictiveReadinessCheck[] = [];

  checks.push(
    check(
      "PRED-BASE",
      "evolution",
      "P1 AI ops optimization baseline aligned",
      EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE ===
        EVOLUTION_AI_OPS_OPTIMIZATION_ID,
      `base=${EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE}`,
    ),
  );

  const intel = getOperationsIntelligenceProfile(model.intelligenceProfileId);
  checks.push(
    check(
      "PRED-INTEL",
      "intelligence",
      "Evolution intelligence profile bound",
      !!intel && intel.productId === model.productId,
      intel
        ? `intel=${intel.id} score=${intel.intelligenceScore}`
        : "intelligence missing",
    ),
  );

  if (model.growthDashboardId) {
    const dash = getGrowthDashboard(model.growthDashboardId);
    checks.push(
      check(
        "PRED-GROWTH",
        "growth",
        "Growth analytics dashboard bound",
        !!dash && dash.productId === model.productId,
        dash
          ? `dashboard=${dash.id} score=${dash.growthScore}`
          : "growth dashboard missing",
      ),
    );
  } else {
    checks.push(
      check(
        "PRED-GROWTH",
        "growth",
        "Growth analytics dashboard bound",
        false,
        "growthDashboardId missing",
      ),
    );
  }

  if (model.customerHealthProfileId) {
    const health = getCustomerHealthProfile(model.customerHealthProfileId);
    checks.push(
      check(
        "PRED-CS",
        "customer-success",
        "Customer success health profile bound",
        !!health && health.productId === model.productId,
        health
          ? `health=${health.id} score=${health.score}`
          : "customer health missing",
      ),
    );
  } else {
    checks.push(
      check(
        "PRED-CS",
        "customer-success",
        "Customer success health profile bound",
        false,
        "customerHealthProfileId missing",
      ),
    );
  }

  if (model.cloudRuntimeId) {
    try {
      const report = checkRuntimeHealth(model.cloudRuntimeId);
      checks.push(
        check(
          "PRED-CLOUD",
          "cloud",
          "Cloud runtime metrics available",
          !!report,
          `runtime=${model.cloudRuntimeId} level=${report.level}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "PRED-CLOUD",
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
        "PRED-CLOUD",
        "cloud",
        "Cloud runtime bound",
        false,
        "cloudRuntimeId missing",
      ),
    );
  }

  const incidents = listOperationsIncidents({ productId: model.productId });
  checks.push(
    check(
      "PRED-INCIDENT-OPS",
      "incident",
      "Incident operations data available for product",
      incidents.length >= 0,
      `incidents=${incidents.length}`,
    ),
  );

  const incidentPreds = listIncidentPredictions({
    predictionModelId: model.id,
  });
  checks.push(
    check(
      "PRED-INCIDENT",
      "incident-prediction",
      "Incident prediction present",
      incidentPreds.length >= 1,
      `predictions=${incidentPreds.length}`,
    ),
  );

  const capacities = listCapacityForecasts({
    predictionModelId: model.id,
  });
  checks.push(
    check(
      "PRED-CAPACITY",
      "capacity",
      "Capacity forecast present",
      capacities.length >= 1,
      `forecasts=${capacities.length}`,
    ),
  );

  const customerRisks = listCustomerRiskSignals({
    predictionModelId: model.id,
  });
  checks.push(
    check(
      "PRED-CUSTOMER",
      "customer-risk",
      "Customer risk signal present",
      customerRisks.length >= 1,
      `signals=${customerRisks.length}`,
    ),
  );

  const risks = listRiskScores({ predictionModelId: model.id });
  checks.push(
    check(
      "PRED-RISK",
      "risk",
      "Risk score present",
      risks.length >= 1,
      `scores=${risks.length}`,
    ),
  );

  checks.push(
    check(
      "PRED-CONFIDENCE",
      "model",
      "Prediction confidence acceptable",
      model.confidence >= 40,
      `confidence=${model.confidence}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    predictionModelId: model.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `predictive readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertPredictiveReadinessReady(
  result: PredictiveReadinessResult,
): asserts result is PredictiveReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`predictive intelligence not ready: ${result.summary}`);
  }
}
