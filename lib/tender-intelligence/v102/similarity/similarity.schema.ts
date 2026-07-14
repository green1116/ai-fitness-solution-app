/**
 * E02-P5 — Similar Tender Intelligence schema (pure TS validation)
 */

import type { KnowledgeContext } from "../retrieval/retrieval.types";
import type {
  SimilarTenderMatch,
  SimilarTenderProfile,
  SimilarTenderProfileStatus,
  SimilarityDimension,
  SimilarityKernelInput,
  SimilarityLifecycleStage,
  TenderFeatureFingerprint,
} from "./similarity.types";

export const SIMILARITY_LIFECYCLE_STAGES: readonly SimilarityLifecycleStage[] = [
  "context",
  "matches",
  "profile",
] as const;

export const SIMILAR_TENDER_PROFILE_STATUSES: readonly SimilarTenderProfileStatus[] = [
  "pending",
  "matched",
  "ready",
  "failed",
] as const;

export const SIMILARITY_DIMENSIONS: readonly SimilarityDimension[] = [
  "project_type",
  "equipment",
  "standard",
  "budget",
  "requirement",
  "deliverable",
  "location",
  "clause",
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

export function validateKnowledgeContextInput(
  context: unknown,
): SchemaResult<KnowledgeContext> {
  const issues: SchemaIssue[] = [];
  if (!context || typeof context !== "object") {
    return { ok: false, issues: [issue("context", "context is required")] };
  }

  const c = context as Partial<KnowledgeContext>;
  if (!isNonEmptyString(c.id)) issues.push(issue("context.id", "id is required"));
  if (!isNonEmptyString(c.title)) issues.push(issue("context.title", "title is required"));
  if (!Array.isArray(c.focusedNodes) || c.focusedNodes.length < 1) {
    issues.push(issue("context.focusedNodes", "focusedNodes must be non-empty"));
  }
  if (!Array.isArray(c.hits) || c.hits.length < 1) {
    issues.push(issue("context.hits", "hits must be non-empty"));
  }
  if (c.readOnly !== true) {
    issues.push(issue("context.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: context as KnowledgeContext };
}

export function validateTenderFeatureFingerprint(
  fingerprint: unknown,
): SchemaResult<TenderFeatureFingerprint> {
  const issues: SchemaIssue[] = [];
  if (!fingerprint || typeof fingerprint !== "object") {
    return { ok: false, issues: [issue("fingerprint", "fingerprint is required")] };
  }

  const f = fingerprint as Partial<TenderFeatureFingerprint>;
  if (!isNonEmptyString(f.id)) issues.push(issue("fingerprint.id", "id is required"));
  if (!isNonEmptyString(f.sourceContextId)) {
    issues.push(issue("fingerprint.sourceContextId", "sourceContextId is required"));
  }
  if (!Array.isArray(f.labels) || f.labels.length < 1) {
    issues.push(issue("fingerprint.labels", "labels must be non-empty"));
  }
  if (!Array.isArray(f.keywords) || f.keywords.length < 1) {
    issues.push(issue("fingerprint.keywords", "keywords must be non-empty"));
  }
  if (!Array.isArray(f.dimensions) || f.dimensions.length < 1) {
    issues.push(issue("fingerprint.dimensions", "dimensions must be non-empty"));
  }
  if (f.readOnly !== true) {
    issues.push(issue("fingerprint.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: fingerprint as TenderFeatureFingerprint };
}

export function validateSimilarTenderMatch(
  match: unknown,
): SchemaResult<SimilarTenderMatch> {
  const issues: SchemaIssue[] = [];
  if (!match || typeof match !== "object") {
    return { ok: false, issues: [issue("match", "match is required")] };
  }

  const m = match as Partial<SimilarTenderMatch>;
  if (!isNonEmptyString(m.id)) issues.push(issue("match.id", "id is required"));
  if (!isNonEmptyString(m.title)) issues.push(issue("match.title", "title is required"));
  if (typeof m.rank !== "number" || m.rank < 1) {
    issues.push(issue("match.rank", "rank must be >= 1"));
  }
  if (typeof m.overlapScore !== "number" || m.overlapScore < 0 || m.overlapScore > 1) {
    issues.push(issue("match.overlapScore", "overlapScore must be between 0 and 1"));
  }
  if (!Array.isArray(m.overlapDimensions) || m.overlapDimensions.length < 1) {
    issues.push(issue("match.overlapDimensions", "overlapDimensions must be non-empty"));
  }
  if (!Array.isArray(m.sharedSignals)) {
    issues.push(issue("match.sharedSignals", "sharedSignals must be an array"));
  }
  if (!Array.isArray(m.reuseHints)) {
    issues.push(issue("match.reuseHints", "reuseHints must be an array"));
  }
  if (m.readOnly !== true) {
    issues.push(issue("match.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: match as SimilarTenderMatch };
}

export function validateSimilarTenderProfile(
  profile: unknown,
): SchemaResult<SimilarTenderProfile> {
  const issues: SchemaIssue[] = [];
  if (!profile || typeof profile !== "object") {
    return { ok: false, issues: [issue("profile", "profile is required")] };
  }

  const p = profile as Partial<SimilarTenderProfile>;
  if (!isNonEmptyString(p.id)) issues.push(issue("profile.id", "id is required"));
  if (!isNonEmptyString(p.title)) issues.push(issue("profile.title", "title is required"));
  if (!isNonEmptyString(p.contextId)) {
    issues.push(issue("profile.contextId", "contextId is required"));
  }
  if (
    typeof p.status !== "string" ||
    !(SIMILAR_TENDER_PROFILE_STATUSES as readonly string[]).includes(p.status)
  ) {
    issues.push(
      issue(
        "profile.status",
        `status must be one of: ${SIMILAR_TENDER_PROFILE_STATUSES.join(", ")}`,
      ),
    );
  }
  if (!Array.isArray(p.matches) || p.matches.length < 1) {
    issues.push(issue("profile.matches", "matches must be non-empty"));
  }
  if (
    typeof p.matchCount === "number" &&
    Array.isArray(p.matches) &&
    p.matchCount !== p.matches.length
  ) {
    issues.push(issue("profile.matchCount", "matchCount must match matches.length"));
  }
  if (p.readOnly !== true) {
    issues.push(issue("profile.readOnly", "readOnly must be true"));
  }

  if (p.fingerprint) {
    const fp = validateTenderFeatureFingerprint(p.fingerprint);
    if (!fp.ok) {
      issues.push(
        ...fp.issues.map((it) => issue(`profile.fingerprint.${it.path}`, it.message)),
      );
    }
  } else {
    issues.push(issue("profile.fingerprint", "fingerprint is required"));
  }

  if (Array.isArray(p.matches)) {
    for (let i = 0; i < p.matches.length; i++) {
      const result = validateSimilarTenderMatch(p.matches[i]);
      if (!result.ok) {
        issues.push(
          ...result.issues.map((it) =>
            issue(`profile.matches[${i}].${it.path}`, it.message),
          ),
        );
      }
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: profile as SimilarTenderProfile };
}

export function validateSimilarityKernelInput(
  input: unknown,
): SchemaResult<SimilarityKernelInput> {
  const issues: SchemaIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, issues: [issue("input", "input is required")] };
  }

  const i = input as Partial<SimilarityKernelInput>;
  const ctx = validateKnowledgeContextInput(i.context);
  if (!ctx.ok) issues.push(...ctx.issues);

  if (i.limit !== undefined && (typeof i.limit !== "number" || i.limit < 1)) {
    issues.push(issue("input.limit", "limit must be >= 1"));
  }
  if (
    i.minOverlapScore !== undefined &&
    (typeof i.minOverlapScore !== "number" ||
      i.minOverlapScore < 0 ||
      i.minOverlapScore > 1)
  ) {
    issues.push(issue("input.minOverlapScore", "minOverlapScore must be between 0 and 1"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: input as SimilarityKernelInput };
}

export function assertValidSimilarTenderProfile(profile: SimilarTenderProfile): void {
  const result = validateSimilarTenderProfile(profile);
  if (!result.ok) {
    throw new Error(
      `Invalid SimilarTenderProfile: ${result.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
}
