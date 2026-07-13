/**
 * E01-P3 — Tender Intelligence schema (pure TS validation)
 */

import type { RequirementIndex } from "../understanding/understanding.types";
import type {
  FitScoreBand,
  IntelligenceLifecycleStage,
  IntelligenceStatus,
  OpportunityProfile,
  OpportunityTier,
  RiskSeverity,
  TenderAnalysis,
} from "./intelligence.types";

export const INTELLIGENCE_LIFECYCLE_STAGES: readonly IntelligenceLifecycleStage[] = [
  "requirements",
  "analysis",
  "opportunity",
] as const;

export const INTELLIGENCE_STATUSES: readonly IntelligenceStatus[] = [
  "pending",
  "analyzed",
  "profiled",
  "ready",
  "failed",
] as const;

export const RISK_SEVERITIES: readonly RiskSeverity[] = ["low", "medium", "high"] as const;

export const OPPORTUNITY_TIERS: readonly OpportunityTier[] = [
  "low",
  "medium",
  "high",
  "strategic",
] as const;

export const FIT_SCORE_BANDS: readonly FitScoreBand[] = [
  "weak",
  "fair",
  "strong",
  "excellent",
] as const;

export type SchemaIssue = {
  path: string;
  message: string;
};

export type SchemaResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: SchemaIssue[] };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function issue(path: string, message: string): SchemaIssue {
  return { path, message };
}

export function validateRequirementIndexInput(
  index: unknown,
): SchemaResult<RequirementIndex> {
  const issues: SchemaIssue[] = [];
  if (!index || typeof index !== "object") {
    return { ok: false, issues: [issue("requirementIndex", "requirementIndex is required")] };
  }

  const r = index as Partial<RequirementIndex>;
  if (!isNonEmptyString(r.id)) issues.push(issue("requirementIndex.id", "id is required"));
  if (!isNonEmptyString(r.structureId)) {
    issues.push(issue("requirementIndex.structureId", "structureId is required"));
  }
  if (!isNonEmptyString(r.workspaceId)) {
    issues.push(issue("requirementIndex.workspaceId", "workspaceId is required"));
  }
  if (!Array.isArray(r.entries) || r.entries.length < 1) {
    issues.push(issue("requirementIndex.entries", "entries must be a non-empty array"));
  }
  if (typeof r.entryCount !== "number" || r.entryCount < 1) {
    issues.push(issue("requirementIndex.entryCount", "entryCount must be >= 1"));
  }
  if (r.status !== "ready" && r.status !== "indexed") {
    issues.push(issue("requirementIndex.status", "status must be ready|indexed"));
  }
  if (r.readOnly !== true) {
    issues.push(issue("requirementIndex.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: index as RequirementIndex };
}

export function validateTenderAnalysis(analysis: unknown): SchemaResult<TenderAnalysis> {
  const issues: SchemaIssue[] = [];
  if (!analysis || typeof analysis !== "object") {
    return { ok: false, issues: [issue("analysis", "analysis is required")] };
  }

  const a = analysis as Partial<TenderAnalysis>;
  if (!isNonEmptyString(a.id)) issues.push(issue("analysis.id", "id is required"));
  if (!isNonEmptyString(a.requirementIndexId)) {
    issues.push(issue("analysis.requirementIndexId", "requirementIndexId is required"));
  }
  if (!isNonEmptyString(a.workspaceId)) {
    issues.push(issue("analysis.workspaceId", "workspaceId is required"));
  }
  if (!Array.isArray(a.signals)) issues.push(issue("analysis.signals", "signals must be an array"));
  if (!Array.isArray(a.risks)) issues.push(issue("analysis.risks", "risks must be an array"));
  if (typeof a.mustCoverage !== "number" || a.mustCoverage < 0 || a.mustCoverage > 1) {
    issues.push(issue("analysis.mustCoverage", "mustCoverage must be between 0 and 1"));
  }
  if (typeof a.complexityScore !== "number" || a.complexityScore < 0 || a.complexityScore > 100) {
    issues.push(issue("analysis.complexityScore", "complexityScore must be 0..100"));
  }
  if (a.readOnly !== true) issues.push(issue("analysis.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: analysis as TenderAnalysis };
}

export function validateOpportunityProfile(
  profile: unknown,
): SchemaResult<OpportunityProfile> {
  const issues: SchemaIssue[] = [];
  if (!profile || typeof profile !== "object") {
    return { ok: false, issues: [issue("opportunity", "opportunity profile is required")] };
  }

  const p = profile as Partial<OpportunityProfile>;
  if (!isNonEmptyString(p.id)) issues.push(issue("opportunity.id", "id is required"));
  if (!isNonEmptyString(p.analysisId)) {
    issues.push(issue("opportunity.analysisId", "analysisId is required"));
  }
  if (!isNonEmptyString(p.requirementIndexId)) {
    issues.push(issue("opportunity.requirementIndexId", "requirementIndexId is required"));
  }
  if (!isNonEmptyString(p.workspaceId)) {
    issues.push(issue("opportunity.workspaceId", "workspaceId is required"));
  }
  if (
    typeof p.tier !== "string" ||
    !(OPPORTUNITY_TIERS as readonly string[]).includes(p.tier)
  ) {
    issues.push(issue("opportunity.tier", `tier must be one of: ${OPPORTUNITY_TIERS.join(", ")}`));
  }
  if (typeof p.fitScore !== "number" || p.fitScore < 0 || p.fitScore > 100) {
    issues.push(issue("opportunity.fitScore", "fitScore must be 0..100"));
  }
  if (
    typeof p.fitBand !== "string" ||
    !(FIT_SCORE_BANDS as readonly string[]).includes(p.fitBand)
  ) {
    issues.push(
      issue("opportunity.fitBand", `fitBand must be one of: ${FIT_SCORE_BANDS.join(", ")}`),
    );
  }
  if (typeof p.winProbability !== "number" || p.winProbability < 0 || p.winProbability > 1) {
    issues.push(issue("opportunity.winProbability", "winProbability must be between 0 and 1"));
  }
  if (!Array.isArray(p.strengths)) {
    issues.push(issue("opportunity.strengths", "strengths must be an array"));
  }
  if (!Array.isArray(p.gaps)) issues.push(issue("opportunity.gaps", "gaps must be an array"));
  if (!Array.isArray(p.recommendedActions)) {
    issues.push(issue("opportunity.recommendedActions", "recommendedActions must be an array"));
  }
  if (p.readOnly !== true) issues.push(issue("opportunity.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: profile as OpportunityProfile };
}

export function assertValidRequirementIndex(index: RequirementIndex): void {
  const result = validateRequirementIndexInput(index);
  if (!result.ok) {
    throw new Error(
      `Invalid RequirementIndex: ${result.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
}

export function fitBandFromScore(score: number): FitScoreBand {
  if (score >= 85) return "excellent";
  if (score >= 70) return "strong";
  if (score >= 50) return "fair";
  return "weak";
}

export function tierFromFit(fitScore: number, winProbability: number): OpportunityTier {
  if (fitScore >= 85 && winProbability >= 0.7) return "strategic";
  if (fitScore >= 70) return "high";
  if (fitScore >= 50) return "medium";
  return "low";
}
