/**
 * Evolution P1 — Efficiency Analysis
 */

import { EFFICIENCY_BANDS } from "./evolution.constants";
import { getOperationsIntelligenceProfile } from "./evolution.intelligence";
import type {
  AnalyzeEfficiencyInput,
  EfficiencyAnalysis,
  EfficiencyBand,
} from "./evolution.types";

const analyses = new Map<string, EfficiencyAnalysis>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAnalysis(analysis: EfficiencyAnalysis): EfficiencyAnalysis {
  return { ...analysis, bottlenecks: [...analysis.bottlenecks] };
}

function bandFromScore(score: number): EfficiencyBand {
  if (score >= 85) return "EXCELLENT";
  if (score >= 70) return "GOOD";
  if (score >= 50) return "FAIR";
  if (score > 0) return "POOR";
  return "UNKNOWN";
}

export function analyzeOperationsEfficiency(
  input: AnalyzeEfficiencyInput,
): EfficiencyAnalysis {
  const profile = getOperationsIntelligenceProfile(
    input.intelligenceProfileId.trim(),
  );
  if (!profile) {
    throw new Error(
      `operations intelligence profile not found: ${input.intelligenceProfileId}`,
    );
  }

  const byKind = Object.fromEntries(
    profile.signals.map((s) => [s.kind, s.score]),
  ) as Record<string, number>;

  const cloudScore = byKind.CAPACITY ?? 60;
  const slaScore =
    typeof profile.metadata.slaScore === "number"
      ? profile.metadata.slaScore
      : (byKind.COST ?? 65);
  const growthScore =
    typeof profile.metadata.growthScore === "number"
      ? profile.metadata.growthScore
      : (byKind.GROWTH ?? 60);
  const controlScore = byKind.RELIABILITY ?? profile.intelligenceScore;

  const efficiencyScore = Math.round(
    controlScore * 0.35 +
      cloudScore * 0.25 +
      slaScore * 0.2 +
      growthScore * 0.2,
  );

  const bottlenecks: string[] = [];
  if (cloudScore < 60) bottlenecks.push("cloud-capacity");
  if (slaScore < 60) bottlenecks.push("sla-response");
  if (growthScore < 50) bottlenecks.push("growth-engagement");
  if (controlScore < 60) bottlenecks.push("ops-control-health");

  const band = bandFromScore(efficiencyScore);
  if (!(EFFICIENCY_BANDS as readonly string[]).includes(band)) {
    throw new Error(`invalid efficiency band: ${band}`);
  }

  const id = input.id?.trim() || createId("effan");
  if (analyses.has(id)) {
    throw new Error(`efficiency analysis already exists: ${id}`);
  }

  const analysis: EfficiencyAnalysis = {
    id,
    intelligenceProfileId: profile.id,
    band,
    efficiencyScore,
    cloudScore,
    slaScore,
    growthScore,
    controlScore,
    bottlenecks,
    detail: `band=${band} score=${efficiencyScore} bottlenecks=${bottlenecks.length}`,
    analyzedAt: nowIso(),
  };
  analyses.set(id, analysis);
  return cloneAnalysis(analysis);
}

export function getEfficiencyAnalysis(
  id: string,
): EfficiencyAnalysis | undefined {
  const analysis = analyses.get(id.trim());
  return analysis ? cloneAnalysis(analysis) : undefined;
}

export function listEfficiencyAnalyses(filter?: {
  intelligenceProfileId?: string;
}): EfficiencyAnalysis[] {
  let result = [...analyses.values()];
  if (filter?.intelligenceProfileId) {
    const pid = filter.intelligenceProfileId.trim();
    result = result.filter((a) => a.intelligenceProfileId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAnalysis);
}

export function clearEfficiencyAnalyses(): void {
  analyses.clear();
}
