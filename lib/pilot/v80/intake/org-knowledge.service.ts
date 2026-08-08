/**
 * V80 Pilot P12 — Build org knowledge from completed intakes + recommendation lookup
 */

import { createHash } from "node:crypto";

import { appendIntakeAudit } from "./audit-trail.service";
import {
  getIntakeSession,
  listIntakeSessionsForOrg,
  type TenderIntakeSession,
} from "./intake.store";
import {
  ORG_KNOWLEDGE_VERSION,
  type OrgKnowledgeLibrary,
  type OrgKnowledgeLookupResult,
  type OrgKnowledgePattern,
  type OrgKnowledgeRecommendation,
} from "./org-knowledge.schema";
import {
  getOrgKnowledgeLibrary,
  saveOrgKnowledgeLibrary,
} from "./org-knowledge.store";
import { applyGovernanceToLookup, syncOrgKnowledgeGovernance } from "./org-knowledge-governance.service";
import type { RequirementItem, TenderRequirements } from "./requirements.schema";
import { parseTenderRequirements } from "./requirements.validation";

const ITEM_KEYS = [
  "functionalRequirements",
  "technicalRequirements",
  "equipment",
  "space",
  "quantity",
  "constraints",
  "compliance",
  "standards",
  "evaluation",
  "optionalItems",
] as const;

function normalizeKey(text: string): string {
  return text
    .replace(/\s+/g, "")
    .replace(/[，,。；;：:]/g, "")
    .toLowerCase()
    .slice(0, 80);
}

function patternId(kind: string, key: string): string {
  const h = createHash("sha1").update(`${kind}:${key}`).digest("hex").slice(0, 10);
  return `okp_${kind}_${h}`;
}

function isCompletedSession(s: TenderIntakeSession): boolean {
  return (
    s.status === "ready" ||
    s.status === "approved" ||
    s.workflowStatus === "completed" ||
    Boolean(s.productionProjectId && s.qaPassedAt) ||
    s.signedOff === true
  );
}

function hashLibrary(patterns: OrgKnowledgePattern[], orgId: string, n: number): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: ORG_KNOWLEDGE_VERSION,
        orgId,
        n,
        patterns: patterns.map((p) => ({
          id: p.id,
          kind: p.kind,
          key: p.key,
          frequency: p.frequency,
        })),
      }),
    )
    .digest("hex");
}

type Acc = {
  kind: OrgKnowledgePattern["kind"];
  key: string;
  title: string;
  example: string;
  suggestion: string;
  tags: string[];
  sessions: Set<string>;
  lastSeenAt: string;
};

function bump(
  map: Map<string, Acc>,
  acc: Omit<Acc, "sessions"> & { sessionId: string },
): void {
  const idKey = `${acc.kind}::${acc.key}`;
  const prev = map.get(idKey);
  if (!prev) {
    map.set(idKey, {
      kind: acc.kind,
      key: acc.key,
      title: acc.title,
      example: acc.example,
      suggestion: acc.suggestion,
      tags: acc.tags,
      sessions: new Set([acc.sessionId]),
      lastSeenAt: acc.lastSeenAt,
    });
    return;
  }
  prev.sessions.add(acc.sessionId);
  if (acc.example.length > prev.example.length) prev.example = acc.example;
  if (Date.parse(acc.lastSeenAt) > Date.parse(prev.lastSeenAt)) {
    prev.lastSeenAt = acc.lastSeenAt;
  }
}

/** Extract patterns from a single completed session into accumulator. */
function collectFromSession(session: TenderIntakeSession, map: Map<string, Acc>): void {
  const req = session.requirements ?? session.extractedRequirements;
  if (!req) return;
  const seenAt = session.updatedAt || session.createdAt;

  for (const key of ITEM_KEYS) {
    for (const item of req[key]) {
      if (!item.text.trim()) continue;
      if (item.reviewStatus === "rejected") continue;
      const nk = normalizeKey(item.text);
      if (nk.length < 4) continue;

      const isEquipment =
        key === "equipment" || /器械|设备|跑步机|器材|台|套/.test(item.text);
      const isStandard =
        key === "standards" || /GB\/?T|ISO|标准|规范/.test(item.text);

      bump(map, {
        kind: isStandard ? "standard" : isEquipment ? "equipment" : "requirement",
        key: nk,
        title: item.text.slice(0, 48),
        example: item.text.slice(0, 160),
        suggestion: isEquipment
          ? `可复用设备规格：「${item.text.slice(0, 40)}」`
          : isStandard
            ? `建议引用标准：「${item.text.slice(0, 40)}」`
            : `历史常用需求：「${item.text.slice(0, 40)}」`,
        tags: [key, item.priority ?? "must", item.confidenceBand ?? "unknown"],
        sessionId: session.id,
        lastSeenAt: seenAt,
      });
    }
  }

  for (const q of session.clarifications?.questions ?? []) {
    const nk = normalizeKey(`${q.fieldPath}:${q.question}`);
    if (nk.length < 4) continue;
    bump(map, {
      kind: "clarification",
      key: nk,
      title: q.question.slice(0, 48),
      example: q.answer ? `${q.question} → ${q.answer}` : q.question,
      suggestion: `常见澄清（${q.fieldPath}）：${q.question.slice(0, 40)}`,
      tags: [q.fieldPath, q.severity, q.status],
      sessionId: session.id,
      lastSeenAt: seenAt,
    });
  }

  for (const f of session.compliance?.report.findings ?? []) {
    bump(map, {
      kind: "compliance",
      key: f.ruleId,
      title: f.title,
      example: f.message,
      suggestion: f.recommendation || `注意合规项：${f.title}`,
      tags: [f.category, f.severity, f.risk],
      sessionId: session.id,
      lastSeenAt: seenAt,
    });
  }
}

function toPatterns(map: Map<string, Acc>): OrgKnowledgePattern[] {
  const patterns: OrgKnowledgePattern[] = [];
  for (const acc of map.values()) {
    const frequency = acc.sessions.size;
    if (frequency < 1) continue;
    patterns.push({
      id: patternId(acc.kind, acc.key),
      kind: acc.kind,
      key: acc.key,
      title: acc.title,
      example: acc.example,
      frequency,
      sourceSessionIds: [...acc.sessions].sort(),
      tags: acc.tags,
      suggestion: acc.suggestion,
      lastSeenAt: acc.lastSeenAt,
    });
  }
  return patterns.sort(
    (a, b) =>
      b.frequency - a.frequency ||
      a.kind.localeCompare(b.kind) ||
      a.title.localeCompare(b.title),
  );
}

/** Build (or rebuild) organization knowledge library from completed intakes. */
export function buildOrgKnowledgeLibrary(input: {
  organizationId: string;
  actorId?: string;
  minFrequency?: number;
}): OrgKnowledgeLibrary {
  const minFrequency = input.minFrequency ?? 1;
  const sessions = listIntakeSessionsForOrg(input.organizationId).filter(isCompletedSession);
  const map = new Map<string, Acc>();
  for (const s of sessions) collectFromSession(s, map);

  let patterns = toPatterns(map).filter((p) => p.frequency >= minFrequency);
  // Cap library size for determinism / UI
  patterns = patterns.slice(0, 200);

  const summary = {
    requirementPatterns: patterns.filter((p) => p.kind === "requirement").length,
    clarificationPatterns: patterns.filter((p) => p.kind === "clarification").length,
    compliancePatterns: patterns.filter((p) => p.kind === "compliance").length,
    equipmentPatterns: patterns.filter((p) => p.kind === "equipment").length,
    standardPatterns: patterns.filter((p) => p.kind === "standard").length,
  };

  const library: OrgKnowledgeLibrary = {
    version: ORG_KNOWLEDGE_VERSION,
    organizationId: input.organizationId,
    builtAt: new Date().toISOString(),
    contentHash: hashLibrary(patterns, input.organizationId, sessions.length),
    sourceSessionCount: sessions.length,
    patterns,
    summary,
  };

  saveOrgKnowledgeLibrary(library);
  syncOrgKnowledgeGovernance({
    library,
    actorId: input.actorId ?? "system",
  });
  return library;
}

export function rebuildOrgKnowledgeLibrary(input: {
  organizationId: string;
  actorId?: string;
  sessionId?: string;
  minFrequency?: number;
}): OrgKnowledgeLibrary {
  const library = buildOrgKnowledgeLibrary(input);
  if (input.sessionId) {
    appendIntakeAudit({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.actorId ?? "system",
      step: "org_knowledge",
      message: `重建组织知识库（${library.patterns.length} 模式 / ${library.sourceSessionCount} 会话）`,
      meta: {
        contentHash: library.contentHash,
        patternCount: library.patterns.length,
        sourceSessionCount: library.sourceSessionCount,
        summary: library.summary,
      },
    });
  }
  return library;
}

function scorePattern(
  pattern: OrgKnowledgePattern,
  ctx: {
    blob: string;
    missingStandards: boolean;
    missingBudget: boolean;
    ambiguousItems: RequirementItem[];
    equipmentCount: number;
  },
): { score: number; reason: string; fieldPath?: string } | null {
  const titleKey = normalizeKey(pattern.title);
  const exampleKey = normalizeKey(pattern.example);

  if (pattern.kind === "compliance") {
    // Recommend historical compliance issues as watchouts
    const score = Math.min(0.95, 0.45 + pattern.frequency * 0.12);
    return {
      score,
      reason: `组织内出现 ${pattern.frequency} 次：${pattern.title}`,
      fieldPath: "compliance",
    };
  }

  if (pattern.kind === "clarification") {
    const field = pattern.tags[0] ?? "";
    if (field === "budget" && ctx.missingBudget) {
      return {
        score: Math.min(0.95, 0.55 + pattern.frequency * 0.1),
        reason: "当前缺预算，命中历史澄清模式",
        fieldPath: "budget",
      };
    }
    if (field && !ctx.blob.includes(normalizeKey(field))) {
      return {
        score: Math.min(0.85, 0.4 + pattern.frequency * 0.1),
        reason: `历史常问澄清（${field}）`,
        fieldPath: field,
      };
    }
    if (pattern.frequency >= 2) {
      return {
        score: 0.35 + Math.min(0.3, pattern.frequency * 0.05),
        reason: "高频澄清模式",
        fieldPath: field || undefined,
      };
    }
    return null;
  }

  if (pattern.kind === "standard" && ctx.missingStandards) {
    return {
      score: Math.min(0.95, 0.6 + pattern.frequency * 0.1),
      reason: "健身/器械场景缺标准引用，推荐组织常用标准",
      fieldPath: "standards",
    };
  }

  if (pattern.kind === "equipment") {
    const already = ctx.blob.includes(titleKey) || ctx.blob.includes(exampleKey.slice(0, 16));
    if (already) return null;
    if (ctx.equipmentCount === 0 || ctx.ambiguousItems.length > 0) {
      return {
        score: Math.min(0.9, 0.5 + pattern.frequency * 0.1),
        reason:
          ctx.ambiguousItems.length > 0
            ? "存在含糊设备表述，可参考历史规格"
            : "当前设备条目少，推荐组织常用规格",
        fieldPath: "equipment",
      };
    }
  }

  if (pattern.kind === "requirement") {
    const already = ctx.blob.includes(titleKey.slice(0, 12));
    if (already) return null;
    if (pattern.frequency >= 2) {
      return {
        score: Math.min(0.8, 0.35 + pattern.frequency * 0.08),
        reason: `组织高频需求模式（${pattern.frequency}）`,
        fieldPath: "technicalRequirements",
      };
    }
  }

  return null;
}

/** Lookup recommendations for a live intake review context. */
export function lookupOrgKnowledgeRecommendations(input: {
  organizationId: string;
  sessionId?: string;
  requirements?: TenderRequirements | Partial<TenderRequirements>;
  limit?: number;
}): OrgKnowledgeLookupResult {
  let library = getOrgKnowledgeLibrary(input.organizationId);
  if (!library) {
    library = buildOrgKnowledgeLibrary({ organizationId: input.organizationId });
  }

  const session = input.sessionId ? getIntakeSession(input.sessionId) : null;
  const req = parseTenderRequirements(
    input.requirements ?? session?.requirements ?? session?.extractedRequirements ?? {},
  );
  const items = ITEM_KEYS.flatMap((k) => req[k]);
  const blob = [
    req.projectName,
    req.organization,
    req.industry,
    req.location,
    req.scope,
    ...items.map((i) => i.text),
    ...req.standards.map((s) => s.text),
  ]
    .join("\n")
    .toLowerCase();

  const missingBudget =
    req.budget.min === undefined &&
    req.budget.max === undefined &&
    !req.budget.notes.trim();
  const missingStandards =
    (/健身|gym|器械|跑步机/.test(blob) || req.industry === "fitness") &&
    req.standards.every((s) => !s.text.trim()) &&
    !/gb\/?t|17498|22517|iso/.test(blob);
  const ambiguousItems = items.filter((i) => /大约|若干|待定|左右|TBD/i.test(i.text));
  const equipmentCount = req.equipment.filter((e) => e.text.trim()).length;

  const ctx = {
    blob,
    missingStandards,
    missingBudget,
    ambiguousItems,
    equipmentCount,
  };

  const recs: OrgKnowledgeRecommendation[] = [];
  for (const pattern of library.patterns) {
    const scored = scorePattern(pattern, ctx);
    if (!scored) continue;
    recs.push({
      id: `okr_${pattern.id}`,
      patternId: pattern.id,
      kind: pattern.kind,
      title: pattern.title,
      reason: scored.reason,
      suggestion: pattern.suggestion,
      confidence: Math.round(scored.score * 100) / 100,
      relatedFieldPath: scored.fieldPath,
    });
  }

  recs.sort(
    (a, b) =>
      b.confidence - a.confidence ||
      a.kind.localeCompare(b.kind) ||
      a.title.localeCompare(b.title),
  );

  const limit = input.limit ?? 12;
  const raw: OrgKnowledgeLookupResult = {
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    lookedUpAt: new Date().toISOString(),
    recommendations: recs.slice(0, limit),
    libraryBuiltAt: library.builtAt,
    libraryHash: library.contentHash,
  };

  return applyGovernanceToLookup(raw, library);
}

export function getOrgKnowledgeSnapshot(organizationId: string): OrgKnowledgeLibrary | null {
  return getOrgKnowledgeLibrary(organizationId);
}

export function exportOrgKnowledgeJson(library: OrgKnowledgeLibrary): {
  fileName: string;
  body: string;
} {
  const stamp = library.builtAt.slice(0, 10);
  return {
    fileName: `org-knowledge-${library.organizationId}-${stamp}.json`,
    body: JSON.stringify(library, null, 2),
  };
}
