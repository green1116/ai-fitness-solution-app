/**
 * E01-P4 — AI Bid Strategy schema (pure TS validation)
 */

import type { OpportunityProfile } from "../intelligence/intelligence.types";
import type {
  BidPosture,
  BidStrategy,
  PricingStance,
  ProposalEmphasis,
  StrategyLifecycleStage,
  StrategyStatus,
} from "./strategy.types";

export const STRATEGY_LIFECYCLE_STAGES: readonly StrategyLifecycleStage[] = [
  "opportunity",
  "strategy",
] as const;

export const STRATEGY_STATUSES: readonly StrategyStatus[] = [
  "pending",
  "drafted",
  "ready",
  "failed",
] as const;

export const BID_POSTURES: readonly BidPosture[] = [
  "pursue",
  "selective",
  "hold",
  "pass",
] as const;

export const PRICING_STANCES: readonly PricingStance[] = [
  "aggressive",
  "balanced",
  "premium",
  "conservative",
] as const;

export const PROPOSAL_EMPHASES: readonly ProposalEmphasis[] = [
  "compliance",
  "equipment",
  "commercial",
  "delivery",
  "differentiation",
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

export function validateOpportunityProfileInput(
  opportunity: unknown,
): SchemaResult<OpportunityProfile> {
  const issues: SchemaIssue[] = [];
  if (!opportunity || typeof opportunity !== "object") {
    return { ok: false, issues: [issue("opportunity", "opportunity is required")] };
  }

  const o = opportunity as Partial<OpportunityProfile>;
  if (!isNonEmptyString(o.id)) issues.push(issue("opportunity.id", "id is required"));
  if (!isNonEmptyString(o.analysisId)) {
    issues.push(issue("opportunity.analysisId", "analysisId is required"));
  }
  if (!isNonEmptyString(o.requirementIndexId)) {
    issues.push(issue("opportunity.requirementIndexId", "requirementIndexId is required"));
  }
  if (!isNonEmptyString(o.workspaceId)) {
    issues.push(issue("opportunity.workspaceId", "workspaceId is required"));
  }
  if (o.status !== "ready" && o.status !== "profiled") {
    issues.push(issue("opportunity.status", "status must be ready|profiled"));
  }
  if (typeof o.fitScore !== "number" || o.fitScore < 0 || o.fitScore > 100) {
    issues.push(issue("opportunity.fitScore", "fitScore must be 0..100"));
  }
  if (typeof o.winProbability !== "number" || o.winProbability < 0 || o.winProbability > 1) {
    issues.push(issue("opportunity.winProbability", "winProbability must be 0..1"));
  }
  if (!Array.isArray(o.recommendedActions) || o.recommendedActions.length < 1) {
    issues.push(issue("opportunity.recommendedActions", "recommendedActions must be non-empty"));
  }
  if (o.readOnly !== true) {
    issues.push(issue("opportunity.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: opportunity as OpportunityProfile };
}

export function validateBidStrategy(strategy: unknown): SchemaResult<BidStrategy> {
  const issues: SchemaIssue[] = [];
  if (!strategy || typeof strategy !== "object") {
    return { ok: false, issues: [issue("strategy", "strategy is required")] };
  }

  const s = strategy as Partial<BidStrategy>;
  if (!isNonEmptyString(s.id)) issues.push(issue("strategy.id", "id is required"));
  if (!isNonEmptyString(s.opportunityId)) {
    issues.push(issue("strategy.opportunityId", "opportunityId is required"));
  }
  if (!isNonEmptyString(s.analysisId)) {
    issues.push(issue("strategy.analysisId", "analysisId is required"));
  }
  if (!isNonEmptyString(s.requirementIndexId)) {
    issues.push(issue("strategy.requirementIndexId", "requirementIndexId is required"));
  }
  if (!isNonEmptyString(s.workspaceId)) {
    issues.push(issue("strategy.workspaceId", "workspaceId is required"));
  }
  if (typeof s.posture !== "string" || !(BID_POSTURES as readonly string[]).includes(s.posture)) {
    issues.push(issue("strategy.posture", `posture must be one of: ${BID_POSTURES.join(", ")}`));
  }
  if (
    typeof s.pricingStance !== "string" ||
    !(PRICING_STANCES as readonly string[]).includes(s.pricingStance)
  ) {
    issues.push(
      issue("strategy.pricingStance", `pricingStance must be one of: ${PRICING_STANCES.join(", ")}`),
    );
  }
  if (!Array.isArray(s.emphasis) || s.emphasis.length < 1) {
    issues.push(issue("strategy.emphasis", "emphasis must be a non-empty array"));
  }
  if (!Array.isArray(s.workstreams) || s.workstreams.length < 1) {
    issues.push(issue("strategy.workstreams", "workstreams must be a non-empty array"));
  }
  if (!Array.isArray(s.riskBuffers)) {
    issues.push(issue("strategy.riskBuffers", "riskBuffers must be an array"));
  }
  if (typeof s.goNoGoScore !== "number" || s.goNoGoScore < 0 || s.goNoGoScore > 100) {
    issues.push(issue("strategy.goNoGoScore", "goNoGoScore must be 0..100"));
  }
  if (typeof s.confidence !== "number" || s.confidence < 0 || s.confidence > 1) {
    issues.push(issue("strategy.confidence", "confidence must be 0..1"));
  }
  if (!isNonEmptyString(s.summary)) {
    issues.push(issue("strategy.summary", "summary is required"));
  }
  if (s.readOnly !== true) issues.push(issue("strategy.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: strategy as BidStrategy };
}

export function assertValidOpportunityProfile(opportunity: OpportunityProfile): void {
  const result = validateOpportunityProfileInput(opportunity);
  if (!result.ok) {
    throw new Error(
      `Invalid OpportunityProfile: ${result.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
}

export function postureFromOpportunity(
  fitScore: number,
  winProbability: number,
  tier: OpportunityProfile["tier"],
): BidPosture {
  if (tier === "strategic" || (fitScore >= 75 && winProbability >= 0.65)) return "pursue";
  if (fitScore >= 55 && winProbability >= 0.45) return "selective";
  if (fitScore >= 40) return "hold";
  return "pass";
}

export function pricingStanceFromPosture(
  posture: BidPosture,
  tier: OpportunityProfile["tier"],
): PricingStance {
  if (posture === "pass") return "conservative";
  if (posture === "hold") return "conservative";
  if (tier === "strategic") return "premium";
  if (posture === "pursue") return "balanced";
  return "aggressive";
}
