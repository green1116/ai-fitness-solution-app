/**
 * Evolution P3 — Expansion Opportunity
 * Integrates growth analytics + commercial control + CS health
 */

import { getCustomerLifecycleStage } from "../../product/e12/commercial/commercial.customer";
import { getSlaAgreement } from "../../product/e12/commercial/commercial.sla";
import { getCustomerHealthProfile } from "../../operations/customer-success/success.health";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { EXPANSION_OPPORTUNITY_LEVELS } from "./customer.constants";
import { getCustomerIntelligenceProfile } from "./customer.intelligence";
import type {
  DetectExpansionOpportunityInput,
  ExpansionOpportunity,
  ExpansionOpportunityLevel,
} from "./customer.types";

const opportunities = new Map<string, ExpansionOpportunity>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOpportunity(
  opportunity: ExpansionOpportunity,
): ExpansionOpportunity {
  return { ...opportunity, signals: [...opportunity.signals] };
}

function levelFromScore(score: number): ExpansionOpportunityLevel {
  if (score >= 80) return "HOT";
  if (score >= 60) return "READY";
  if (score >= 35) return "EMERGING";
  if (score > 0) return "NONE";
  return "UNKNOWN";
}

export function detectExpansionOpportunity(
  input: DetectExpansionOpportunityInput,
): ExpansionOpportunity {
  const profile = getCustomerIntelligenceProfile(
    input.customerIntelligenceId.trim(),
  );
  if (!profile) {
    throw new Error(
      `customer intelligence profile not found: ${input.customerIntelligenceId}`,
    );
  }

  const health = getCustomerHealthProfile(profile.customerHealthProfileId);
  const healthScore = health?.score ?? 50;

  let growthScore = 50;
  let expansionSignalCount = 0;
  if (profile.growthDashboardId) {
    const dash = getGrowthDashboard(profile.growthDashboardId);
    growthScore = dash?.growthScore ?? 50;
    expansionSignalCount = dash?.expansionSignals.length ?? 0;
  }

  const stage = getCustomerLifecycleStage(
    profile.organizationId,
    profile.productId,
  );
  const stageBoost =
    stage === "ACTIVE" ? 16 : stage === "ONBOARDING" ? 6 : 0;

  let slaBoost = 0;
  if (profile.commercialSlaId) {
    const sla = getSlaAgreement(profile.commercialSlaId);
    if (sla?.tier === "PREMIUM" || sla?.tier === "ENTERPRISE") slaBoost = 10;
    else if (sla) slaBoost = 5;
  }

  const opportunityScore = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        healthScore * 0.3 +
          growthScore * 0.35 +
          expansionSignalCount * 8 +
          stageBoost +
          slaBoost +
          Math.max(0, profile.intelligenceScore - 50) * 0.2,
      ),
    ),
  );
  const level = levelFromScore(opportunityScore);
  if (!(EXPANSION_OPPORTUNITY_LEVELS as readonly string[]).includes(level)) {
    throw new Error(`invalid expansion opportunity level: ${level}`);
  }

  const signals: string[] = [];
  if (growthScore >= 65) signals.push("strong-growth");
  if (expansionSignalCount > 0) {
    signals.push(`growth-expansion-signals=${expansionSignalCount}`);
  }
  if (healthScore >= 70) signals.push("healthy-customer");
  if (stage) signals.push(`lifecycle=${stage}`);
  if (slaBoost > 0) signals.push("commercial-sla-ready");
  if (signals.length === 0) signals.push("baseline-watch");

  const id = input.id?.trim() || createId("expandopp");
  if (opportunities.has(id)) {
    throw new Error(`expansion opportunity already exists: ${id}`);
  }

  const opportunity: ExpansionOpportunity = {
    id,
    customerIntelligenceId: profile.id,
    level,
    opportunityScore,
    signals,
    detail: `level=${level} score=${opportunityScore}`,
    detectedAt: nowIso(),
  };
  opportunities.set(id, opportunity);
  return cloneOpportunity(opportunity);
}

export function getExpansionOpportunity(
  id: string,
): ExpansionOpportunity | undefined {
  const opportunity = opportunities.get(id.trim());
  return opportunity ? cloneOpportunity(opportunity) : undefined;
}

export function listExpansionOpportunities(filter?: {
  customerIntelligenceId?: string;
  level?: ExpansionOpportunityLevel;
}): ExpansionOpportunity[] {
  let result = [...opportunities.values()];
  if (filter?.customerIntelligenceId) {
    const cid = filter.customerIntelligenceId.trim();
    result = result.filter((o) => o.customerIntelligenceId === cid);
  }
  if (filter?.level) result = result.filter((o) => o.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOpportunity);
}

export function clearExpansionOpportunities(): void {
  opportunities.clear();
}
