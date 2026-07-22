/**
 * Evolution P1 — Optimization Recommendation
 */

import { OPTIMIZATION_PRIORITIES } from "./evolution.constants";
import { getEfficiencyAnalysis } from "./evolution.efficiency";
import { getOperationsIntelligenceProfile } from "./evolution.intelligence";
import type {
  GenerateRecommendationsInput,
  OptimizationPriority,
  OptimizationRecommendation,
} from "./evolution.types";

const recommendations = new Map<string, OptimizationRecommendation>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneRecommendation(
  recommendation: OptimizationRecommendation,
): OptimizationRecommendation {
  return { ...recommendation };
}

function priorityForBottleneck(bottleneck: string): OptimizationPriority {
  if (bottleneck === "ops-control-health" || bottleneck === "sla-response") {
    return "P1";
  }
  if (bottleneck === "cloud-capacity") return "P2";
  if (bottleneck === "growth-engagement") return "P3";
  return "P4";
}

export function generateOptimizationRecommendations(
  input: GenerateRecommendationsInput,
): OptimizationRecommendation[] {
  const profile = getOperationsIntelligenceProfile(
    input.intelligenceProfileId.trim(),
  );
  if (!profile) {
    throw new Error(
      `operations intelligence profile not found: ${input.intelligenceProfileId}`,
    );
  }
  const analysis = getEfficiencyAnalysis(input.efficiencyAnalysisId.trim());
  if (!analysis || analysis.intelligenceProfileId !== profile.id) {
    throw new Error(
      `efficiency analysis not found: ${input.efficiencyAnalysisId}`,
    );
  }

  const prefix = input.idPrefix?.trim() || `optrec_${profile.id}`;
  const created: OptimizationRecommendation[] = [];

  const candidates: Array<{
    suffix: string;
    title: string;
    action: string;
    bottleneck?: string;
    expectedGain: number;
    priority?: OptimizationPriority;
  }> = [
    ...analysis.bottlenecks.map((b) => ({
      suffix: b,
      title: `Resolve ${b}`,
      action: `mitigate bottleneck ${b}`,
      bottleneck: b,
      expectedGain: 12,
    })),
  ];

  if (analysis.efficiencyScore < 80) {
    candidates.push({
      suffix: "baseline",
      title: "Raise operational efficiency baseline",
      action: "tune scheduling and reduce waste across control domains",
      expectedGain: 8,
      priority: "P2",
    });
  }

  if (analysis.growthScore >= 70 && analysis.cloudScore < 75) {
    candidates.push({
      suffix: "scale",
      title: "Scale runtime capacity for growth",
      action: "provision additional healthy cloud runtime capacity",
      expectedGain: 10,
      priority: "P2",
    });
  }

  if (candidates.length === 0) {
    candidates.push({
      suffix: "maintain",
      title: "Maintain steady-state optimization",
      action: "continue monitoring and incremental tuning",
      expectedGain: 3,
      priority: "P4",
    });
  }

  for (const candidate of candidates) {
    const id = `${prefix}.${candidate.suffix}`;
    if (recommendations.has(id)) {
      throw new Error(`optimization recommendation already exists: ${id}`);
    }
    const priority =
      candidate.priority ??
      (candidate.bottleneck
        ? priorityForBottleneck(candidate.bottleneck)
        : "P3");
    if (!(OPTIMIZATION_PRIORITIES as readonly string[]).includes(priority)) {
      throw new Error(`invalid optimization priority: ${priority}`);
    }

    const recommendation: OptimizationRecommendation = {
      id,
      intelligenceProfileId: profile.id,
      efficiencyAnalysisId: analysis.id,
      priority,
      title: candidate.title,
      action: candidate.action,
      expectedGain: candidate.expectedGain,
      detail: `priority=${priority} gain=${candidate.expectedGain}`,
      createdAt: nowIso(),
    };
    recommendations.set(id, recommendation);
    created.push(cloneRecommendation(recommendation));
  }

  return created;
}

export function getOptimizationRecommendation(
  id: string,
): OptimizationRecommendation | undefined {
  const recommendation = recommendations.get(id.trim());
  return recommendation ? cloneRecommendation(recommendation) : undefined;
}

export function listOptimizationRecommendations(filter?: {
  intelligenceProfileId?: string;
  priority?: OptimizationPriority;
}): OptimizationRecommendation[] {
  let result = [...recommendations.values()];
  if (filter?.intelligenceProfileId) {
    const pid = filter.intelligenceProfileId.trim();
    result = result.filter((r) => r.intelligenceProfileId === pid);
  }
  if (filter?.priority) {
    result = result.filter((r) => r.priority === filter.priority);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRecommendation);
}

export function clearOptimizationRecommendations(): void {
  recommendations.clear();
}
