/**
 * Evolution P3 — Churn Prevention
 * Integrates predictive customer risk + CS health + commercial stage
 */

import { getCustomerLifecycleStage } from "../../product/e12/commercial/commercial.customer";
import { getCustomerHealthProfile } from "../../operations/customer-success/success.health";
import { getCustomerRiskSignal } from "../predictive/predictive.customer";
import { CHURN_THREAT_LEVELS } from "./customer.constants";
import { getCustomerIntelligenceProfile } from "./customer.intelligence";
import type {
  ChurnPreventionPlan,
  ChurnThreatLevel,
  PlanChurnPreventionInput,
} from "./customer.types";

const plans = new Map<string, ChurnPreventionPlan>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlan(plan: ChurnPreventionPlan): ChurnPreventionPlan {
  return { ...plan, interventions: [...plan.interventions] };
}

function threatFromScore(score: number): ChurnThreatLevel {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  if (score >= 20) return "LOW";
  return "NONE";
}

export function planChurnPrevention(
  input: PlanChurnPreventionInput,
): ChurnPreventionPlan {
  const profile = getCustomerIntelligenceProfile(
    input.customerIntelligenceId.trim(),
  );
  if (!profile) {
    throw new Error(
      `customer intelligence profile not found: ${input.customerIntelligenceId}`,
    );
  }

  const health = getCustomerHealthProfile(profile.customerHealthProfileId);
  const healthPressure = health ? Math.max(0, 100 - health.score) : 50;

  let predictivePressure = 30;
  if (profile.customerRiskSignalId) {
    const risk = getCustomerRiskSignal(profile.customerRiskSignalId);
    predictivePressure = risk?.riskScore ?? 30;
  }

  const stage = getCustomerLifecycleStage(
    profile.organizationId,
    profile.productId,
  );
  const stagePressure =
    stage === "CHURNED" ? 40 : stage === "AT_RISK" ? 25 : stage === "ACTIVE" ? 5 : 10;

  const churnScore = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        healthPressure * 0.4 +
          predictivePressure * 0.45 +
          stagePressure * 0.15 +
          Math.max(0, 55 - profile.intelligenceScore) * 0.2,
      ),
    ),
  );
  const threatLevel = threatFromScore(churnScore);
  if (!(CHURN_THREAT_LEVELS as readonly string[]).includes(threatLevel)) {
    throw new Error(`invalid churn threat level: ${threatLevel}`);
  }

  const interventions: string[] = [];
  if (threatLevel === "NONE" || threatLevel === "LOW") {
    interventions.push("maintain-success-cadence");
  }
  if (threatLevel === "MEDIUM" || threatLevel === "HIGH" || threatLevel === "CRITICAL") {
    interventions.push("retention-outreach");
    interventions.push("value-realization-review");
  }
  if (threatLevel === "HIGH" || threatLevel === "CRITICAL") {
    interventions.push("executive-sponsor-touch");
  }
  if (threatLevel === "CRITICAL") {
    interventions.push("save-desk-escalation");
  }

  const id = input.id?.trim() || createId("churnplan");
  if (plans.has(id)) {
    throw new Error(`churn prevention plan already exists: ${id}`);
  }

  const plan: ChurnPreventionPlan = {
    id,
    customerIntelligenceId: profile.id,
    threatLevel,
    churnScore,
    interventions,
    detail: `threat=${threatLevel} score=${churnScore} interventions=${interventions.length}`,
    plannedAt: nowIso(),
  };
  plans.set(id, plan);
  return clonePlan(plan);
}

export function getChurnPreventionPlan(
  id: string,
): ChurnPreventionPlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listChurnPreventionPlans(filter?: {
  customerIntelligenceId?: string;
  threatLevel?: ChurnThreatLevel;
}): ChurnPreventionPlan[] {
  let result = [...plans.values()];
  if (filter?.customerIntelligenceId) {
    const cid = filter.customerIntelligenceId.trim();
    result = result.filter((p) => p.customerIntelligenceId === cid);
  }
  if (filter?.threatLevel) {
    result = result.filter((p) => p.threatLevel === filter.threatLevel);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlan);
}

export function clearChurnPreventionPlans(): void {
  plans.clear();
}
