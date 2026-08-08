/**
 * V80 Pilot P14 — Deterministic knowledge recommendation engine
 * Reuses governed org knowledge (P12/P13); no new ML engine.
 */

import { createHash } from "node:crypto";

import { appendIntakeAudit } from "./audit-trail.service";
import {
  DEFAULT_RANK_WEIGHTS,
  KNOWLEDGE_RECOMMENDATION_VERSION,
  type KnowledgeRecommendationPack,
  type OrgRecommendationEffectiveness,
  type PatternEffectivenessStats,
  type RankedKnowledgeRecommendation,
  type RecommendationCategory,
  type RecommendationFeedbackEvent,
  type RecommendationRankWeights,
} from "./knowledge-recommendation.schema";
import {
  appendRecommendationFeedbackEvent,
  getOrgRecommendationEffectiveness,
  getRecommendationPack,
  listRecommendationFeedbackEvents,
  saveOrgRecommendationEffectiveness,
  saveRecommendationPack,
} from "./knowledge-recommendation.store";
import { getIntakeSession } from "./intake.store";
import { lookupOrgKnowledgeRecommendations } from "./org-knowledge.service";
import { getOrgKnowledgeLibrary } from "./org-knowledge.store";
import type { OrgKnowledgePattern } from "./org-knowledge.schema";
import { parseTenderRequirements } from "./requirements.validation";
import type { RequirementItem, TenderRequirements } from "./requirements.schema";
import { patchIntakeRequirements } from "./review.service";
import { buildContinuousImprovementReport } from "./continuous-improvement.service";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Deterministic tokenization for Chinese + Latin similarity */
export function tokenizeForSimilarity(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .replace(/[，,。；;：:、（）()【】\[\]"'「」]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const tokens = new Set<string>();
  const latin = normalized.match(/[a-z0-9./-]{2,}/g) ?? [];
  for (const w of latin) tokens.add(w);
  const compact = normalized.replace(/\s+/g, "");
  for (let i = 0; i < compact.length - 1; i++) {
    const a = compact[i]!;
    const b = compact[i + 1]!;
    if (/[\u4e00-\u9fff]/.test(a) || /[\u4e00-\u9fff]/.test(b)) {
      tokens.add(a + b);
    }
  }
  return tokens;
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : round3(inter / union);
}

function categoryForKind(
  kind: string,
  authority?: string,
): RecommendationCategory {
  if (authority === "promoted" || authority === "canonical") {
    if (kind === "standard" || kind === "compliance") return "best_practice";
  }
  if (kind === "requirement") return "requirement_template";
  if (kind === "clarification") return "clarification";
  if (kind === "compliance") return "compliance";
  if (kind === "equipment") return "equipment_spec";
  if (kind === "standard") return "best_practice";
  return "requirement_template";
}

function categoryBoostFor(
  category: RecommendationCategory,
  gaps: { missingBudget: boolean; missingStandards: boolean; sparseEquipment: boolean },
): number {
  if (category === "clarification" && gaps.missingBudget) return 1;
  if (category === "compliance" || category === "best_practice") {
    if (gaps.missingStandards) return 1;
    return 0.55;
  }
  if (category === "equipment_spec" && gaps.sparseEquipment) return 0.95;
  if (category === "requirement_template") return 0.7;
  if (category === "alternative") return 0.4;
  return 0.5;
}

function fieldPathForCategory(category: RecommendationCategory, fallback?: string): string {
  if (fallback) return fallback;
  if (category === "equipment_spec") return "equipment";
  if (category === "clarification") return "budget";
  if (category === "compliance" || category === "best_practice") return "standards";
  return "technicalRequirements";
}

function listKeyForField(
  fieldPath?: string,
): keyof Pick<
  TenderRequirements,
  | "technicalRequirements"
  | "functionalRequirements"
  | "equipment"
  | "standards"
  | "compliance"
  | "constraints"
> | null {
  if (
    fieldPath === "equipment" ||
    fieldPath === "standards" ||
    fieldPath === "compliance" ||
    fieldPath === "constraints" ||
    fieldPath === "technicalRequirements" ||
    fieldPath === "functionalRequirements"
  ) {
    return fieldPath;
  }
  return null;
}

function recId(sessionId: string, patternId: string, category: string): string {
  const h = createHash("sha1")
    .update(`${sessionId}:${patternId}:${category}`)
    .digest("hex")
    .slice(0, 12);
  return `krec_${h}`;
}

function hashPack(
  sessionId: string,
  items: RankedKnowledgeRecommendation[],
  libraryHash?: string,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: KNOWLEDGE_RECOMMENDATION_VERSION,
        sessionId,
        libraryHash,
        items: items.map((i) => ({
          id: i.id,
          patternId: i.patternId,
          rankScore: i.rankScore,
          status: i.status,
        })),
      }),
    )
    .digest("hex");
}

function summarize(items: RankedKnowledgeRecommendation[]) {
  const byCategory: Record<string, number> = {};
  let open = 0;
  let accepted = 0;
  let dismissed = 0;
  for (const i of items) {
    byCategory[i.category] = (byCategory[i.category] ?? 0) + 1;
    if (i.status === "open") open += 1;
    else if (i.status === "accepted") accepted += 1;
    else dismissed += 1;
  }
  return { total: items.length, open, accepted, dismissed, byCategory };
}

function emptyEffectiveness(organizationId: string): OrgRecommendationEffectiveness {
  return {
    organizationId,
    updatedAt: new Date().toISOString(),
    events: [],
    byPatternId: {},
    totals: { shown: 0, accepted: 0, dismissed: 0, acceptRate: 0 },
  };
}

function recomputeTotals(
  byPatternId: Record<string, PatternEffectivenessStats>,
): OrgRecommendationEffectiveness["totals"] {
  let shown = 0;
  let accepted = 0;
  let dismissed = 0;
  for (const s of Object.values(byPatternId)) {
    shown += s.shown;
    accepted += s.accepted;
    dismissed += s.dismissed;
  }
  return {
    shown,
    accepted,
    dismissed,
    acceptRate: shown === 0 ? 0 : round2(accepted / shown),
  };
}

function bumpShown(
  organizationId: string,
  patternIds: string[],
): OrgRecommendationEffectiveness {
  const prev =
    getOrgRecommendationEffectiveness(organizationId) ??
    emptyEffectiveness(organizationId);
  const byPatternId = { ...prev.byPatternId };
  for (const patternId of patternIds) {
    const cur = byPatternId[patternId] ?? {
      patternId,
      shown: 0,
      accepted: 0,
      dismissed: 0,
      acceptRate: 0,
    };
    const next = { ...cur, shown: cur.shown + 1 };
    next.acceptRate =
      next.shown === 0 ? 0 : round2(next.accepted / next.shown);
    byPatternId[patternId] = next;
  }
  return saveOrgRecommendationEffectiveness({
    ...prev,
    byPatternId,
    totals: recomputeTotals(byPatternId),
    updatedAt: new Date().toISOString(),
  });
}

function bumpFeedback(
  organizationId: string,
  patternId: string,
  action: "accepted" | "dismissed",
  event: RecommendationFeedbackEvent,
): OrgRecommendationEffectiveness {
  const prev =
    getOrgRecommendationEffectiveness(organizationId) ??
    emptyEffectiveness(organizationId);
  const byPatternId = { ...prev.byPatternId };
  const cur = byPatternId[patternId] ?? {
    patternId,
    shown: 0,
    accepted: 0,
    dismissed: 0,
    acceptRate: 0,
  };
  const next = {
    ...cur,
    accepted: cur.accepted + (action === "accepted" ? 1 : 0),
    dismissed: cur.dismissed + (action === "dismissed" ? 1 : 0),
  };
  next.acceptRate = next.shown === 0 ? 0 : round2(next.accepted / next.shown);
  byPatternId[patternId] = next;
  const events = [event, ...prev.events].slice(0, 200);
  return saveOrgRecommendationEffectiveness({
    organizationId,
    byPatternId,
    events,
    totals: recomputeTotals(byPatternId),
    updatedAt: new Date().toISOString(),
  });
}

export function computeRankScore(input: {
  similarity: number;
  trustScore: number;
  frequencyNorm: number;
  categoryBoost: number;
  effectivenessBoost: number;
  weights?: RecommendationRankWeights;
}): number {
  const w = input.weights ?? DEFAULT_RANK_WEIGHTS;
  return round3(
    input.similarity * w.similarity +
      input.trustScore * w.trust +
      input.frequencyNorm * w.frequency +
      input.categoryBoost * w.category +
      input.effectivenessBoost * w.effectiveness,
  );
}

function contextBlob(req: TenderRequirements): string {
  return [
    req.projectName,
    req.organization,
    req.industry,
    req.location,
    req.scope,
    ...req.objectives,
    ...req.technicalRequirements.map((i) => i.text),
    ...req.functionalRequirements.map((i) => i.text),
    ...req.equipment.map((i) => i.text),
    ...req.standards.map((i) => i.text),
    ...req.compliance.map((i) => i.text),
    req.budget.notes,
  ].join("\n");
}

function buildAlternatives(
  pattern: OrgKnowledgePattern | undefined,
  libraryPatterns: OrgKnowledgePattern[],
  limit = 2,
): string[] {
  if (!pattern) return [];
  return libraryPatterns
    .filter((p) => p.kind === pattern.kind && p.id !== pattern.id)
    .sort((a, b) => b.frequency - a.frequency || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map((p) => p.suggestion || p.title);
}

/** Generate / refresh ranked recommendation pack for an intake session. */
export function generateKnowledgeRecommendations(input: {
  organizationId: string;
  sessionId: string;
  actorId?: string;
  requirements?: TenderRequirements | Partial<TenderRequirements>;
  limit?: number;
  weights?: RecommendationRankWeights;
}): KnowledgeRecommendationPack {
  const session = getIntakeSession(input.sessionId);
  if (!session || session.organizationId !== input.organizationId) {
    throw new Error("SESSION_NOT_FOUND");
  }

  const req = parseTenderRequirements(
    input.requirements ?? session.requirements ?? session.extractedRequirements ?? {},
  );
  const blob = contextBlob(req);
  const blobTokens = tokenizeForSimilarity(blob);

  const missingBudget =
    req.budget.min === undefined &&
    req.budget.max === undefined &&
    !req.budget.notes.trim();
  const missingStandards =
    (/健身|gym|器械|跑步机/.test(blob) || req.industry === "fitness") &&
    req.standards.every((s) => !s.text.trim());
  const sparseEquipment = req.equipment.filter((e) => e.text.trim()).length === 0;
  const gaps = { missingBudget, missingStandards, sparseEquipment };

  const lookup = lookupOrgKnowledgeRecommendations({
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    requirements: req,
    limit: 24,
  });

  const library = getOrgKnowledgeLibrary(input.organizationId);
  const libraryPatterns = library?.patterns ?? [];
  const patternById = new Map(libraryPatterns.map((p) => [p.id, p]));
  const maxFreq = Math.max(1, ...libraryPatterns.map((p) => p.frequency));

  const eff =
    getOrgRecommendationEffectiveness(input.organizationId) ??
    emptyEffectiveness(input.organizationId);

  // P15 — refresh confidence adjustments from outcomes before ranking
  const improvement = buildContinuousImprovementReport({
    organizationId: input.organizationId,
    persistAdjustments: true,
  });
  const confidenceAdjustments = improvement.confidenceAdjustments;

  const prevPack = getRecommendationPack(input.sessionId);
  const prevByKey = new Map(
    (prevPack?.items ?? []).map((i) => [`${i.patternId}::${i.category}`, i] as const),
  );

  const weights = input.weights ?? DEFAULT_RANK_WEIGHTS;
  const items: RankedKnowledgeRecommendation[] = [];

  for (const base of lookup.recommendations) {
    const pattern = patternById.get(base.patternId);
    const category = categoryForKind(base.kind, base.trust?.authority);
    const prev = prevByKey.get(`${base.patternId}::${category}`);
    const ranked = mapBaseToRanked(
      base,
      pattern,
      blobTokens,
      gaps,
      maxFreq,
      eff,
      weights,
      libraryPatterns,
      confidenceAdjustments,
    );

    if (prev?.status === "dismissed") {
      items.push({
        ...ranked,
        status: "dismissed",
        dismissedAt: prev.dismissedAt,
        dismissReason: prev.dismissReason,
        dismissedBy: prev.dismissedBy,
        rankScore: 0,
      });
      continue;
    }
    if (prev?.status === "accepted") {
      items.push({
        ...ranked,
        status: "accepted",
        acceptedAt: prev.acceptedAt,
        acceptedBy: prev.acceptedBy,
      });
      continue;
    }

    items.push(ranked);
  }

  // Explicit alternative rows from top equipment/requirement siblings
  const openPrimary = items.filter((i) => i.status === "open").slice(0, 6);
  for (const primary of openPrimary) {
    if (primary.alternatives.length === 0) continue;
    if (primary.category === "alternative") continue;
    const prevAlt = prevByKey.get(`${primary.patternId}::alternative`);
    if (prevAlt?.status === "dismissed") {
      items.push({
        ...prevAlt,
        primary: primary.alternatives[0]!,
        alternatives: primary.alternatives.slice(1),
        status: "dismissed",
        rankScore: 0,
      });
      continue;
    }
    if (prevAlt?.status === "accepted") {
      items.push({
        ...prevAlt,
        status: "accepted",
      });
      continue;
    }
    const altId = recId(input.sessionId, `${primary.patternId}_alt`, "alternative");
    if (items.some((i) => i.id === altId)) continue;
    items.push({
      id: altId,
      patternId: primary.patternId,
      category: "alternative",
      kind: primary.kind,
      title: `备选：${primary.title}`,
      primary: primary.alternatives[0]!,
      alternatives: primary.alternatives.slice(1),
      reason: "同类型组织知识备选规格",
      relatedFieldPath: primary.relatedFieldPath,
      similarity: round3(primary.similarity * 0.85),
      trustScore: primary.trustScore,
      frequencyNorm: primary.frequencyNorm,
      categoryBoost: categoryBoostFor("alternative", gaps),
      effectivenessBoost: primary.effectivenessBoost,
      rankScore: computeRankScore({
        similarity: primary.similarity * 0.85,
        trustScore: primary.trustScore,
        frequencyNorm: primary.frequencyNorm,
        categoryBoost: categoryBoostFor("alternative", gaps),
        effectivenessBoost: primary.effectivenessBoost,
        weights,
      }),
      confidence: round2(primary.confidence * 0.9),
      trust: primary.trust,
      status: "open",
    });
  }

  items.sort(
    (a, b) =>
      (b.status === "open" ? 1 : 0) - (a.status === "open" ? 1 : 0) ||
      b.rankScore - a.rankScore ||
      b.similarity - a.similarity ||
      a.title.localeCompare(b.title),
  );

  const limit = input.limit ?? 12;
  // Keep all accepted/dismissed for audit; trim open list
  const open = items.filter((i) => i.status === "open").slice(0, limit);
  const closed = items.filter((i) => i.status !== "open");
  const trimmed = [...open, ...closed];

  const pack: KnowledgeRecommendationPack = {
    version: KNOWLEDGE_RECOMMENDATION_VERSION,
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    generatedAt: new Date().toISOString(),
    contentHash: hashPack(input.sessionId, trimmed, lookup.libraryHash),
    libraryHash: lookup.libraryHash,
    governanceRevision: lookup.governance?.libraryRevision,
    ranking: {
      strategy: "weighted_similarity_trust_v1",
      weights,
    },
    items: trimmed,
    summary: summarize(trimmed),
  };

  saveRecommendationPack(pack);

  const newlyShown = open
    .filter((i) => {
      const prev = prevByKey.get(`${i.patternId}::${i.category}`);
      return !prev || prev.status === "open";
    })
    .map((i) => i.patternId);
  const uniqueShown = [...new Set(newlyShown)];
  if (uniqueShown.length > 0) bumpShown(input.organizationId, uniqueShown);

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "knowledge_recommend",
    message: `生成知识推荐 ${pack.summary.open} 条开放 / 共 ${pack.summary.total}`,
    meta: {
      contentHash: pack.contentHash,
      summary: pack.summary,
      strategy: pack.ranking.strategy,
      libraryHash: pack.libraryHash,
    },
  });

  return pack;
}

function mapBaseToRanked(
  base: {
    id: string;
    patternId: string;
    kind: string;
    title: string;
    reason: string;
    suggestion: string;
    confidence: number;
    relatedFieldPath?: string;
    trust?: RankedKnowledgeRecommendation["trust"];
  },
  pattern: OrgKnowledgePattern | undefined,
  blobTokens: Set<string>,
  gaps: { missingBudget: boolean; missingStandards: boolean; sparseEquipment: boolean },
  maxFreq: number,
  eff: OrgRecommendationEffectiveness,
  weights: RecommendationRankWeights,
  libraryPatterns: OrgKnowledgePattern[],
  confidenceAdjustments: Record<string, number> = {},
): RankedKnowledgeRecommendation {
  const patternText = [pattern?.title, pattern?.example, pattern?.suggestion, base.suggestion]
    .filter(Boolean)
    .join("\n");
  const similarity = jaccardSimilarity(blobTokens, tokenizeForSimilarity(patternText));
  const trustScore = base.trust?.score ?? base.confidence;
  const frequencyNorm = pattern ? round2(pattern.frequency / maxFreq) : 0.5;
  const category = categoryForKind(base.kind, base.trust?.authority);
  const catBoost = categoryBoostFor(category, gaps);
  const stats = eff.byPatternId[base.patternId];
  const baseBoost = stats ? Math.min(1, stats.acceptRate) : 0;
  const adj = confidenceAdjustments[base.patternId] ?? 0;
  const effectivenessBoost = round2(Math.min(1, Math.max(0, baseBoost + adj)));
  const rankScore = computeRankScore({
    similarity,
    trustScore,
    frequencyNorm,
    categoryBoost: catBoost,
    effectivenessBoost,
    weights,
  });

  const alternatives = buildAlternatives(pattern, libraryPatterns);
  const bestPractice =
    base.trust?.authority === "promoted" || base.trust?.authority === "canonical"
      ? `组织最佳实践（${base.trust.authority}）：${base.suggestion}`
      : undefined;

  return {
    id: recId(base.id, base.patternId, category),
    patternId: base.patternId,
    category,
    kind: base.kind,
    title: base.title,
    primary: base.suggestion,
    alternatives,
    bestPractice,
    reason: base.reason,
    relatedFieldPath: fieldPathForCategory(category, base.relatedFieldPath),
    similarity,
    trustScore,
    frequencyNorm,
    categoryBoost: catBoost,
    effectivenessBoost,
    rankScore,
    confidence: base.confidence,
    trust: base.trust,
    status: "open",
  };
}

export function getKnowledgeRecommendationPack(
  sessionId: string,
): KnowledgeRecommendationPack | null {
  return getRecommendationPack(sessionId);
}

export function acceptKnowledgeRecommendation(input: {
  organizationId: string;
  sessionId: string;
  recommendationId: string;
  actorId: string;
  apply?: boolean;
  alternativeIndex?: number;
}): {
  pack: KnowledgeRecommendationPack;
  requirements?: TenderRequirements;
  applied: boolean;
} {
  const pack = getRecommendationPack(input.sessionId);
  if (!pack || pack.organizationId !== input.organizationId) {
    throw new Error("PACK_NOT_FOUND");
  }
  const item = pack.items.find((i) => i.id === input.recommendationId);
  if (!item) throw new Error("RECOMMENDATION_NOT_FOUND");
  if (item.status === "dismissed") throw new Error("ALREADY_DISMISSED");

  const now = new Date().toISOString();
  const text =
    typeof input.alternativeIndex === "number" &&
    item.alternatives[input.alternativeIndex]
      ? item.alternatives[input.alternativeIndex]!
      : item.primary;

  let applied = false;
  let requirements: TenderRequirements | undefined;

  if (input.apply !== false) {
    const session = getIntakeSession(input.sessionId);
    if (!session) throw new Error("SESSION_NOT_FOUND");
    const base = parseTenderRequirements(
      session.requirements ?? session.extractedRequirements ?? {},
    );

    if (item.category === "clarification" && item.relatedFieldPath === "budget") {
      if (!base.budget.notes.trim()) {
        const patched = patchIntakeRequirements({
          sessionId: input.sessionId,
          organizationId: input.organizationId,
          actorId: input.actorId,
          requirements: {
            budget: { ...base.budget, notes: text.slice(0, 200) },
          },
        });
        requirements = patched.requirements;
        applied = true;
      }
    } else {
      const listKey = listKeyForField(item.relatedFieldPath);
      if (listKey) {
        const existing = base[listKey] as RequirementItem[];
        const already = existing.some(
          (e) => e.text.replace(/\s+/g, "") === text.replace(/\s+/g, ""),
        );
        if (!already) {
          const newItem: RequirementItem = {
            id: `rec_${item.id.slice(0, 10)}`,
            text,
            priority: "preferred",
            reviewStatus: "pending",
            confidence: item.confidence,
            confidenceBand:
              item.confidence >= 0.75 ? "high" : item.confidence >= 0.45 ? "medium" : "low",
          };
          const patched = patchIntakeRequirements({
            sessionId: input.sessionId,
            organizationId: input.organizationId,
            actorId: input.actorId,
            requirements: { [listKey]: [...existing, newItem] },
          });
          requirements = patched.requirements;
          applied = true;
        }
      }
    }
  }

  const updatedItems = pack.items.map((i) =>
    i.id === item.id
      ? {
          ...i,
          status: "accepted" as const,
          acceptedAt: now,
          acceptedBy: input.actorId,
          primary: text,
        }
      : i,
  );

  const nextPack = saveRecommendationPack({
    ...pack,
    items: updatedItems,
    summary: summarize(updatedItems),
    contentHash: hashPack(pack.sessionId, updatedItems, pack.libraryHash),
    generatedAt: pack.generatedAt,
  });

  const event: RecommendationFeedbackEvent = {
    id: createHash("sha1")
      .update(`accept:${pack.sessionId}:${item.id}:${now}`)
      .digest("hex")
      .slice(0, 14),
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    recommendationId: item.id,
    patternId: item.patternId,
    action: "accepted",
    at: now,
    actorId: input.actorId,
    note: applied ? "applied_to_requirements" : "accepted_only",
    appliedToRequirements: applied,
  };
  appendRecommendationFeedbackEvent(event);
  bumpFeedback(input.organizationId, item.patternId, "accepted", event);

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    step: "knowledge_recommend",
    message: `接受推荐 ${item.title}`,
    meta: {
      recommendationId: item.id,
      patternId: item.patternId,
      applied,
      category: item.category,
      rankScore: item.rankScore,
    },
  });

  return { pack: nextPack, requirements, applied };
}

export function dismissKnowledgeRecommendation(input: {
  organizationId: string;
  sessionId: string;
  recommendationId: string;
  actorId: string;
  reason?: string;
}): KnowledgeRecommendationPack {
  const pack = getRecommendationPack(input.sessionId);
  if (!pack || pack.organizationId !== input.organizationId) {
    throw new Error("PACK_NOT_FOUND");
  }
  const item = pack.items.find((i) => i.id === input.recommendationId);
  if (!item) throw new Error("RECOMMENDATION_NOT_FOUND");
  if (item.status === "accepted") throw new Error("ALREADY_ACCEPTED");

  const now = new Date().toISOString();
  const updatedItems = pack.items.map((i) =>
    i.id === item.id
      ? {
          ...i,
          status: "dismissed" as const,
          dismissedAt: now,
          dismissedBy: input.actorId,
          dismissReason: input.reason ?? "reviewer_dismissed",
          rankScore: 0,
        }
      : i,
  );

  const nextPack = saveRecommendationPack({
    ...pack,
    items: updatedItems,
    summary: summarize(updatedItems),
    contentHash: hashPack(pack.sessionId, updatedItems, pack.libraryHash),
  });

  const event: RecommendationFeedbackEvent = {
    id: createHash("sha1")
      .update(`dismiss:${pack.sessionId}:${item.id}:${now}`)
      .digest("hex")
      .slice(0, 14),
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    recommendationId: item.id,
    patternId: item.patternId,
    action: "dismissed",
    at: now,
    actorId: input.actorId,
    note: input.reason,
  };
  appendRecommendationFeedbackEvent(event);
  bumpFeedback(input.organizationId, item.patternId, "dismissed", event);

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    step: "knowledge_recommend",
    message: `驳回推荐 ${item.title}`,
    meta: {
      recommendationId: item.id,
      patternId: item.patternId,
      reason: input.reason,
    },
  });

  return nextPack;
}

export function getRecommendationEffectiveness(
  organizationId: string,
): OrgRecommendationEffectiveness {
  return (
    getOrgRecommendationEffectiveness(organizationId) ??
    emptyEffectiveness(organizationId)
  );
}

export function listRecommendationFeedback(
  organizationId: string,
  limit = 50,
): RecommendationFeedbackEvent[] {
  return listRecommendationFeedbackEvents(organizationId, limit);
}

/** Ensure pack exists (generate if missing). */
export function ensureKnowledgeRecommendations(input: {
  organizationId: string;
  sessionId: string;
  actorId?: string;
  requirements?: TenderRequirements | Partial<TenderRequirements>;
}): KnowledgeRecommendationPack {
  const existing = getRecommendationPack(input.sessionId);
  if (existing && existing.organizationId === input.organizationId) {
    return existing;
  }
  return generateKnowledgeRecommendations(input);
}
