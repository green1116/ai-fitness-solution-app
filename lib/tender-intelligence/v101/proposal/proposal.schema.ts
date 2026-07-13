/**
 * E01-P5 — AI Proposal Intelligence schema (pure TS validation)
 */

import type { RequirementIndex } from "../understanding/understanding.types";
import type { BidStrategy } from "../strategy/strategy.types";
import type {
  ProposalBlueprint,
  ProposalChapterKind,
  ProposalLifecycleStage,
  ProposalBlueprintStatus,
  RequirementCoverageStatus,
} from "./proposal.types";

export const PROPOSAL_LIFECYCLE_STAGES: readonly ProposalLifecycleStage[] = [
  "strategy",
  "blueprint",
] as const;

export const PROPOSAL_BLUEPRINT_STATUSES: readonly ProposalBlueprintStatus[] = [
  "pending",
  "drafted",
  "ready",
  "failed",
] as const;

export const PROPOSAL_CHAPTER_KINDS: readonly ProposalChapterKind[] = [
  "executive_summary",
  "understanding",
  "technical_solution",
  "equipment_plan",
  "commercial_offer",
  "delivery_plan",
  "compliance_matrix",
  "appendix",
] as const;

export const REQUIREMENT_COVERAGE_STATUSES: readonly RequirementCoverageStatus[] = [
  "covered",
  "partial",
  "gap",
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

export function validateBidStrategyInput(strategy: unknown): SchemaResult<BidStrategy> {
  const issues: SchemaIssue[] = [];
  if (!strategy || typeof strategy !== "object") {
    return { ok: false, issues: [issue("strategy", "strategy is required")] };
  }

  const s = strategy as Partial<BidStrategy>;
  if (!isNonEmptyString(s.id)) issues.push(issue("strategy.id", "id is required"));
  if (!isNonEmptyString(s.opportunityId)) {
    issues.push(issue("strategy.opportunityId", "opportunityId is required"));
  }
  if (!isNonEmptyString(s.requirementIndexId)) {
    issues.push(issue("strategy.requirementIndexId", "requirementIndexId is required"));
  }
  if (!isNonEmptyString(s.workspaceId)) {
    issues.push(issue("strategy.workspaceId", "workspaceId is required"));
  }
  if (s.status !== "ready" && s.status !== "drafted") {
    issues.push(issue("strategy.status", "status must be ready|drafted"));
  }
  if (!Array.isArray(s.emphasis) || s.emphasis.length < 1) {
    issues.push(issue("strategy.emphasis", "emphasis must be non-empty"));
  }
  if (s.readOnly !== true) issues.push(issue("strategy.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: strategy as BidStrategy };
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
  if (!isNonEmptyString(r.workspaceId)) {
    issues.push(issue("requirementIndex.workspaceId", "workspaceId is required"));
  }
  if (!Array.isArray(r.entries) || r.entries.length < 1) {
    issues.push(issue("requirementIndex.entries", "entries must be non-empty"));
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

export function validateProposalBlueprint(
  blueprint: unknown,
): SchemaResult<ProposalBlueprint> {
  const issues: SchemaIssue[] = [];
  if (!blueprint || typeof blueprint !== "object") {
    return { ok: false, issues: [issue("blueprint", "blueprint is required")] };
  }

  const b = blueprint as Partial<ProposalBlueprint>;
  if (!isNonEmptyString(b.id)) issues.push(issue("blueprint.id", "id is required"));
  if (!isNonEmptyString(b.strategyId)) {
    issues.push(issue("blueprint.strategyId", "strategyId is required"));
  }
  if (!isNonEmptyString(b.requirementIndexId)) {
    issues.push(issue("blueprint.requirementIndexId", "requirementIndexId is required"));
  }
  if (!isNonEmptyString(b.workspaceId)) {
    issues.push(issue("blueprint.workspaceId", "workspaceId is required"));
  }
  if (!isNonEmptyString(b.title)) issues.push(issue("blueprint.title", "title is required"));
  if (!Array.isArray(b.chapters) || b.chapters.length < 1) {
    issues.push(issue("blueprint.chapters", "chapters must be non-empty"));
  }
  if (!Array.isArray(b.coverage) || b.coverage.length < 1) {
    issues.push(issue("blueprint.coverage", "coverage must be non-empty"));
  }
  if (typeof b.chapterCount === "number" && Array.isArray(b.chapters)) {
    if (b.chapterCount !== b.chapters.length) {
      issues.push(issue("blueprint.chapterCount", "chapterCount must match chapters.length"));
    }
  }
  if (typeof b.coverageCount === "number" && Array.isArray(b.coverage)) {
    if (b.coverageCount !== b.coverage.length) {
      issues.push(issue("blueprint.coverageCount", "coverageCount must match coverage.length"));
    }
  }
  if (typeof b.coverageRatio !== "number" || b.coverageRatio < 0 || b.coverageRatio > 1) {
    issues.push(issue("blueprint.coverageRatio", "coverageRatio must be 0..1"));
  }
  if (!Array.isArray(b.narrativeArc) || b.narrativeArc.length < 1) {
    issues.push(issue("blueprint.narrativeArc", "narrativeArc must be non-empty"));
  }
  if (b.readOnly !== true) issues.push(issue("blueprint.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: blueprint as ProposalBlueprint };
}

export function assertValidStrategyAndRequirements(
  strategy: BidStrategy,
  requirementIndex: RequirementIndex,
): void {
  const strategyResult = validateBidStrategyInput(strategy);
  if (!strategyResult.ok) {
    throw new Error(
      `Invalid BidStrategy: ${strategyResult.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }

  const indexResult = validateRequirementIndexInput(requirementIndex);
  if (!indexResult.ok) {
    throw new Error(
      `Invalid RequirementIndex: ${indexResult.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }

  if (strategy.requirementIndexId !== requirementIndex.id) {
    throw new Error("BidStrategy.requirementIndexId must match RequirementIndex.id");
  }
  if (strategy.workspaceId !== requirementIndex.workspaceId) {
    throw new Error("BidStrategy.workspaceId must match RequirementIndex.workspaceId");
  }
}
