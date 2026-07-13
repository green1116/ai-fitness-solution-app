/**
 * E01-P2 — Tender Document Understanding builder
 * Builds TenderWorkspace → DocumentStructure → RequirementIndex lifecycle
 */

import { createHash, randomUUID } from "node:crypto";

import type { TenderWorkspace } from "../intake/intake.types";
import {
  assertValidWorkspace,
  UNDERSTANDING_LIFECYCLE_STAGES,
  validateDocumentStructure,
  validateRequirementIndex,
} from "./understanding.schema";
import type {
  DocumentSection,
  DocumentSectionKind,
  DocumentStructure,
  RequirementCategory,
  RequirementIndex,
  RequirementIndexEntry,
  RequirementPriority,
  UnderstandingKernelInput,
  UnderstandingKernelResult,
  UnderstandingLifecycle,
  UnderstandingLifecycleStage,
  UnderstandingLifecycleTransition,
} from "./understanding.types";
import {
  V101_TENDER_UNDERSTANDING_FREEZE_VERSION,
  V101_TENDER_UNDERSTANDING_VERSION,
} from "./understanding.types";

function nowIso(): string {
  return new Date().toISOString();
}

function stableId(prefix: string, seed: string): string {
  const hash = createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return `${prefix}_${hash}`;
}

type HeuristicSection = {
  kind: DocumentSectionKind;
  title: string;
  patterns: RegExp[];
  categoryHints: RequirementCategory[];
};

const SECTION_HEURISTICS: HeuristicSection[] = [
  {
    kind: "cover",
    title: "项目概述",
    patterns: [/项目名称/, /招标人/, /建设地点/, /project\s*name/i],
    categoryHints: ["functional"],
  },
  {
    kind: "scope",
    title: "建设范围与目标",
    patterns: [/项目目标/, /建设范围/, /scope/i, /objectives?/i],
    categoryHints: ["functional", "space"],
  },
  {
    kind: "technical",
    title: "技术标准与功能需求",
    patterns: [/技术标准/, /功能需求/, /技术要求/, /technical/i, /equipment/i, /器械/, /面积/],
    categoryHints: ["technical", "equipment", "space"],
  },
  {
    kind: "commercial",
    title: "商务与预算",
    patterns: [/商务/, /预算/, /限价/, /budget/i, /commercial/i],
    categoryHints: ["budget", "schedule"],
  },
  {
    kind: "evaluation",
    title: "评标办法",
    patterns: [/评标/, /评分/, /evaluation/i, /score/i],
    categoryHints: ["compliance", "deliverable"],
  },
  {
    kind: "appendix",
    title: "交付成果与附件",
    patterns: [/交付成果/, /附件/, /deliverable/i, /appendix/i],
    categoryHints: ["deliverable", "other"],
  },
];

function detectLanguage(rawText: string | undefined, hint?: "zh" | "en" | "mixed"): "zh" | "en" | "mixed" {
  if (hint) return hint;
  if (!rawText?.trim()) return "zh";
  const hasZh = /[\u4e00-\u9fa5]/.test(rawText);
  const hasEn = /[A-Za-z]{3,}/.test(rawText);
  if (hasZh && hasEn) return "mixed";
  if (hasEn && !hasZh) return "en";
  return "zh";
}

function splitBlocks(rawText: string | undefined): string[] {
  if (!rawText?.trim()) return [];
  return rawText
    .split(/\n{2,}|(?=^[一二三四五六七八九十]+[、.．])/m)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
}

function inferSectionKind(block: string, index: number): HeuristicSection {
  for (const heuristic of SECTION_HEURISTICS) {
    if (heuristic.patterns.some((p) => p.test(block))) return heuristic;
  }
  if (index === 0) return SECTION_HEURISTICS[0]!;
  return {
    kind: "other",
    title: `章节 ${index + 1}`,
    patterns: [],
    categoryHints: ["other"],
  };
}

function extractRequirementLines(block: string): string[] {
  const lines = block
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const numbered = lines.filter((l) => /^(\d+[\.、]|[-*•]|（?\d+）)/.test(l));
  if (numbered.length > 0) return numbered;

  return lines.filter((l) => l.length >= 8 && !/^第[一二三四五六七八九十]+[章节部分]/.test(l)).slice(0, 6);
}

function inferPriority(text: string): RequirementPriority {
  if (/必须|不少于|不低于|shall|must|mandatory/i.test(text)) return "must";
  if (/宜|建议|优先|preferred|should/i.test(text)) return "preferred";
  return "optional";
}

function inferCategory(text: string, hints: RequirementCategory[]): RequirementCategory {
  if (/器械|设备|跑步机|equipment/i.test(text)) return "equipment";
  if (/面积|㎡|平方米|净高|space/i.test(text)) return "space";
  if (/标准|国标|合规|compliance|GB\//i.test(text)) return "compliance";
  if (/预算|限价|万元|budget|price/i.test(text)) return "budget";
  if (/截止|工期|交付|schedule|deadline/i.test(text)) return "schedule";
  if (/方案书|清单|报告|deliverable/i.test(text)) return "deliverable";
  if (/技术|功能|technical|functional/i.test(text)) {
    return /功能/.test(text) ? "functional" : "technical";
  }
  return hints[0] ?? "other";
}

export function buildDocumentStructure(input: {
  workspace: TenderWorkspace;
  rawText?: string;
  languageHint?: "zh" | "en" | "mixed";
}): DocumentStructure {
  assertValidWorkspace(input.workspace);
  const createdAt = nowIso();
  const blocks = splitBlocks(input.rawText);

  const sections: DocumentSection[] = [];
  if (blocks.length === 0) {
    sections.push({
      id: stableId("sec", `${input.workspace.id}|cover`),
      kind: "cover",
      title: input.workspace.title || "项目概述",
      order: 0,
      pageStart: 1,
      pageEnd: 1,
      excerpt: input.workspace.title,
      readOnly: true,
    });
  } else {
    blocks.forEach((block, index) => {
      const heuristic = inferSectionKind(block, index);
      sections.push({
        id: stableId("sec", `${input.workspace.id}|${index}|${heuristic.kind}`),
        kind: heuristic.kind,
        title: heuristic.title,
        order: index,
        pageStart: index + 1,
        pageEnd: index + 1,
        excerpt: block.slice(0, 160),
        readOnly: true,
      });
    });
  }

  const structure: DocumentStructure = {
    id: stableId("struct", `${input.workspace.id}|${createdAt}`),
    workspaceId: input.workspace.id,
    title: input.workspace.title,
    sectionCount: sections.length,
    sections,
    language: detectLanguage(input.rawText, input.languageHint),
    status: "structured",
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  const validated = validateDocumentStructure(structure);
  if (!validated.ok) {
    throw new Error(
      `Invalid DocumentStructure: ${validated.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
  return structure;
}

export function buildRequirementIndex(input: {
  workspace: TenderWorkspace;
  structure: DocumentStructure;
  rawText?: string;
}): RequirementIndex {
  assertValidWorkspace(input.workspace);
  if (input.structure.workspaceId !== input.workspace.id) {
    throw new Error("RequirementIndex structure.workspaceId must match workspace.id");
  }

  const createdAt = nowIso();
  const blocks = splitBlocks(input.rawText);
  const entries: RequirementIndexEntry[] = [];

  input.structure.sections.forEach((section, index) => {
    const block = blocks[index] ?? section.excerpt ?? section.title;
    const heuristic =
      SECTION_HEURISTICS.find((h) => h.kind === section.kind) ??
      ({ kind: section.kind, title: section.title, patterns: [], categoryHints: ["other"] as RequirementCategory[] });

    const lines = extractRequirementLines(block);
    const sourceLines = lines.length > 0 ? lines : [block.slice(0, 120)];

    sourceLines.forEach((line, lineIndex) => {
      const text = line.replace(/^(\d+[\.、]|[-*•]|（?\d+）)\s*/, "").trim();
      if (!text) return;
      const priority = inferPriority(text);
      const category = inferCategory(text, heuristic.categoryHints);
      entries.push({
        id: stableId("req", `${section.id}|${lineIndex}|${text.slice(0, 24)}`),
        sectionId: section.id,
        category,
        priority,
        text,
        pageRef: section.pageStart,
        tags: [section.kind, category, priority],
        readOnly: true,
      });
    });
  });

  const mustCount = entries.filter((e) => e.priority === "must").length;
  const preferredCount = entries.filter((e) => e.priority === "preferred").length;
  const optionalCount = entries.filter((e) => e.priority === "optional").length;

  const index: RequirementIndex = {
    id: stableId("reqidx", `${input.structure.id}|${createdAt}`),
    structureId: input.structure.id,
    workspaceId: input.workspace.id,
    entryCount: entries.length,
    mustCount,
    preferredCount,
    optionalCount,
    entries,
    status: "ready",
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  const validated = validateRequirementIndex(index);
  if (!validated.ok) {
    throw new Error(
      `Invalid RequirementIndex: ${validated.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
  if (index.entryCount < 1) {
    throw new Error("RequirementIndex must contain at least one entry");
  }
  return index;
}

function pushTransition(
  transitions: UnderstandingLifecycleTransition[],
  from: UnderstandingLifecycleStage,
  to: UnderstandingLifecycleStage,
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

export function buildUnderstandingLifecycle(input: {
  structure: DocumentStructure | null;
  requirementIndex: RequirementIndex | null;
}): UnderstandingLifecycle {
  const transitions: UnderstandingLifecycleTransition[] = [];
  let current: UnderstandingLifecycleStage = "workspace";

  if (input.structure) {
    pushTransition(transitions, "workspace", "structure", `structure=${input.structure.id}`);
    current = "structure";
  }

  if (input.requirementIndex) {
    pushTransition(
      transitions,
      "structure",
      "requirements",
      `requirements=${input.requirementIndex.entryCount}`,
    );
    current = "requirements";
  }

  const complete =
    input.structure !== null &&
    input.requirementIndex !== null &&
    input.requirementIndex.status === "ready" &&
    current === "requirements";

  return {
    current,
    stages: [...UNDERSTANDING_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildUnderstandingKernel(
  input: UnderstandingKernelInput,
): UnderstandingKernelResult {
  const deploymentId = input.deploymentId?.trim() || "v101-p2-understanding-default";
  const generatedAt = nowIso();

  assertValidWorkspace(input.workspace);

  const structure = buildDocumentStructure({
    workspace: input.workspace,
    rawText: input.rawText,
    languageHint: input.languageHint,
  });

  const requirementIndex = buildRequirementIndex({
    workspace: input.workspace,
    structure,
    rawText: input.rawText,
  });

  const lifecycle = buildUnderstandingLifecycle({ structure, requirementIndex });
  const ready = lifecycle.complete;

  return {
    version: V101_TENDER_UNDERSTANDING_VERSION,
    freezeVersion: V101_TENDER_UNDERSTANDING_FREEZE_VERSION,
    reportId: `tender-understanding-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    workspace: input.workspace,
    structure,
    requirementIndex,
    lifecycle,
    ready,
    readinessScore: ready ? 100 : 0,
    summary: [
      `tender-understanding ready=${ready}`,
      `workspace=${input.workspace.id}`,
      `sections=${structure.sectionCount}`,
      `requirements=${requirementIndex.entryCount}`,
      `must=${requirementIndex.mustCount}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V101_TENDER_UNDERSTANDING_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertUnderstandingKernelPass(
  result: UnderstandingKernelResult,
): asserts result is UnderstandingKernelResult & {
  ready: true;
  structure: DocumentStructure;
  requirementIndex: RequirementIndex;
} {
  if (!result.ready || !result.structure || !result.requirementIndex) {
    throw new Error(`V101 tender understanding kernel not ready: ${result.summary}`);
  }
}
