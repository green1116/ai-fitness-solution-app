/**
 * V80 Pilot P13 — Knowledge versioning, lineage, staleness, authority, promote/deprecate
 */

import { createHash } from "node:crypto";

import { appendIntakeAudit } from "./audit-trail.service";
import { DEFAULT_KNOWLEDGE_REFERENCES } from "./compliance.catalog";
import {
  KNOWLEDGE_AGING_DAYS,
  KNOWLEDGE_FRESH_DAYS,
  LIBRARY_FRESH_DAYS,
  LIBRARY_STALE_DAYS,
  ORG_KNOWLEDGE_GOVERNANCE_VERSION,
  type GovernedOrgKnowledgeRecommendation,
  type KnowledgeAuthorityLevel,
  type KnowledgeFreshnessBand,
  type KnowledgeGovernanceAction,
  type KnowledgeGovernanceAuditEntry,
  type KnowledgeGovernanceEntry,
  type KnowledgeGovernanceLookupMeta,
  type KnowledgeLifecycleStatus,
  type KnowledgeLineageEntry,
  type KnowledgeTrustBand,
  type OrgKnowledgeGovernanceState,
  type RecommendationTrustIndicator,
} from "./org-knowledge-governance.schema";
import {
  getOrgKnowledgeGovernance,
  saveOrgKnowledgeGovernance,
} from "./org-knowledge-governance.store";
import type {
  OrgKnowledgeLibrary,
  OrgKnowledgeLookupResult,
  OrgKnowledgePattern,
} from "./org-knowledge.schema";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(fromIso);
  const b = Date.parse(toIso);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (b - a) / 86_400_000);
}

export function computeFreshnessBand(
  lastSeenAt: string | undefined,
  nowIso: string,
  freshDays = KNOWLEDGE_FRESH_DAYS,
  agingDays = KNOWLEDGE_AGING_DAYS,
): KnowledgeFreshnessBand {
  if (!lastSeenAt) return "unknown";
  const days = daysBetween(lastSeenAt, nowIso);
  if (!Number.isFinite(days)) return "unknown";
  if (days <= freshDays) return "fresh";
  if (days <= agingDays) return "aging";
  return "stale";
}

export function freshnessScore(band: KnowledgeFreshnessBand): number {
  if (band === "fresh") return 1;
  if (band === "aging") return 0.6;
  if (band === "stale") return 0.25;
  return 0.5;
}

export function authorityScoreFor(
  authority: KnowledgeAuthorityLevel,
  frequency: number,
  status: KnowledgeLifecycleStatus,
): number {
  let base =
    authority === "canonical"
      ? 0.95
      : authority === "promoted"
        ? 0.85
        : authority === "reviewed"
          ? 0.65
          : Math.min(0.55, 0.25 + frequency * 0.06);

  if (status === "deprecated") base = round2(base * 0.35);
  if (status === "archived") base = 0;
  return round2(base);
}

export function trustScoreFor(
  authority: KnowledgeAuthorityLevel,
  frequency: number,
  status: KnowledgeLifecycleStatus,
  freshness: KnowledgeFreshnessBand,
): number {
  const a = authorityScoreFor(authority, frequency, status);
  const f = freshnessScore(freshness);
  return round2(a * 0.65 + f * 0.35);
}

export function trustBandFor(
  score: number,
  status: KnowledgeLifecycleStatus,
  fallback?: boolean,
): KnowledgeTrustBand {
  if (fallback) return "fallback";
  if (status === "deprecated" || status === "archived") return "low";
  if (score >= 0.75) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

function lineageId(action: string, patternId: string, at: string): string {
  return createHash("sha1")
    .update(`${action}:${patternId}:${at}`)
    .digest("hex")
    .slice(0, 12);
}

function pushLineage(
  entry: KnowledgeGovernanceEntry,
  line: Omit<KnowledgeLineageEntry, "id">,
): void {
  entry.lineage = [
    { id: lineageId(line.action, entry.patternId, line.at), ...line },
    ...entry.lineage,
  ].slice(0, 24);
}

function pushAudit(
  state: OrgKnowledgeGovernanceState,
  audit: Omit<KnowledgeGovernanceAuditEntry, "id">,
): void {
  state.audit = [
    {
      id: createHash("sha1")
        .update(`${audit.action}:${audit.patternId ?? ""}:${audit.at}:${audit.message}`)
        .digest("hex")
        .slice(0, 14),
      ...audit,
    },
    ...state.audit,
  ].slice(0, 200);
}

function emptyState(organizationId: string, nowIso: string): OrgKnowledgeGovernanceState {
  return {
    version: ORG_KNOWLEDGE_GOVERNANCE_VERSION,
    organizationId,
    libraryRevision: 0,
    libraryContentHash: "",
    libraryFreshness: "unknown",
    entries: {},
    audit: [],
    updatedAt: nowIso,
  };
}

function scoreEntry(
  entry: KnowledgeGovernanceEntry,
  pattern: OrgKnowledgePattern | undefined,
  nowIso: string,
): void {
  const freshness = computeFreshnessBand(pattern?.lastSeenAt, nowIso);
  entry.freshness = freshness;
  entry.freshnessScore = freshnessScore(freshness);
  entry.authorityScore = authorityScoreFor(
    entry.authority,
    pattern?.frequency ?? 1,
    entry.status,
  );
  entry.trustScore = trustScoreFor(
    entry.authority,
    pattern?.frequency ?? 1,
    entry.status,
    freshness,
  );
  entry.trustBand = trustBandFor(entry.trustScore, entry.status);
  entry.updatedAt = nowIso;
}

/** Sync governance after a library build/rebuild — preserves overrides & lifecycle. */
export function syncOrgKnowledgeGovernance(input: {
  library: OrgKnowledgeLibrary;
  actorId?: string;
  nowIso?: string;
}): OrgKnowledgeGovernanceState {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const prev = getOrgKnowledgeGovernance(input.library.organizationId);
  const state = prev
    ? { ...prev, entries: { ...prev.entries }, audit: [...prev.audit] }
    : emptyState(input.library.organizationId, nowIso);

  const parentHash = state.libraryContentHash || undefined;
  const revision = state.libraryRevision + 1;

  state.parentContentHash = parentHash;
  state.libraryRevision = revision;
  state.libraryContentHash = input.library.contentHash;
  state.libraryFreshness = computeFreshnessBand(
    input.library.builtAt,
    nowIso,
    LIBRARY_FRESH_DAYS,
    LIBRARY_STALE_DAYS,
  );
  state.updatedAt = nowIso;

  const seen = new Set<string>();
  for (const pattern of input.library.patterns) {
    seen.add(pattern.id);
    const existing = state.entries[pattern.id];
    if (!existing) {
      const entry: KnowledgeGovernanceEntry = {
        patternId: pattern.id,
        entryVersion: 1,
        status: "active",
        authority: "learned",
        authorityScore: 0,
        freshness: "unknown",
        freshnessScore: 0.5,
        trustScore: 0,
        trustBand: "medium",
        lineage: [],
        updatedAt: nowIso,
      };
      pushLineage(entry, {
        at: nowIso,
        actorId: input.actorId ?? "system",
        action: "learned",
        toStatus: "active",
        toAuthority: "learned",
        note: "从完成会话学习",
        libraryRevision: revision,
        libraryContentHash: input.library.contentHash,
      });
      scoreEntry(entry, pattern, nowIso);
      state.entries[pattern.id] = entry;
    } else {
      const entry = { ...existing, lineage: [...existing.lineage] };
      pushLineage(entry, {
        at: nowIso,
        actorId: input.actorId ?? "system",
        action: "rebuild_sync",
        fromStatus: entry.status,
        toStatus: entry.status,
        fromAuthority: entry.authority,
        toAuthority: entry.authority,
        note: "重建同步（保留治理状态）",
        libraryRevision: revision,
        libraryContentHash: input.library.contentHash,
      });
      entry.entryVersion += 1;
      scoreEntry(entry, pattern, nowIso);
      state.entries[pattern.id] = entry;
    }
  }

  // Patterns removed from rebuild stay in governance as archived-orphan markers only if previously active
  for (const [patternId, entry] of Object.entries(state.entries)) {
    if (seen.has(patternId)) continue;
    if (entry.status === "archived") continue;
    const next = { ...entry, lineage: [...entry.lineage] };
    if (next.status === "active") {
      next.status = "deprecated";
      next.deprecatedAt = nowIso;
      next.deprecatedBy = input.actorId ?? "system";
      next.deprecationReason = "重建后未再出现（自动降级）";
      pushLineage(next, {
        at: nowIso,
        actorId: input.actorId ?? "system",
        action: "deprecate",
        fromStatus: "active",
        toStatus: "deprecated",
        note: "重建后源模式消失",
        libraryRevision: revision,
        libraryContentHash: input.library.contentHash,
      });
      next.entryVersion += 1;
    }
    scoreEntry(next, undefined, nowIso);
    state.entries[patternId] = next;
  }

  pushAudit(state, {
    at: nowIso,
    actorId: input.actorId ?? "system",
    action: "rebuild_sync",
    message: `同步治理库 revision=${revision} patterns=${input.library.patterns.length}`,
    meta: {
      libraryContentHash: input.library.contentHash,
      parentContentHash: parentHash,
      libraryFreshness: state.libraryFreshness,
    },
  });

  return saveOrgKnowledgeGovernance(state);
}

function requireState(organizationId: string): OrgKnowledgeGovernanceState {
  const state = getOrgKnowledgeGovernance(organizationId);
  if (!state) {
    throw new Error("GOVERNANCE_NOT_INITIALIZED");
  }
  return {
    ...state,
    entries: { ...state.entries },
    audit: [...state.audit],
  };
}

function mutateEntry(input: {
  organizationId: string;
  patternId: string;
  actorId: string;
  action: KnowledgeGovernanceAction;
  sessionId?: string;
  note?: string;
  nowIso?: string;
  apply: (entry: KnowledgeGovernanceEntry) => void;
}): OrgKnowledgeGovernanceState {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const state = requireState(input.organizationId);
  const prev = state.entries[input.patternId];
  if (!prev) throw new Error("PATTERN_GOVERNANCE_NOT_FOUND");

  const entry: KnowledgeGovernanceEntry = {
    ...prev,
    lineage: [...prev.lineage],
  };
  const fromStatus = entry.status;
  const fromAuthority = entry.authority;
  input.apply(entry);
  entry.entryVersion += 1;
  entry.updatedAt = nowIso;

  // Re-score with last known freshness (pattern may still exist in library)
  entry.authorityScore = authorityScoreFor(entry.authority, 2, entry.status);
  entry.trustScore = trustScoreFor(
    entry.authority,
    2,
    entry.status,
    entry.freshness,
  );
  entry.trustBand = trustBandFor(entry.trustScore, entry.status);

  pushLineage(entry, {
    at: nowIso,
    actorId: input.actorId,
    action: input.action,
    fromStatus,
    toStatus: entry.status,
    fromAuthority,
    toAuthority: entry.authority,
    note: input.note,
    libraryRevision: state.libraryRevision,
    libraryContentHash: state.libraryContentHash,
  });

  state.entries[input.patternId] = entry;
  state.libraryRevision += 1;
  state.updatedAt = nowIso;
  pushAudit(state, {
    at: nowIso,
    actorId: input.actorId,
    action: input.action,
    patternId: input.patternId,
    message: input.note || `${input.action} ${input.patternId}`,
    meta: {
      fromStatus,
      toStatus: entry.status,
      fromAuthority,
      toAuthority: entry.authority,
      entryVersion: entry.entryVersion,
    },
  });

  const saved = saveOrgKnowledgeGovernance(state);

  if (input.sessionId) {
    appendIntakeAudit({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.actorId,
      step: "org_knowledge_gov",
      message: `知识治理 ${input.action}: ${input.patternId}`,
      meta: {
        action: input.action,
        patternId: input.patternId,
        entryVersion: entry.entryVersion,
        libraryRevision: saved.libraryRevision,
        trustScore: entry.trustScore,
      },
    });
  }

  return saved;
}

export function promoteOrgKnowledgePattern(input: {
  organizationId: string;
  patternId: string;
  actorId: string;
  sessionId?: string;
  note?: string;
  canonical?: boolean;
  nowIso?: string;
}): OrgKnowledgeGovernanceState {
  return mutateEntry({
    ...input,
    action: "promote",
    note: input.note ?? (input.canonical ? "提升为 canonical" : "人工晋升"),
    apply: (entry) => {
      if (entry.status === "archived") {
        throw new Error("CANNOT_PROMOTE_ARCHIVED");
      }
      entry.status = "active";
      entry.authority = input.canonical ? "canonical" : "promoted";
      entry.promotedAt = input.nowIso ?? new Date().toISOString();
      entry.promotedBy = input.actorId;
      entry.deprecatedAt = undefined;
      entry.deprecatedBy = undefined;
      entry.deprecationReason = undefined;
    },
  });
}

export function demoteOrgKnowledgePattern(input: {
  organizationId: string;
  patternId: string;
  actorId: string;
  sessionId?: string;
  note?: string;
  nowIso?: string;
}): OrgKnowledgeGovernanceState {
  return mutateEntry({
    ...input,
    action: "demote",
    note: input.note ?? "降级为 reviewed",
    apply: (entry) => {
      if (entry.status !== "active") throw new Error("CANNOT_DEMOTE_INACTIVE");
      entry.authority = "reviewed";
    },
  });
}

export function deprecateOrgKnowledgePattern(input: {
  organizationId: string;
  patternId: string;
  actorId: string;
  reason: string;
  sessionId?: string;
  nowIso?: string;
}): OrgKnowledgeGovernanceState {
  return mutateEntry({
    ...input,
    action: "deprecate",
    note: input.reason,
    apply: (entry) => {
      if (entry.status === "archived") throw new Error("ALREADY_ARCHIVED");
      entry.status = "deprecated";
      entry.deprecatedAt = input.nowIso ?? new Date().toISOString();
      entry.deprecatedBy = input.actorId;
      entry.deprecationReason = input.reason;
    },
  });
}

export function archiveOrgKnowledgePattern(input: {
  organizationId: string;
  patternId: string;
  actorId: string;
  sessionId?: string;
  note?: string;
  nowIso?: string;
}): OrgKnowledgeGovernanceState {
  return mutateEntry({
    ...input,
    action: "archive",
    note: input.note ?? "归档",
    apply: (entry) => {
      entry.status = "archived";
      entry.archivedAt = input.nowIso ?? new Date().toISOString();
      entry.archivedBy = input.actorId;
    },
  });
}

export function restoreOrgKnowledgePattern(input: {
  organizationId: string;
  patternId: string;
  actorId: string;
  sessionId?: string;
  note?: string;
  nowIso?: string;
}): OrgKnowledgeGovernanceState {
  return mutateEntry({
    ...input,
    action: "restore",
    note: input.note ?? "恢复为 active / reviewed",
    apply: (entry) => {
      entry.status = "active";
      entry.authority =
        entry.authority === "learned" ? "reviewed" : entry.authority;
      entry.deprecatedAt = undefined;
      entry.deprecatedBy = undefined;
      entry.deprecationReason = undefined;
      entry.archivedAt = undefined;
      entry.archivedBy = undefined;
    },
  });
}

export function overrideOrgKnowledgeSuggestion(input: {
  organizationId: string;
  patternId: string;
  actorId: string;
  suggestion: string;
  sessionId?: string;
  notes?: string;
  nowIso?: string;
}): OrgKnowledgeGovernanceState {
  return mutateEntry({
    ...input,
    action: "override",
    note: input.notes ?? "人工覆盖建议文案",
    apply: (entry) => {
      if (entry.status === "archived") throw new Error("CANNOT_OVERRIDE_ARCHIVED");
      entry.overrideSuggestion = input.suggestion.trim();
      if (entry.authority === "learned") entry.authority = "reviewed";
      if (input.notes) entry.notes = input.notes;
    },
  });
}

function trustLabels(entry: KnowledgeGovernanceEntry): string[] {
  const labels: string[] = [];
  if (entry.authority === "promoted" || entry.authority === "canonical") {
    labels.push(entry.authority === "canonical" ? "权威" : "已晋升");
  } else if (entry.authority === "reviewed") {
    labels.push("已审阅");
  } else {
    labels.push("学习中");
  }
  if (entry.freshness === "stale") labels.push("过期");
  else if (entry.freshness === "aging") labels.push("老化");
  else if (entry.freshness === "fresh") labels.push("新鲜");
  if (entry.status === "deprecated") labels.push("已弃用");
  if (entry.status === "archived") labels.push("已归档");
  if (entry.overrideSuggestion) labels.push("人工覆盖");
  return labels;
}

function buildTrust(
  entry: KnowledgeGovernanceEntry,
  extra?: Partial<RecommendationTrustIndicator>,
): RecommendationTrustIndicator {
  return {
    band: entry.trustBand,
    score: entry.trustScore,
    authority: entry.authority,
    freshness: entry.freshness,
    status: entry.status,
    labels: trustLabels(entry),
    ...extra,
  };
}

function fallbackRecommendations(
  _organizationId: string,
  existing: GovernedOrgKnowledgeRecommendation[],
): GovernedOrgKnowledgeRecommendation[] {
  if (existing.some((r) => r.trust.band === "high" || r.trust.band === "medium")) {
    return [];
  }
  return DEFAULT_KNOWLEDGE_REFERENCES.filter((k) => k.mandatoryHint).slice(0, 3).map(
    (ref, i) => ({
      id: `okr_fallback_${ref.id}`,
      patternId: ref.id,
      kind: "standard",
      title: ref.title,
      reason: "组织知识过期或冲突，回退至内置强制标准参考",
      suggestion: `建议核对：${ref.code ?? ref.title} — ${ref.summary}`,
      confidence: 0.4,
      relatedFieldPath: "standards",
      trust: {
        band: "fallback",
        score: 0.4,
        authority: "reviewed",
        freshness: "unknown",
        status: "active",
        labels: ["安全回退", "内置知识"],
        fallback: true,
      },
    }),
  );
}

/**
 * Apply governance filters, trust indicators, conflict suppression, and safe fallback.
 */
export function applyGovernanceToLookup(
  lookup: OrgKnowledgeLookupResult,
  library: OrgKnowledgeLibrary,
  nowIso?: string,
): OrgKnowledgeLookupResult & {
  recommendations: GovernedOrgKnowledgeRecommendation[];
  governance: KnowledgeGovernanceLookupMeta;
} {
  const now = nowIso ?? new Date().toISOString();
  let gov = getOrgKnowledgeGovernance(library.organizationId);
  if (!gov) {
    gov = syncOrgKnowledgeGovernance({ library, actorId: "system", nowIso: now });
  }

  // Refresh library freshness relative to now
  const libraryFreshness = computeFreshnessBand(
    library.builtAt,
    now,
    LIBRARY_FRESH_DAYS,
    LIBRARY_STALE_DAYS,
  );

  const patternById = new Map(library.patterns.map((p) => [p.id, p]));
  const governed: GovernedOrgKnowledgeRecommendation[] = [];
  let suppressedCount = 0;
  let deprecatedVisible = 0;

  for (const rec of lookup.recommendations) {
    const entry = gov.entries[rec.patternId];
    if (!entry || entry.status === "archived") {
      suppressedCount += 1;
      continue;
    }

    // Re-score freshness against pattern lastSeen
    const pattern = patternById.get(rec.patternId);
    const scored: KnowledgeGovernanceEntry = { ...entry, lineage: entry.lineage };
    scoreEntry(scored, pattern, now);

    if (scored.status === "deprecated") {
      // Only surface deprecated when trust still meaningful as warning
      deprecatedVisible += 1;
    }

    const suggestion = scored.overrideSuggestion || rec.suggestion;
    // Blend confidence with trust
    const confidence = round2(
      Math.min(0.98, rec.confidence * 0.55 + scored.trustScore * 0.45),
    );

    governed.push({
      ...rec,
      suggestion,
      confidence,
      trust: buildTrust(scored),
    });
  }

  // Conflict: same kind + relatedFieldPath → keep highest trust, suppress others
  const bestByKey = new Map<string, GovernedOrgKnowledgeRecommendation>();
  for (const rec of governed) {
    const key = `${rec.kind}::${rec.relatedFieldPath ?? ""}`;
    const prev = bestByKey.get(key);
    if (!prev) {
      bestByKey.set(key, rec);
      continue;
    }
    const better =
      rec.trust.score > prev.trust.score ||
      (rec.trust.score === prev.trust.score && rec.confidence > prev.confidence);
    if (better) {
      bestByKey.set(key, {
        ...rec,
        trust: { ...rec.trust, conflictOf: prev.patternId },
      });
      suppressedCount += 1;
    } else {
      suppressedCount += 1;
    }
  }

  let resolved = [...bestByKey.values()].sort(
    (a, b) =>
      b.trust.score - a.trust.score ||
      b.confidence - a.confidence ||
      a.title.localeCompare(b.title),
  );

  // When library is aging/stale, drop low-authority stale learned patterns
  if (libraryFreshness === "stale" || libraryFreshness === "aging") {
    const filtered = resolved.filter((r) => {
      const drop =
        r.trust.authority === "learned" && r.trust.freshness === "stale";
      if (drop) suppressedCount += 1;
      return !drop;
    });
    resolved = filtered;
  }

  // Prefer active; deprecated only as last resort (low trust)
  const activeOnly = resolved.filter((r) => r.trust.status === "active");
  if (activeOnly.length > 0) {
    suppressedCount += resolved.length - activeOnly.length;
    resolved = activeOnly;
  } else {
    resolved = resolved.map((r) => ({
      ...r,
      trust: {
        ...r.trust,
        band: "low" as const,
        labels: [...r.trust.labels, "谨慎使用"],
      },
    }));
  }

  const fb = fallbackRecommendations(library.organizationId, resolved);
  const usedFallback = fb.length > 0;
  if (usedFallback) {
    resolved = [...resolved, ...fb];
  }

  const limit = lookup.recommendations.length || 12;
  const trimmed = resolved.slice(0, Math.max(limit, usedFallback ? limit + fb.length : limit));

  return {
    ...lookup,
    recommendations: trimmed,
    libraryBuiltAt: library.builtAt,
    libraryHash: library.contentHash,
    governance: {
      libraryRevision: gov.libraryRevision,
      libraryFreshness,
      libraryContentHash: gov.libraryContentHash,
      usedFallback,
      suppressedCount,
      activeCount: trimmed.filter((r) => !r.trust.fallback).length,
      deprecatedVisible,
    },
  } as OrgKnowledgeLookupResult & {
    recommendations: GovernedOrgKnowledgeRecommendation[];
    governance: KnowledgeGovernanceLookupMeta;
  };
}

export function getOrgKnowledgeGovernanceSnapshot(
  organizationId: string,
): OrgKnowledgeGovernanceState | null {
  return getOrgKnowledgeGovernance(organizationId);
}

export function listGovernedPatterns(
  library: OrgKnowledgeLibrary,
): Array<OrgKnowledgePattern & { governance: KnowledgeGovernanceEntry | null }> {
  const gov = getOrgKnowledgeGovernance(library.organizationId);
  return library.patterns.map((p) => ({
    ...p,
    governance: gov?.entries[p.id] ?? null,
  }));
}
