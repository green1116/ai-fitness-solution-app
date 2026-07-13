/**
 * E02-P2 — Knowledge Entity Extraction builder
 * Extracts entities from tender content into KnowledgeGraph candidates
 */

import { createHash, randomUUID } from "node:crypto";

import type {
  KnowledgeEdgeKind,
  KnowledgeNodeKind,
  KnowledgeSeedEdge,
  KnowledgeSeedNode,
} from "../knowledge/knowledge.types";
import {
  assertValidCandidatePack,
  EXTRACTION_LIFECYCLE_STAGES,
  validateExtractedEntity,
  validateExtractionKernelInput,
  validateEntityRelationCandidate,
} from "./extraction.schema";
import type {
  EntityRelationCandidate,
  ExtractedEntity,
  ExtractionKernelInput,
  ExtractionKernelResult,
  ExtractionLifecycle,
  ExtractionLifecycleStage,
  ExtractionLifecycleTransition,
  ExtractionSpan,
  KnowledgeGraphCandidatePack,
} from "./extraction.types";
import {
  V102_KNOWLEDGE_EXTRACTION_FREEZE_VERSION,
  V102_KNOWLEDGE_EXTRACTION_VERSION,
} from "./extraction.types";

function nowIso(): string {
  return new Date().toISOString();
}

function stableId(prefix: string, seed: string): string {
  const hash = createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return `${prefix}_${hash}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ");
}

function makeSpan(text: string, matched: string): ExtractionSpan | undefined {
  const start = text.indexOf(matched);
  if (start < 0) return undefined;
  return {
    start,
    end: start + matched.length,
    text: matched,
    readOnly: true,
  };
}

type PatternRule = {
  kind: KnowledgeNodeKind;
  sourceHint: string;
  confidence: number;
  patterns: RegExp[];
  labelFromMatch?: (match: RegExpMatchArray) => string;
  aliasesFromMatch?: (match: RegExpMatchArray, text: string) => string[];
  propertiesFromMatch?: (match: RegExpMatchArray) => Record<string, string>;
  evidenceFromMatch?: (match: RegExpMatchArray) => string;
};

const FIELD_RULES: PatternRule[] = [
  {
    kind: "project",
    sourceHint: "project-name",
    confidence: 0.96,
    patterns: [/项目名称[:：]\s*([^\n]+)/, /工程名称[:：]\s*([^\n]+)/],
  },
  {
    kind: "organization",
    sourceHint: "organization",
    confidence: 0.94,
    patterns: [/招标人[:：]\s*([^\n]+)/, /采购人[:：]\s*([^\n]+)/],
  },
  {
    kind: "location",
    sourceHint: "location",
    confidence: 0.92,
    patterns: [/建设地点[:：]\s*([^\n]+)/, /项目地点[:：]\s*([^\n]+)/],
  },
];

const CONTENT_RULES: Array<{
  kind: KnowledgeNodeKind;
  sourceHint: string;
  confidence: number;
  test: RegExp;
  label: string | ((text: string) => string);
  aliases?: string[] | ((text: string) => string[]);
  properties?: Record<string, string> | ((text: string) => Record<string, string>);
  evidence: string | ((text: string) => string);
}> = [
  {
    kind: "equipment",
    sourceHint: "equipment",
    confidence: 0.88,
    test: /跑步机|有氧|力量区|器械/,
    label: "健身器械配置",
    aliases: (text) =>
      ["跑步机", "有氧区", "力量区", "器械"].filter((a) => text.includes(a)),
    properties: { category: "fitness-equipment" },
    evidence: "器械/有氧/力量相关描述",
  },
  {
    kind: "standard",
    sourceHint: "standard",
    confidence: 0.9,
    test: /GB\/T\s*22517|国标|标准/,
    label: (text) => (text.includes("22517") ? "GB/T 22517" : "相关国家标准"),
    evidence: (text) =>
      text.includes("22517") ? "提及 GB/T 22517" : "提及国家标准/标准要求",
  },
  {
    kind: "budget",
    sourceHint: "budget",
    confidence: 0.89,
    test: /预算|限价|万元/,
    label: (text) => {
      const m = text.match(/限价\s*([0-9]+(?:\.[0-9]+)?)\s*万/) ||
        text.match(/预算[^\n]{0,20}?([0-9]+(?:\.[0-9]+)?)\s*万/);
      return m?.[1] ? `预算限价 ${m[1]} 万元` : "项目预算";
    },
    properties: (text): Record<string, string> => {
      const m = text.match(/限价\s*([0-9]+(?:\.[0-9]+)?)\s*万/) ||
        text.match(/预算[^\n]{0,20}?([0-9]+(?:\.[0-9]+)?)\s*万/);
      return m?.[1] ? { amountWan: m[1] } : {};
    },
    evidence: "预算/限价描述",
  },
  {
    kind: "deliverable",
    sourceHint: "deliverable",
    confidence: 0.87,
    test: /方案书|设备清单|预算书|施工组织/,
    label: "投标交付成果包",
    aliases: (text) =>
      ["方案书", "设备清单", "预算书", "施工组织方案"].filter((a) => text.includes(a)),
    evidence: "交付成果清单",
  },
  {
    kind: "clause",
    sourceHint: "clause",
    confidence: 0.86,
    test: /技术标|商务标|评标|质保|强制/,
    label: "评标与合规条款",
    evidence: "评标/质保/合规条款",
  },
  {
    kind: "requirement",
    sourceHint: "requirement",
    confidence: 0.88,
    test: /面积|净高|功能需求|技术标准|不少于|不低于/,
    label: "技术与功能需求",
    evidence: "技术/功能/空间指标",
  },
];

export function buildExtractedEntity(input: {
  kind: KnowledgeNodeKind;
  label: string;
  evidence: string;
  sourceHint: string;
  aliases?: string[];
  span?: ExtractionSpan;
  confidence?: number;
  properties?: Record<string, string>;
}): ExtractedEntity {
  const label = normalizeLabel(input.label);
  if (!label) throw new Error("ExtractedEntity label is required");

  const entity: ExtractedEntity = {
    id: stableId("ent", `${input.kind}|${label}|${input.sourceHint}`),
    kind: input.kind,
    label,
    aliases: [...new Set((input.aliases ?? []).map(normalizeLabel).filter(Boolean))],
    evidence: normalizeLabel(input.evidence),
    span: input.span,
    confidence: round2(Math.min(1, Math.max(0, input.confidence ?? 0.8))),
    sourceHint: input.sourceHint.trim(),
    properties: Object.freeze({ ...(input.properties ?? {}) }),
    readOnly: true,
  };

  const validated = validateExtractedEntity(entity);
  if (!validated.ok) {
    throw new Error(
      `Invalid ExtractedEntity: ${validated.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
  return entity;
}

export function buildEntityRelationCandidate(input: {
  kind: KnowledgeEdgeKind;
  from: ExtractedEntity;
  to: ExtractedEntity;
  label?: string;
  weight?: number;
  confidence?: number;
  evidence?: string;
}): EntityRelationCandidate {
  const relation: EntityRelationCandidate = {
    id: stableId("rel", `${input.kind}|${input.from.id}|${input.to.id}`),
    kind: input.kind,
    fromEntityId: input.from.id,
    toEntityId: input.to.id,
    label: normalizeLabel(input.label ?? `${input.from.label} → ${input.to.label}`),
    weight: round2(Math.max(0, input.weight ?? 1)),
    confidence: round2(Math.min(1, Math.max(0, input.confidence ?? 0.8))),
    evidence: normalizeLabel(
      input.evidence ?? `${input.from.sourceHint}+${input.to.sourceHint}`,
    ),
    readOnly: true,
  };

  const validated = validateEntityRelationCandidate(
    relation,
    new Set([input.from.id, input.to.id]),
  );
  if (!validated.ok) {
    throw new Error(
      `Invalid EntityRelationCandidate: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
  return relation;
}

export function extractEntitiesFromContent(input: ExtractionKernelInput): ExtractedEntity[] {
  const text = input.rawText.trim();
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  const push = (entity: ExtractedEntity) => {
    if (seen.has(entity.id)) return;
    seen.add(entity.id);
    entities.push(entity);
  };

  if (input.projectHint?.trim()) {
    push(
      buildExtractedEntity({
        kind: "project",
        label: input.projectHint,
        evidence: "projectHint",
        sourceHint: "project-hint",
        confidence: 0.97,
        span: makeSpan(text, input.projectHint.trim()),
      }),
    );
  }

  if (input.organizationHint?.trim()) {
    push(
      buildExtractedEntity({
        kind: "organization",
        label: input.organizationHint,
        evidence: "organizationHint",
        sourceHint: "organization-hint",
        confidence: 0.97,
        span: makeSpan(text, input.organizationHint.trim()),
      }),
    );
  }

  for (const rule of FIELD_RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (!match?.[1]?.trim()) continue;
      const label = normalizeLabel(
        rule.labelFromMatch ? rule.labelFromMatch(match) : match[1],
      );
      push(
        buildExtractedEntity({
          kind: rule.kind,
          label,
          evidence: rule.evidenceFromMatch?.(match) ?? match[0].trim(),
          sourceHint: rule.sourceHint,
          confidence: rule.confidence,
          span: makeSpan(text, match[0].trim()),
          aliases: rule.aliasesFromMatch?.(match, text),
          properties: rule.propertiesFromMatch?.(match),
        }),
      );
      break;
    }
  }

  for (const rule of CONTENT_RULES) {
    if (!rule.test.test(text)) continue;
    const label =
      typeof rule.label === "function" ? rule.label(text) : rule.label;
    const aliases =
      typeof rule.aliases === "function" ? rule.aliases(text) : rule.aliases;
    const properties =
      typeof rule.properties === "function" ? rule.properties(text) : rule.properties;
    const evidence =
      typeof rule.evidence === "function" ? rule.evidence(text) : rule.evidence;

    push(
      buildExtractedEntity({
        kind: rule.kind,
        label,
        evidence,
        sourceHint: rule.sourceHint,
        confidence: rule.confidence,
        aliases,
        properties,
      }),
    );
  }

  // Quantitative requirement snippets as additional requirement entities
  const qtyPatterns: Array<{ re: RegExp; label: string }> = [
    { re: /跑步机不少于\s*([0-9]+)\s*台/, label: "跑步机数量要求" },
    { re: /面积不小于\s*([0-9]+)\s*㎡/, label: "场地面积要求" },
    { re: /净高不低于\s*([0-9]+(?:\.[0-9]+)?)\s*m/, label: "净高要求" },
    { re: /([0-9]+)\s*年质保/, label: "质保年限要求" },
  ];
  for (const q of qtyPatterns) {
    const match = text.match(q.re);
    if (!match) continue;
    push(
      buildExtractedEntity({
        kind: "requirement",
        label: `${q.label}（${match[1]}）`,
        evidence: match[0],
        sourceHint: "quantity-requirement",
        confidence: 0.91,
        span: makeSpan(text, match[0]),
        properties: { value: match[1] },
      }),
    );
  }

  if (entities.length < 1) {
    throw new Error("Extraction produced no entities");
  }

  return entities;
}

function byKind(
  entities: ExtractedEntity[],
  kind: KnowledgeNodeKind,
): ExtractedEntity | undefined {
  return entities.find((e) => e.kind === kind);
}

export function buildRelationCandidates(
  entities: ExtractedEntity[],
): EntityRelationCandidate[] {
  const relations: EntityRelationCandidate[] = [];
  const seen = new Set<string>();

  const push = (relation: EntityRelationCandidate) => {
    if (seen.has(relation.id)) return;
    seen.add(relation.id);
    relations.push(relation);
  };

  const project = byKind(entities, "project");
  const org = byKind(entities, "organization");
  const location = byKind(entities, "location");
  const requirement = byKind(entities, "requirement");
  const equipment = byKind(entities, "equipment");
  const standard = byKind(entities, "standard");
  const budget = byKind(entities, "budget");
  const deliverable = byKind(entities, "deliverable");
  const clause = byKind(entities, "clause");

  if (project && org) {
    push(
      buildEntityRelationCandidate({
        kind: "owns",
        from: org,
        to: project,
        label: "招标人拥有项目",
        confidence: 0.95,
      }),
    );
  }
  if (project && location) {
    push(
      buildEntityRelationCandidate({
        kind: "located_in",
        from: project,
        to: location,
        label: "项目建设地点",
        confidence: 0.93,
      }),
    );
  }
  if (project && requirement) {
    push(
      buildEntityRelationCandidate({
        kind: "requires",
        from: project,
        to: requirement,
        label: "项目包含需求",
        confidence: 0.9,
      }),
    );
  }
  if (requirement && equipment) {
    push(
      buildEntityRelationCandidate({
        kind: "requires",
        from: requirement,
        to: equipment,
        label: "需求约束设备",
        confidence: 0.88,
      }),
    );
  }
  if (equipment && standard) {
    push(
      buildEntityRelationCandidate({
        kind: "references",
        from: equipment,
        to: standard,
        label: "设备引用标准",
        confidence: 0.92,
      }),
    );
  }
  if (project && budget) {
    push(
      buildEntityRelationCandidate({
        kind: "constrains",
        from: budget,
        to: project,
        label: "预算约束项目",
        confidence: 0.9,
      }),
    );
  }
  if (project && deliverable) {
    push(
      buildEntityRelationCandidate({
        kind: "requires",
        from: project,
        to: deliverable,
        label: "项目要求交付成果",
        confidence: 0.87,
      }),
    );
  }
  if (clause && project) {
    push(
      buildEntityRelationCandidate({
        kind: "constrains",
        from: clause,
        to: project,
        label: "条款约束项目",
        confidence: 0.86,
      }),
    );
  }

  // Link quantitative requirements to parent requirement / project
  const qtyReqs = entities.filter(
    (e) => e.kind === "requirement" && e.sourceHint === "quantity-requirement",
  );
  for (const qty of qtyReqs) {
    if (requirement) {
      push(
        buildEntityRelationCandidate({
          kind: "belongs_to",
          from: qty,
          to: requirement,
          label: "量化需求归属需求簇",
          confidence: 0.84,
          weight: 0.8,
        }),
      );
    } else if (project) {
      push(
        buildEntityRelationCandidate({
          kind: "requires",
          from: project,
          to: qty,
          label: "项目量化需求",
          confidence: 0.84,
          weight: 0.8,
        }),
      );
    }
  }

  return relations;
}

export function toKnowledgeSeeds(input: {
  entities: ExtractedEntity[];
  relations: EntityRelationCandidate[];
}): { nodeSeeds: KnowledgeSeedNode[]; edgeSeeds: KnowledgeSeedEdge[] } {
  const nodeSeeds: KnowledgeSeedNode[] = input.entities.map((e) => ({
    kind: e.kind,
    label: e.label,
    aliases: [...e.aliases],
    properties: { ...e.properties, evidence: e.evidence, sourceHint: e.sourceHint },
    sourceHint: e.sourceHint,
    confidence: e.confidence,
  }));

  const byId = new Map(input.entities.map((e) => [e.id, e]));
  const edgeSeeds: KnowledgeSeedEdge[] = [];
  for (const rel of input.relations) {
    const from = byId.get(rel.fromEntityId);
    const to = byId.get(rel.toEntityId);
    if (!from || !to) continue;
    edgeSeeds.push({
      kind: rel.kind,
      fromLabel: from.label,
      toLabel: to.label,
      label: rel.label,
      weight: rel.weight,
      properties: { confidence: String(rel.confidence), evidence: rel.evidence },
    });
  }

  return { nodeSeeds, edgeSeeds };
}

export function buildKnowledgeGraphCandidatePack(input: {
  entities: ExtractedEntity[];
  relations: EntityRelationCandidate[];
  titleHint?: string;
}): KnowledgeGraphCandidatePack {
  const createdAt = nowIso();
  const { nodeSeeds, edgeSeeds } = toKnowledgeSeeds(input);
  const kindCoverage = [...new Set(input.entities.map((e) => e.kind))];
  const title =
    input.titleHint?.trim() ||
    input.entities.find((e) => e.kind === "project")?.label ||
    "Knowledge Graph Candidates";

  const status: KnowledgeGraphCandidatePack["status"] =
    input.entities.length >= 2 && input.relations.length >= 1 ? "ready" : "extracted";

  const pack: KnowledgeGraphCandidatePack = {
    id: stableId(
      "cand",
      `${title}|${input.entities.map((e) => e.id).join("|")}|${input.relations.map((r) => r.id).join("|")}`,
    ),
    status,
    title,
    entityCount: input.entities.length,
    relationCount: input.relations.length,
    kindCoverage,
    entities: input.entities,
    relations: input.relations,
    nodeSeeds,
    edgeSeeds,
    summary: [
      `entities=${input.entities.length}`,
      `relations=${input.relations.length}`,
      `kinds=${kindCoverage.length}`,
      `seeds=${nodeSeeds.length}/${edgeSeeds.length}`,
      `status=${status}`,
    ].join(" "),
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  assertValidCandidatePack(pack);
  return pack;
}

function pushTransition(
  transitions: ExtractionLifecycleTransition[],
  from: ExtractionLifecycleStage,
  to: ExtractionLifecycleStage,
  note?: string,
): void {
  transitions.push({
    from,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  });
}

export function buildExtractionLifecycle(input: {
  contentLength: number;
  entities: ExtractedEntity[];
  candidates: KnowledgeGraphCandidatePack | null;
}): ExtractionLifecycle {
  const transitions: ExtractionLifecycleTransition[] = [];
  let current: ExtractionLifecycleStage = "content";

  if (input.contentLength > 0 && input.entities.length > 0) {
    pushTransition(
      transitions,
      "content",
      "entities",
      `entities=${input.entities.length}`,
    );
    current = "entities";
  }

  if (input.candidates) {
    pushTransition(
      transitions,
      current,
      "candidates",
      `status=${input.candidates.status}|relations=${input.candidates.relationCount}`,
    );
    current = "candidates";
  }

  const complete =
    input.candidates !== null &&
    input.candidates.status === "ready" &&
    input.entities.length >= 2 &&
    input.candidates.relationCount >= 1 &&
    current === "candidates";

  return {
    current,
    stages: [...EXTRACTION_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildExtractionKernel(
  input: ExtractionKernelInput,
): ExtractionKernelResult {
  const validated = validateExtractionKernelInput(input);
  if (!validated.ok) {
    throw new Error(
      `Invalid extraction kernel input: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }

  const deploymentId = input.deploymentId?.trim() || "v102-p2-extraction-default";
  const generatedAt = nowIso();
  const contentLength = input.rawText.trim().length;

  const entities = extractEntitiesFromContent(input);
  const relations = buildRelationCandidates(entities);
  const candidates = buildKnowledgeGraphCandidatePack({
    entities,
    relations,
    titleHint: input.titleHint,
  });
  const lifecycle = buildExtractionLifecycle({
    contentLength,
    entities,
    candidates,
  });
  const ready = lifecycle.complete;

  return {
    version: V102_KNOWLEDGE_EXTRACTION_VERSION,
    freezeVersion: V102_KNOWLEDGE_EXTRACTION_FREEZE_VERSION,
    reportId: `knowledge-extraction-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    contentLength,
    entities,
    relations,
    candidates,
    lifecycle,
    ready,
    readinessScore: ready
      ? 100
      : Math.min(90, Math.round((entities.length + relations.length) * 6)),
    summary: [
      `knowledge-extraction ready=${ready}`,
      `entities=${entities.length}`,
      `relations=${relations.length}`,
      `candidates=${candidates.status}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V102_KNOWLEDGE_EXTRACTION_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertExtractionKernelPass(
  result: ExtractionKernelResult,
): asserts result is ExtractionKernelResult & {
  ready: true;
  candidates: KnowledgeGraphCandidatePack;
} {
  if (!result.ready || !result.candidates) {
    throw new Error(`V102 knowledge extraction kernel not ready: ${result.summary}`);
  }
}
