/**
 * Evolution P2 — Customer Risk Signals
 * Integrates customer success + growth analytics
 */

import { getCustomerHealthProfile } from "../../operations/customer-success/success.health";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { CUSTOMER_RISK_LEVELS } from "./predictive.constants";
import { getPredictionModel } from "./predictive.model";
import type {
  CustomerRiskLevel,
  CustomerRiskSignal,
  DetectCustomerRiskInput,
} from "./predictive.types";

const signals = new Map<string, CustomerRiskSignal>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSignal(signal: CustomerRiskSignal): CustomerRiskSignal {
  return { ...signal, signals: [...signal.signals] };
}

function levelFromRisk(score: number): CustomerRiskLevel {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "AT_RISK";
  if (score >= 35) return "WATCH";
  if (score > 0) return "STABLE";
  return "UNKNOWN";
}

export function detectCustomerRisk(
  input: DetectCustomerRiskInput,
): CustomerRiskSignal {
  const model = getPredictionModel(input.predictionModelId.trim());
  if (!model) {
    throw new Error(
      `prediction model not found: ${input.predictionModelId}`,
    );
  }

  const healthId =
    input.customerHealthProfileId?.trim() ||
    model.customerHealthProfileId?.trim();
  if (!healthId) {
    throw new Error("customerHealthProfileId is required for customer risk");
  }

  const health = getCustomerHealthProfile(healthId);
  if (!health || health.productId !== model.productId) {
    throw new Error(`customer health profile not found: ${healthId}`);
  }

  let growthScore: number | undefined;
  if (model.growthDashboardId) {
    growthScore = getGrowthDashboard(model.growthDashboardId)?.growthScore;
  }

  const healthInverted = Math.max(0, 100 - health.score);
  const growthDrag =
    growthScore != null && growthScore < 45
      ? Math.round((45 - growthScore) * 0.8)
      : 0;
  const levelBias =
    health.health === "CRITICAL"
      ? 25
      : health.health === "AT_RISK"
        ? 15
        : health.health === "STABLE"
          ? 5
          : 0;

  const riskScore = Math.round(
    Math.max(0, Math.min(100, healthInverted * 0.7 + growthDrag + levelBias)),
  );
  const level = levelFromRisk(riskScore);
  if (!(CUSTOMER_RISK_LEVELS as readonly string[]).includes(level)) {
    throw new Error(`invalid customer risk level: ${level}`);
  }

  const flags: string[] = [];
  if (health.score < 60) flags.push("low-health-score");
  if (health.health === "AT_RISK" || health.health === "CRITICAL") {
    flags.push(`health=${health.health}`);
  }
  if (growthScore != null && growthScore < 45) flags.push("weak-growth");
  if (flags.length === 0) flags.push("stable-baseline");

  const id = input.id?.trim() || createId("custrisk");
  if (signals.has(id)) {
    throw new Error(`customer risk signal already exists: ${id}`);
  }

  const signal: CustomerRiskSignal = {
    id,
    predictionModelId: model.id,
    customerHealthProfileId: health.id,
    level,
    riskScore,
    healthScore: health.score,
    growthScore,
    signals: flags,
    detail: `level=${level} risk=${riskScore} health=${health.score}`,
    detectedAt: nowIso(),
  };
  signals.set(id, signal);
  return cloneSignal(signal);
}

export function getCustomerRiskSignal(
  id: string,
): CustomerRiskSignal | undefined {
  const signal = signals.get(id.trim());
  return signal ? cloneSignal(signal) : undefined;
}

export function listCustomerRiskSignals(filter?: {
  predictionModelId?: string;
  level?: CustomerRiskLevel;
}): CustomerRiskSignal[] {
  let result = [...signals.values()];
  if (filter?.predictionModelId) {
    const mid = filter.predictionModelId.trim();
    result = result.filter((s) => s.predictionModelId === mid);
  }
  if (filter?.level) result = result.filter((s) => s.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSignal);
}

export function clearCustomerRiskSignals(): void {
  signals.clear();
}
