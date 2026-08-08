/**
 * V80 Pilot P7 — Multi-document extract + cross-document reconciliation
 * Reuses P1 extract; no new engine. State stays on intake session.
 */

import { randomUUID } from "node:crypto";

import type { TenderParseResult } from "@/lib/tender/types";

import { appendIntakeAudit } from "./audit-trail.service";
import { isIntakeSessionFrozen } from "./freeze-lock.service";
import {
  getIntakeSession,
  updateIntakeSession,
  type TenderIntakeSession,
} from "./intake.store";
import {
  computeDocumentPriority,
  inferIntakeDocumentType,
  type IntakeDocumentEntry,
  type IntakeDocumentType,
  type MultiDocConsolidationState,
  type RequirementConflict,
} from "./multidoc.schema";
import type { RequirementItem, TenderRequirements } from "./requirements.schema";
import { EMPTY_TENDER_REQUIREMENTS } from "./requirements.schema";
import {
  parseTenderRequirements,
  validateTenderRequirementsForApproval,
  type RequirementValidationResult,
} from "./requirements.validation";
import { extractRequirementsFromParsedTender } from "./extract.service";

const ITEM_LIST_KEYS = [
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

type ItemListKey = (typeof ITEM_LIST_KEYS)[number];

function normalizeText(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}

function textSimilarity(a: string, b: string): number {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) {
    return Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
  }
  // token overlap
  const ta = new Set(na.split(/[，,。；;、]/).filter((t) => t.length >= 2));
  const tb = new Set(nb.split(/[，,。；;、]/).filter((t) => t.length >= 2));
  if (ta.size === 0 || tb.size === 0) {
    // char bigram Jaccard-ish
    const grams = (s: string) => {
      const g = new Set<string>();
      for (let i = 0; i < s.length - 1; i++) g.add(s.slice(i, i + 2));
      return g;
    };
    const ga = grams(na);
    const gb = grams(nb);
    let inter = 0;
    for (const x of ga) if (gb.has(x)) inter += 1;
    return inter / Math.max(ga.size, gb.size, 1);
  }
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / Math.max(ta.size, tb.size);
}

function extractNumbers(text: string): number[] {
  return [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
}

function numbersConflict(a: string, b: string): boolean {
  const na = extractNumbers(a);
  const nb = extractNumbers(b);
  if (na.length === 0 || nb.length === 0) return false;
  return na.some((n, i) => nb[i] !== undefined && Math.abs(n - nb[i]!) > 1e-6);
}

function stampSource(
  items: RequirementItem[],
  doc: Pick<IntakeDocumentEntry, "id" | "fileName">,
): RequirementItem[] {
  return items.map((item) => ({
    ...item,
    id: `${doc.id.slice(0, 8)}_${item.id}`,
    sourceDocumentId: doc.id,
    sourceDocumentName: doc.fileName,
    evidence: (item.evidence ?? []).map((ev) => ({
      ...ev,
      documentId: doc.id,
      documentName: doc.fileName,
    })),
  }));
}

function tagRequirementsWithSource(
  req: TenderRequirements,
  doc: Pick<IntakeDocumentEntry, "id" | "fileName">,
): TenderRequirements {
  const next = { ...req };
  for (const key of ITEM_LIST_KEYS) {
    next[key] = stampSource(req[key], doc);
  }
  return next;
}

function pickScalar(
  docs: IntakeDocumentEntry[],
  getter: (r: TenderRequirements) => string,
): { value: string; conflicts: RequirementConflict[] } {
  const ranked = [...docs]
    .filter((d) => d.requirements)
    .sort((a, b) => b.priority - a.priority);

  const nonEmpty = ranked
    .map((d) => ({ doc: d, value: getter(d.requirements!).trim() }))
    .filter((x) => x.value.length > 0);

  if (nonEmpty.length === 0) return { value: "", conflicts: [] };

  const winner = nonEmpty[0]!;
  const conflicts: RequirementConflict[] = [];
  for (const other of nonEmpty.slice(1)) {
    if (normalizeText(other.value) === normalizeText(winner.value)) continue;
    conflicts.push({
      id: `scalar:${randomUUID().slice(0, 8)}`,
      listKey: "scalar",
      kind: "superseded",
      message: `字段冲突，保留高优先级文档「${winner.doc.fileName}」：${winner.value.slice(0, 40)} vs ${other.value.slice(0, 40)}`,
      sourceDocumentIds: [winner.doc.id, other.doc.id],
      loserItemIds: [],
      resolution: "auto_keep_priority",
    });
  }
  return { value: winner.value, conflicts };
}

type ScoredItem = {
  item: RequirementItem;
  docPriority: number;
  listKey: ItemListKey;
};

function reconcileItemLists(
  docs: IntakeDocumentEntry[],
): { lists: Record<ItemListKey, RequirementItem[]>; conflicts: RequirementConflict[] } {
  const scored: ScoredItem[] = [];
  for (const doc of docs) {
    if (!doc.requirements) continue;
    for (const key of ITEM_LIST_KEYS) {
      for (const item of doc.requirements[key]) {
        if (!item.text.trim()) continue;
        scored.push({ item, docPriority: doc.priority, listKey: key });
      }
    }
  }

  // Process per list key
  const lists = {} as Record<ItemListKey, RequirementItem[]>;
  const conflicts: RequirementConflict[] = [];

  for (const key of ITEM_LIST_KEYS) {
    const group = scored
      .filter((s) => s.listKey === key)
      .sort(
        (a, b) =>
          b.docPriority - a.docPriority ||
          (b.item.confidence ?? 0) - (a.item.confidence ?? 0),
      );

    const kept: RequirementItem[] = [];
    const droppedIds = new Set<string>();

    for (const candidate of group) {
      if (droppedIds.has(candidate.item.id)) continue;

      const dup = kept.find(
        (k) => textSimilarity(k.text, candidate.item.text) >= 0.86,
      );
      if (dup) {
        // Merge evidence into winner
        const mergedEvidence = [
          ...(dup.evidence ?? []),
          ...(candidate.item.evidence ?? []),
        ].slice(0, 4);
        const idx = kept.findIndex((k) => k.id === dup.id);
        kept[idx] = {
          ...dup,
          evidence: mergedEvidence,
          confidence: Math.max(dup.confidence ?? 0, candidate.item.confidence ?? 0),
        };
        droppedIds.add(candidate.item.id);
        conflicts.push({
          id: `dup:${candidate.item.id}`,
          listKey: key,
          kind: "duplicate",
          message: `重复条款已合并：${candidate.item.text.slice(0, 40)}`,
          winnerItemId: dup.id,
          loserItemIds: [candidate.item.id],
          sourceDocumentIds: [
            dup.sourceDocumentId,
            candidate.item.sourceDocumentId,
          ].filter(Boolean) as string[],
          resolution: "auto_dedupe",
        });
        continue;
      }

      const conflicting = kept.find((k) => {
        const sim = textSimilarity(k.text, candidate.item.text);
        return sim >= 0.45 && sim < 0.86 && numbersConflict(k.text, candidate.item.text);
      });
      if (conflicting) {
        // Higher priority already in kept — drop candidate as superseded
        droppedIds.add(candidate.item.id);
        conflicts.push({
          id: `conflict:${candidate.item.id}`,
          listKey: key,
          kind: "conflict",
          message: `跨文档冲突，保留「${conflicting.sourceDocumentName ?? "高优先级"}」：${conflicting.text.slice(0, 28)} ↔ ${candidate.item.text.slice(0, 28)}`,
          winnerItemId: conflicting.id,
          loserItemIds: [candidate.item.id],
          sourceDocumentIds: [
            conflicting.sourceDocumentId,
            candidate.item.sourceDocumentId,
          ].filter(Boolean) as string[],
          resolution: "auto_keep_priority",
        });
        continue;
      }

      kept.push(candidate.item);
    }

    lists[key] = kept;
  }

  return { lists, conflicts };
}

function buildCombinedParseResult(docs: IntakeDocumentEntry[]): TenderParseResult {
  const sorted = [...docs].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) {
    return { rawText: "", metadata: {}, sections: [], tables: [], pages: [] };
  }
  if (sorted.length === 1) return sorted[0]!.parseResult;

  const pages = sorted.flatMap((d, di) =>
    d.parseResult.pages.map((p) => ({
      page: p.page + di * 1000,
      text: `[${d.fileName} p.${p.page}]\n${p.text}`,
    })),
  );
  const sections = sorted.flatMap((d) =>
    d.parseResult.sections.map((s) => ({
      ...s,
      id: `${d.id}_${s.id}`,
      title: `[${d.fileName}] ${s.title}`,
    })),
  );
  const tables = sorted.flatMap((d) => d.parseResult.tables);
  const primary = [...sorted].sort((a, b) => b.priority - a.priority)[0]!;
  return {
    rawText: sorted.map((d) => `===== ${d.fileName} =====\n${d.parseResult.rawText}`).join("\n\n"),
    metadata: { ...primary.parseResult.metadata },
    sections,
    tables,
    pages,
  };
}

/** Pure consolidation of per-document extractions into one TenderRequirements. */
export function consolidateDocumentRequirements(
  documents: IntakeDocumentEntry[],
): {
  requirements: TenderRequirements;
  consolidation: MultiDocConsolidationState;
} {
  const extracted = documents.filter((d) => d.requirements && d.status === "extracted");
  if (extracted.length === 0) {
    return {
      requirements: { ...EMPTY_TENDER_REQUIREMENTS },
      consolidation: {
        conflicts: [],
        consolidatedAt: new Date().toISOString(),
        documentCount: 0,
        keptItemCount: 0,
        droppedItemCount: 0,
      },
    };
  }

  const scalarConflicts: RequirementConflict[] = [];
  const projectName = pickScalar(extracted, (r) => r.projectName);
  const organization = pickScalar(extracted, (r) => r.organization);
  const location = pickScalar(extracted, (r) => r.location);
  const industry = pickScalar(extracted, (r) => r.industry);
  const scope = pickScalar(extracted, (r) => r.scope);
  scalarConflicts.push(
    ...projectName.conflicts,
    ...organization.conflicts,
    ...location.conflicts,
    ...industry.conflicts,
    ...scope.conflicts,
  );

  const { lists, conflicts: itemConflicts } = reconcileItemLists(extracted);

  // Budget / schedule: highest priority non-empty
  const ranked = [...extracted].sort((a, b) => b.priority - a.priority);
  let budget = { ...EMPTY_TENDER_REQUIREMENTS.budget };
  let schedule = { ...EMPTY_TENDER_REQUIREMENTS.schedule };
  const objectives: string[] = [];
  const deliverables: string[] = [];
  const risks: string[] = [];
  const sourceRefs: TenderRequirements["sourceRefs"] = [];

  for (const doc of ranked) {
    const r = doc.requirements!;
    if (
      budget.min === undefined &&
      budget.max === undefined &&
      !budget.notes.trim() &&
      (r.budget.min !== undefined || r.budget.max !== undefined || r.budget.notes.trim())
    ) {
      budget = { ...r.budget };
    }
    if (!schedule.deadline && r.schedule.deadline) {
      schedule = { ...r.schedule };
    }
    for (const o of r.objectives) {
      if (o.trim() && !objectives.some((x) => normalizeText(x) === normalizeText(o))) {
        objectives.push(o);
      }
    }
    for (const d of r.deliverables) {
      if (d.trim() && !deliverables.some((x) => normalizeText(x) === normalizeText(d))) {
        deliverables.push(d);
      }
    }
    for (const risk of r.risks) {
      if (risk.trim() && !risks.some((x) => normalizeText(x) === normalizeText(risk))) {
        risks.push(risk);
      }
    }
    sourceRefs.push(
      ...r.sourceRefs.map((sr) => ({
        ...sr,
        excerpt: `[${doc.fileName}] ${sr.excerpt}`.slice(0, 200),
      })),
    );
  }

  const allConflicts = [...scalarConflicts, ...itemConflicts];
  const keptItemCount = ITEM_LIST_KEYS.reduce((n, k) => n + lists[k].length, 0);
  const inputItemCount = extracted.reduce(
    (n, d) =>
      n +
      ITEM_LIST_KEYS.reduce((m, k) => m + (d.requirements?.[k].length ?? 0), 0),
    0,
  );

  const requirements: TenderRequirements = {
    ...EMPTY_TENDER_REQUIREMENTS,
    projectName: projectName.value,
    organization: organization.value,
    industry: industry.value,
    location: location.value,
    scope: scope.value,
    objectives,
    deliverables,
    risks,
    budget,
    schedule,
    functionalRequirements: lists.functionalRequirements,
    technicalRequirements: lists.technicalRequirements,
    equipment: lists.equipment,
    space: lists.space,
    quantity: lists.quantity,
    constraints: lists.constraints,
    compliance: lists.compliance,
    standards: lists.standards,
    evaluation: lists.evaluation,
    optionalItems: lists.optionalItems,
    sourceRefs: sourceRefs.slice(0, 24),
  };

  return {
    requirements: parseTenderRequirements(requirements),
    consolidation: {
      conflicts: allConflicts,
      consolidatedAt: new Date().toISOString(),
      documentCount: extracted.length,
      keptItemCount,
      droppedItemCount: Math.max(0, inputItemCount - keptItemCount),
    },
  };
}

function assertMutable(session: TenderIntakeSession): void {
  if (session.signedOff) throw new Error("RELEASE_LOCKED");
  if (isIntakeSessionFrozen(session) || session.status === "ready") {
    throw new Error("SESSION_FROZEN");
  }
  if (session.status === "approving" || session.status === "generating") {
    throw new Error("SESSION_LOCKED");
  }
  if (session.status === "approved") throw new Error("ALREADY_APPROVED");
}

export function extractDocumentRequirements(
  doc: IntakeDocumentEntry,
): IntakeDocumentEntry {
  const raw = extractRequirementsFromParsedTender({
    parseResult: doc.parseResult,
    sourceName: doc.fileName,
  });
  const stamped = tagRequirementsWithSource(raw, doc);
  // pending review stamps
  for (const key of ITEM_LIST_KEYS) {
    stamped[key] = stamped[key].map((i) => ({
      ...i,
      reviewStatus: i.reviewStatus ?? "pending",
    }));
  }
  return {
    ...doc,
    requirements: parseTenderRequirements(stamped),
    status: "extracted",
  };
}

export type ConsolidateIntakeResult = {
  session: TenderIntakeSession;
  requirements: TenderRequirements;
  consolidation: MultiDocConsolidationState;
  documents: IntakeDocumentEntry[];
  validation: RequirementValidationResult;
  revision: number;
};

/** Re-run consolidation from session.documents into working requirements. */
export function consolidateIntakeSession(input: {
  sessionId: string;
  organizationId: string;
  actorId?: string;
}): ConsolidateIntakeResult {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");
  assertMutable(session);

  let documents = session.documents?.length
    ? [...session.documents]
    : [
        {
          id: `doc_legacy_${session.id.slice(0, 8)}`,
          fileName: session.fileName,
          mimeType: session.mimeType,
          fileSize: session.fileSize,
          docType: "primary" as const,
          order: 0,
          priority: computeDocumentPriority("primary", 0),
          parseResult: session.parseResult,
          requirements: session.extractedRequirements ?? session.requirements,
          uploadedAt: session.createdAt,
          status: (session.requirements ? "extracted" : "parsed") as const,
        },
      ];

  documents = documents.map((d) =>
    d.requirements && d.status === "extracted" ? d : extractDocumentRequirements(d),
  );

  const { requirements, consolidation } = consolidateDocumentRequirements(documents);
  const revision = (session.requirementsRevision ?? 0) + 1;
  const combinedParse = buildCombinedParseResult(documents);
  const primaryName =
    [...documents].sort((a, b) => b.priority - a.priority)[0]?.fileName ?? session.fileName;

  const updated = updateIntakeSession(input.sessionId, {
    status: "extracted",
    documents,
    consolidation,
    requirements,
    extractedRequirements: requirements,
    requirementsRevision: revision,
    parseResult: combinedParse,
    fileName: documents.length > 1 ? `${primaryName} (+${documents.length - 1})` : primaryName,
  });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "consolidate",
    statusBefore: session.status,
    statusAfter: "extracted",
    message: `多文档合并：${documents.length} 份，冲突 ${consolidation.conflicts.length}，保留 ${consolidation.keptItemCount} 条`,
    requirementsSnapshot: requirements,
    meta: {
      revision,
      documentCount: consolidation.documentCount,
      conflictCount: consolidation.conflicts.length,
      droppedItemCount: consolidation.droppedItemCount,
      documentIds: documents.map((d) => d.id),
    },
  });

  return {
    session: updated,
    requirements,
    consolidation,
    documents,
    validation: validateTenderRequirementsForApproval(requirements),
    revision,
  };
}

export type AddIntakeDocumentResult = ConsolidateIntakeResult & {
  document: IntakeDocumentEntry;
};

/** Attach a parsed document to an existing session and consolidate. */
export function addParsedDocumentToIntake(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  parseResult: TenderParseResult;
  docType?: IntakeDocumentType;
}): AddIntakeDocumentResult {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");
  assertMutable(session);

  const existing = session.documents?.length
    ? [...session.documents]
    : session.parseResult
      ? [
          extractDocumentRequirements({
            id: `doc_primary_${session.id.slice(0, 8)}`,
            fileName: session.fileName.replace(/\s\(\+\d+\)$/, ""),
            mimeType: session.mimeType,
            fileSize: session.fileSize,
            docType: "primary",
            order: 0,
            priority: computeDocumentPriority("primary", 0),
            parseResult: session.parseResult,
            uploadedAt: session.createdAt,
            status: "parsed",
          }),
        ]
      : [];

  const order = existing.length;
  const docType = input.docType ?? inferIntakeDocumentType(input.fileName);
  let doc: IntakeDocumentEntry = {
    id: randomUUID(),
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    docType,
    order,
    priority: computeDocumentPriority(docType, order),
    parseResult: input.parseResult,
    uploadedAt: new Date().toISOString(),
    status: "parsed",
  };
  doc = extractDocumentRequirements(doc);

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    step: "upload",
    statusBefore: session.status,
    statusAfter: session.status,
    message: `追加文档 ${input.fileName}（${docType}）`,
    meta: {
      documentId: doc.id,
      docType,
      order,
      priority: doc.priority,
      multiDoc: true,
    },
  });

  updateIntakeSession(input.sessionId, {
    documents: [...existing, doc],
  });

  const consolidated = consolidateIntakeSession({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
  });

  return { ...consolidated, document: doc };
}

export function listIntakeDocuments(sessionId: string): IntakeDocumentEntry[] {
  const session = getIntakeSession(sessionId);
  if (!session) return [];
  if (session.documents?.length) return session.documents;
  return [
    {
      id: `doc_legacy_${session.id.slice(0, 8)}`,
      fileName: session.fileName,
      mimeType: session.mimeType,
      fileSize: session.fileSize,
      docType: "primary",
      order: 0,
      priority: computeDocumentPriority("primary", 0),
      parseResult: session.parseResult,
      requirements: session.requirements,
      uploadedAt: session.createdAt,
      status: "extracted",
    },
  ];
}

export function resolveConsolidationConflict(input: {
  sessionId: string;
  organizationId: string;
  conflictId: string;
  resolution: "manual_keep" | "manual_drop";
  keepItemId?: string;
  actorId?: string;
}): ConsolidateIntakeResult {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");
  assertMutable(session);

  const consolidation = session.consolidation;
  if (!consolidation) throw new Error("NO_CONSOLIDATION_STATE");

  const conflicts = consolidation.conflicts.map((c) =>
    c.id === input.conflictId
      ? {
          ...c,
          resolution: input.resolution,
          winnerItemId:
            input.resolution === "manual_keep"
              ? input.keepItemId ?? c.winnerItemId
              : c.winnerItemId,
        }
      : c,
  );

  updateIntakeSession(input.sessionId, {
    consolidation: { ...consolidation, conflicts },
  });

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "consolidate",
    statusBefore: session.status,
    statusAfter: session.status,
    message: `人工处理冲突 ${input.conflictId} → ${input.resolution}`,
    meta: {
      conflictId: input.conflictId,
      resolution: input.resolution,
      keepItemId: input.keepItemId,
      action: "resolve_conflict",
    },
  });

  return consolidateIntakeSession({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
  });
}
