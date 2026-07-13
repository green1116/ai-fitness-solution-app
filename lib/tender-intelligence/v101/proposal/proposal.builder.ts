/**
 * E01-P5 — AI Proposal Intelligence builder
 * Builds BidStrategy + RequirementIndex → ProposalBlueprint lifecycle
 */

import { createHash, randomUUID } from "node:crypto";

import type { RequirementIndex } from "../understanding/understanding.types";
import type { BidStrategy, ProposalEmphasis } from "../strategy/strategy.types";
import {
  assertValidStrategyAndRequirements,
  PROPOSAL_LIFECYCLE_STAGES,
  validateProposalBlueprint,
} from "./proposal.schema";
import type {
  ProposalBlueprint,
  ProposalChapter,
  ProposalChapterKind,
  ProposalEvidenceNeed,
  ProposalKernelInput,
  ProposalKernelResult,
  ProposalLifecycle,
  ProposalLifecycleStage,
  ProposalLifecycleTransition,
  RequirementCoverageItem,
  RequirementCoverageStatus,
} from "./proposal.types";
import {
  V101_PROPOSAL_INTELLIGENCE_FREEZE_VERSION,
  V101_PROPOSAL_INTELLIGENCE_VERSION,
} from "./proposal.types";

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

type ChapterTemplate = {
  kind: ProposalChapterKind;
  title: string;
  ownerHint: string;
  categoryHints: string[];
  emphasisHints: ProposalEmphasis[];
  outline: string[];
};

const CHAPTER_TEMPLATES: ChapterTemplate[] = [
  {
    kind: "executive_summary",
    title: "执行摘要",
    ownerHint: "proposal-lead",
    categoryHints: ["functional", "other"],
    emphasisHints: ["differentiation"],
    outline: ["项目理解一句话", "核心价值主张", "投标姿态与胜出逻辑"],
  },
  {
    kind: "understanding",
    title: "需求理解与响应框架",
    ownerHint: "solution-architect",
    categoryHints: ["functional", "space"],
    emphasisHints: ["differentiation", "delivery"],
    outline: ["招标目标重述", "关键需求分层", "响应原则"],
  },
  {
    kind: "technical_solution",
    title: "技术方案",
    ownerHint: "technical-lead",
    categoryHints: ["technical", "functional"],
    emphasisHints: ["equipment", "differentiation"],
    outline: ["总体技术路线", "分区功能设计", "标准与性能指标"],
  },
  {
    kind: "equipment_plan",
    title: "设备配置方案",
    ownerHint: "equipment-specialist",
    categoryHints: ["equipment"],
    emphasisHints: ["equipment"],
    outline: ["设备清单逻辑", "品牌/规格匹配", "质保与售后"],
  },
  {
    kind: "commercial_offer",
    title: "商务与报价策略",
    ownerHint: "commercial-owner",
    categoryHints: ["budget", "deliverable"],
    emphasisHints: ["commercial"],
    outline: ["报价姿态", "与限价对齐说明", "付款与商务条款"],
  },
  {
    kind: "delivery_plan",
    title: "交付与实施计划",
    ownerHint: "delivery-pm",
    categoryHints: ["schedule", "deliverable"],
    emphasisHints: ["delivery"],
    outline: ["里程碑", "资源投入", "验收与移交"],
  },
  {
    kind: "compliance_matrix",
    title: "合规与强制条款应答矩阵",
    ownerHint: "compliance-owner",
    categoryHints: ["compliance", "technical"],
    emphasisHints: ["compliance"],
    outline: ["must 条款映射", "证据索引", "偏差说明（如有）"],
  },
  {
    kind: "appendix",
    title: "附件与证据包",
    ownerHint: "documentation",
    categoryHints: ["other", "deliverable"],
    emphasisHints: ["compliance", "delivery"],
    outline: ["证照清单", "案例与检测报告", "补充材料"],
  },
];

function chapterEmphasis(
  template: ChapterTemplate,
  strategy: BidStrategy,
): ProposalEmphasis[] {
  const merged = [...template.emphasisHints, ...strategy.emphasis.filter((e) =>
    template.emphasisHints.includes(e) || e === "differentiation",
  )];
  return [...new Set(merged)].slice(0, 3);
}

function coverageStatusFor(
  priority: string,
  matched: boolean,
  strategyEmphasis: ProposalEmphasis[],
  chapterKind: ProposalChapterKind,
): RequirementCoverageStatus {
  if (!matched) return "gap";
  if (priority === "must") {
    if (chapterKind === "compliance_matrix" || strategyEmphasis.includes("compliance")) {
      return "covered";
    }
    return "partial";
  }
  return "covered";
}

function responseHintFor(
  status: RequirementCoverageStatus,
  text: string,
): string {
  if (status === "covered") return `在对应章节完整应答：${text.slice(0, 48)}`;
  if (status === "partial") return `补充证据与量化指标后闭环：${text.slice(0, 48)}`;
  return `标记缺口并安排专章补齐：${text.slice(0, 48)}`;
}

export function buildProposalBlueprint(input: {
  strategy: BidStrategy;
  requirementIndex: RequirementIndex;
  titleHint?: string;
}): ProposalBlueprint {
  assertValidStrategyAndRequirements(input.strategy, input.requirementIndex);

  const strategy = input.strategy;
  const index = input.requirementIndex;
  const createdAt = nowIso();

  const chapters: ProposalChapter[] = CHAPTER_TEMPLATES.map((template, order) => {
    const linked = index.entries
      .filter((entry) => template.categoryHints.includes(entry.category))
      .map((entry) => entry.id);

    // Ensure every requirement is linked to at least one chapter later via coverage.
    return {
      id: stableId("ch", `${strategy.id}|${template.kind}`),
      kind: template.kind,
      title: template.title,
      order,
      emphasis: chapterEmphasis(template, strategy),
      outline: [...template.outline, ...strategy.narrativeThemes.slice(0, 1)],
      linkedRequirementIds: linked,
      ownerHint: template.ownerHint,
      readOnly: true as const,
    };
  });

  const coverage: RequirementCoverageItem[] = index.entries.map((entry) => {
    const preferredChapter =
      chapters.find((ch) => ch.linkedRequirementIds.includes(entry.id)) ??
      chapters.find((ch) => ch.kind === "compliance_matrix") ??
      chapters[0]!;

    const matched = preferredChapter.linkedRequirementIds.includes(entry.id);
    // If not in linked list, attach for coverage tracking.
    if (!matched) {
      preferredChapter.linkedRequirementIds.push(entry.id);
    }

    const status = coverageStatusFor(
      entry.priority,
      true,
      strategy.emphasis,
      preferredChapter.kind,
    );

    return {
      id: stableId("cov", `${preferredChapter.id}|${entry.id}`),
      requirementId: entry.id,
      chapterId: preferredChapter.id,
      status,
      responseHint: responseHintFor(status, entry.text),
      priorityWeight: entry.priority === "must" ? 1 : entry.priority === "preferred" ? 0.6 : 0.3,
      readOnly: true as const,
    };
  });

  const mustEntries = index.entries.filter((e) => e.priority === "must");
  const coveredMustCount = coverage.filter((c) => {
    const entry = index.entries.find((e) => e.id === c.requirementId);
    return entry?.priority === "must" && c.status !== "gap";
  }).length;

  const coveredWeight = coverage
    .filter((c) => c.status !== "gap")
    .reduce((sum, c) => sum + c.priorityWeight, 0);
  const totalWeight = coverage.reduce((sum, c) => sum + c.priorityWeight, 0) || 1;
  const coverageRatio = round2(coveredWeight / totalWeight);

  const evidenceNeeds: ProposalEvidenceNeed[] = [];
  for (const buffer of strategy.riskBuffers) {
    if (buffer.severity === "low") continue;
    const relatedChapters = chapters
      .filter((ch) =>
        buffer.label.match(/合规|compliance/i)
          ? ch.kind === "compliance_matrix" || ch.kind === "appendix"
          : buffer.label.match(/预算|报价|commercial/i)
            ? ch.kind === "commercial_offer"
            : ch.kind === "delivery_plan" || ch.kind === "technical_solution",
      )
      .map((ch) => ch.id);

    evidenceNeeds.push({
      id: stableId("ev", `${strategy.id}|${buffer.id}`),
      label: buffer.label,
      severity: buffer.severity,
      relatedChapterIds: relatedChapters.length > 0 ? relatedChapters : [chapters[0]!.id],
      relatedRequirementIds: mustEntries.slice(0, 3).map((e) => e.id),
      readOnly: true,
    });
  }

  if (evidenceNeeds.length === 0) {
    evidenceNeeds.push({
      id: stableId("ev", `${strategy.id}|baseline`),
      label: "标准证据包",
      severity: "low",
      relatedChapterIds: [chapters.find((c) => c.kind === "appendix")!.id],
      relatedRequirementIds: index.entries.slice(0, 3).map((e) => e.id),
      readOnly: true,
    });
  }

  const narrativeArc = [
    ...strategy.narrativeThemes.slice(0, 3),
    `姿态：${strategy.posture} · 报价：${strategy.pricingStance}`,
    `覆盖率：${Math.round(coverageRatio * 100)}% · must 覆盖 ${coveredMustCount}/${mustEntries.length || 0}`,
  ];

  const blueprint: ProposalBlueprint = {
    id: stableId("blueprint", `${strategy.id}|${index.id}|${createdAt}`),
    strategyId: strategy.id,
    requirementIndexId: index.id,
    opportunityId: strategy.opportunityId,
    workspaceId: strategy.workspaceId,
    status: "ready",
    title: input.titleHint?.trim() || `投标方案蓝图 · ${strategy.posture}`,
    chapterCount: chapters.length,
    coverageCount: coverage.length,
    coveredMustCount,
    coverageRatio,
    chapters,
    coverage,
    evidenceNeeds,
    narrativeArc,
    summary: `chapters=${chapters.length} coverage=${coverage.length} ratio=${coverageRatio} must=${coveredMustCount}`,
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  const validated = validateProposalBlueprint(blueprint);
  if (!validated.ok) {
    throw new Error(
      `Invalid ProposalBlueprint: ${validated.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
  return blueprint;
}

function pushTransition(
  transitions: ProposalLifecycleTransition[],
  from: ProposalLifecycleStage,
  to: ProposalLifecycleStage,
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

export function buildProposalLifecycle(input: {
  blueprint: ProposalBlueprint | null;
}): ProposalLifecycle {
  const transitions: ProposalLifecycleTransition[] = [];
  let current: ProposalLifecycleStage = "strategy";

  if (input.blueprint) {
    pushTransition(
      transitions,
      "strategy",
      "blueprint",
      `chapters=${input.blueprint.chapterCount}|coverage=${input.blueprint.coverageRatio}`,
    );
    current = "blueprint";
  }

  const complete =
    input.blueprint !== null &&
    input.blueprint.status === "ready" &&
    current === "blueprint";

  return {
    current,
    stages: [...PROPOSAL_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildProposalKernel(input: ProposalKernelInput): ProposalKernelResult {
  const deploymentId = input.deploymentId?.trim() || "v101-p5-proposal-default";
  const generatedAt = nowIso();

  assertValidStrategyAndRequirements(input.strategy, input.requirementIndex);

  const blueprint = buildProposalBlueprint({
    strategy: input.strategy,
    requirementIndex: input.requirementIndex,
    titleHint: input.titleHint,
  });

  const lifecycle = buildProposalLifecycle({ blueprint });
  const ready = lifecycle.complete;

  return {
    version: V101_PROPOSAL_INTELLIGENCE_VERSION,
    freezeVersion: V101_PROPOSAL_INTELLIGENCE_FREEZE_VERSION,
    reportId: `proposal-intelligence-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    strategy: input.strategy,
    requirementIndex: input.requirementIndex,
    blueprint,
    lifecycle,
    ready,
    readinessScore: ready ? 100 : 0,
    summary: [
      `proposal-intelligence ready=${ready}`,
      `strategy=${input.strategy.posture}`,
      `requirements=${input.requirementIndex.entryCount}`,
      `chapters=${blueprint.chapterCount}`,
      `coverage=${blueprint.coverageRatio}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V101_PROPOSAL_INTELLIGENCE_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertProposalKernelPass(
  result: ProposalKernelResult,
): asserts result is ProposalKernelResult & {
  ready: true;
  blueprint: ProposalBlueprint;
} {
  if (!result.ready || !result.blueprint) {
    throw new Error(`V101 proposal intelligence kernel not ready: ${result.summary}`);
  }
}
