/**
 * Evolution P3 — Success Recommendation
 */

import { listAdoptionRecords } from "../../operations/customer-success/success.adoption";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { getCustomerRiskSignal } from "../predictive/predictive.customer";
import { SUCCESS_RECOMMENDATION_KINDS } from "./customer.constants";
import { getCustomerIntelligenceProfile } from "./customer.intelligence";
import type {
  GenerateSuccessRecommendationsInput,
  SuccessRecommendation,
  SuccessRecommendationKind,
} from "./customer.types";

const recommendations = new Map<string, SuccessRecommendation>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneRecommendation(
  recommendation: SuccessRecommendation,
): SuccessRecommendation {
  return { ...recommendation };
}

export function generateSuccessRecommendations(
  input: GenerateSuccessRecommendationsInput,
): SuccessRecommendation[] {
  const profile = getCustomerIntelligenceProfile(
    input.customerIntelligenceId.trim(),
  );
  if (!profile) {
    throw new Error(
      `customer intelligence profile not found: ${input.customerIntelligenceId}`,
    );
  }

  const prefix = input.idPrefix?.trim() || `succrec_${profile.id}`;
  const created: SuccessRecommendation[] = [];

  const candidates: Array<{
    suffix: string;
    kind: SuccessRecommendationKind;
    title: string;
    action: string;
    expectedImpact: number;
  }> = [];

  const adoptions = listAdoptionRecords({
    customerHealthProfileId: profile.customerHealthProfileId,
  });
  if (adoptions.length < 2) {
    candidates.push({
      suffix: "adoption",
      kind: "ADOPTION",
      title: "Accelerate feature adoption",
      action: "trigger guided onboarding and feature activation sequence",
      expectedImpact: 12,
    });
  }

  if (profile.customerRiskSignalId) {
    const risk = getCustomerRiskSignal(profile.customerRiskSignalId);
    if (risk && risk.riskScore >= 45) {
      candidates.push({
        suffix: "retention",
        kind: "RETENTION",
        title: "Stabilize at-risk customer",
        action: "run retention playbook and schedule CSM check-in",
        expectedImpact: 18,
      });
    }
  }

  let growthScore = 55;
  if (profile.growthDashboardId) {
    growthScore =
      getGrowthDashboard(profile.growthDashboardId)?.growthScore ?? 55;
  }
  if (growthScore >= 65 && profile.intelligenceScore >= 60) {
    candidates.push({
      suffix: "expansion",
      kind: "EXPANSION",
      title: "Pursue expansion motion",
      action: "propose upgrade path aligned to usage and growth signals",
      expectedImpact: 15,
    });
  }

  candidates.push({
    suffix: "support",
    kind: "SUPPORT",
    title: "Keep proactive support cadence",
    action: "publish success tips and monitor SLA-aligned support load",
    expectedImpact: 6,
  });

  for (const candidate of candidates) {
    if (
      !(SUCCESS_RECOMMENDATION_KINDS as readonly string[]).includes(
        candidate.kind,
      )
    ) {
      throw new Error(`invalid success recommendation kind: ${candidate.kind}`);
    }
    const id = `${prefix}.${candidate.suffix}`;
    if (recommendations.has(id)) {
      throw new Error(`success recommendation already exists: ${id}`);
    }
    const recommendation: SuccessRecommendation = {
      id,
      customerIntelligenceId: profile.id,
      kind: candidate.kind,
      title: candidate.title,
      action: candidate.action,
      expectedImpact: candidate.expectedImpact,
      detail: `kind=${candidate.kind} impact=${candidate.expectedImpact}`,
      createdAt: nowIso(),
    };
    recommendations.set(id, recommendation);
    created.push(cloneRecommendation(recommendation));
  }

  return created;
}

export function getSuccessRecommendation(
  id: string,
): SuccessRecommendation | undefined {
  const recommendation = recommendations.get(id.trim());
  return recommendation ? cloneRecommendation(recommendation) : undefined;
}

export function listSuccessRecommendations(filter?: {
  customerIntelligenceId?: string;
  kind?: SuccessRecommendationKind;
}): SuccessRecommendation[] {
  let result = [...recommendations.values()];
  if (filter?.customerIntelligenceId) {
    const cid = filter.customerIntelligenceId.trim();
    result = result.filter((r) => r.customerIntelligenceId === cid);
  }
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRecommendation);
}

export function clearSuccessRecommendations(): void {
  recommendations.clear();
}
