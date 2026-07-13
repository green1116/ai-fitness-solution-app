/**
 * E01-P4 — AI Bid Strategy builder
 * Builds OpportunityProfile → BidStrategy lifecycle
 */

import { createHash, randomUUID } from "node:crypto";

import type { OpportunityProfile } from "../intelligence/intelligence.types";
import {
  assertValidOpportunityProfile,
  postureFromOpportunity,
  pricingStanceFromPosture,
  STRATEGY_LIFECYCLE_STAGES,
  validateBidStrategy,
} from "./strategy.schema";
import type {
  BidStrategy,
  ProposalEmphasis,
  StrategyKernelInput,
  StrategyKernelResult,
  StrategyLifecycle,
  StrategyLifecycleStage,
  StrategyLifecycleTransition,
  StrategyRiskBuffer,
  StrategyWorkstream,
} from "./strategy.types";
import {
  V101_BID_STRATEGY_FREEZE_VERSION,
  V101_BID_STRATEGY_VERSION,
} from "./strategy.types";

function nowIso(): string {
  return new Date().toISOString();
}

function stableId(prefix: string, seed: string): string {
  const hash = createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return `${prefix}_${hash}`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function deriveEmphasis(
  opportunity: OpportunityProfile,
  preferred?: ProposalEmphasis[],
): ProposalEmphasis[] {
  if (preferred && preferred.length > 0) {
    return [...new Set(preferred)].slice(0, 4);
  }

  const emphasis: ProposalEmphasis[] = ["differentiation"];
  const gapLabels = opportunity.gaps.map((g) => g.label.toLowerCase());

  if (gapLabels.some((l) => /合规|compliance/.test(l))) emphasis.unshift("compliance");
  if (gapLabels.some((l) => /预算|budget|报价/.test(l))) emphasis.push("commercial");
  if (opportunity.strengths.some((s) => /equipment|器械|设备/.test(s.toLowerCase()))) {
    emphasis.push("equipment");
  }
  if (opportunity.recommendedActions.some((a) => /交付|排期|delivery/.test(a))) {
    emphasis.push("delivery");
  }

  if (!emphasis.includes("commercial") && opportunity.estimatedValueHint) {
    emphasis.push("commercial");
  }

  return [...new Set(emphasis)].slice(0, 4);
}

function buildNarrativeThemes(
  opportunity: OpportunityProfile,
  emphasis: ProposalEmphasis[],
): string[] {
  const themes: string[] = [
    `机会档位：${opportunity.tier} · 匹配度 ${opportunity.fitScore}`,
  ];
  for (const item of emphasis) {
    if (item === "compliance") themes.push("合规证据先行，降低废标风险");
    if (item === "equipment") themes.push("设备选型与国标/质保对齐");
    if (item === "commercial") themes.push("报价策略与预算限价对齐");
    if (item === "delivery") themes.push("交付节奏与里程碑可视化");
    if (item === "differentiation") themes.push("方案差异化与运营价值叙事");
  }
  for (const strength of opportunity.strengths.slice(0, 2)) {
    themes.push(`放大优势：${strength}`);
  }
  return themes.slice(0, 6);
}

function buildWorkstreams(
  opportunity: OpportunityProfile,
  posture: BidStrategy["posture"],
): StrategyWorkstream[] {
  const workstreams: StrategyWorkstream[] = [
    {
      id: stableId("ws", `${opportunity.id}|response`),
      title: "强制需求应答矩阵",
      ownerHint: "proposal-lead",
      priority: "high",
      dueHint: "immediate",
      actions: [
        "映射 must 需求到方案章节",
        ...opportunity.recommendedActions.slice(0, 2),
      ],
      readOnly: true,
    },
    {
      id: stableId("ws", `${opportunity.id}|evidence`),
      title: "证据与合规包",
      ownerHint: "compliance-owner",
      priority: opportunity.gaps.some((g) => g.severity === "high") ? "high" : "medium",
      dueHint: "this_week",
      actions: opportunity.gaps
        .filter((g) => g.severity !== "low")
        .slice(0, 3)
        .map((g) => g.mitigation),
      readOnly: true,
    },
  ];

  if (posture === "pursue" || posture === "selective") {
    workstreams.push({
      id: stableId("ws", `${opportunity.id}|pricing`),
      title: "报价与商务策略",
      ownerHint: "commercial-owner",
      priority: "medium",
      dueHint: "pre_submission",
      actions: [
        "校验预算限价与档位",
        opportunity.estimatedValueHint
          ? `锚定估值提示：${opportunity.estimatedValueHint}`
          : "补齐估值假设后再定最终报价姿态",
      ],
      readOnly: true,
    });
  }

  if (posture === "hold" || posture === "pass") {
    workstreams.push({
      id: stableId("ws", `${opportunity.id}|gate`),
      title: "Go/No-Go 复核",
      ownerHint: "bid-committee",
      priority: "high",
      dueHint: "immediate",
      actions: [
        "复核 fit/win 是否足以投入完整标书",
        "记录暂缓或放弃理由",
      ],
      readOnly: true,
    });
  }

  return workstreams.map((ws) => ({
    ...ws,
    actions: ws.actions.length > 0 ? ws.actions : ["按标准投标流程推进"],
  }));
}

function buildRiskBuffers(opportunity: OpportunityProfile): StrategyRiskBuffer[] {
  const buffers = opportunity.gaps.map((gap) => ({
    id: stableId("buf", `${opportunity.id}|${gap.id}`),
    label: gap.label,
    severity: gap.severity,
    buffer: gap.mitigation,
    readOnly: true as const,
  }));

  if (buffers.length === 0) {
    buffers.push({
      id: stableId("buf", `${opportunity.id}|baseline`),
      label: "基线缓冲",
      severity: "low",
      buffer: "保留标准交付与合规检查清单",
      readOnly: true,
    });
  }

  return buffers.slice(0, 5);
}

export function buildBidStrategy(input: {
  opportunity: OpportunityProfile;
  preferredEmphasis?: ProposalEmphasis[];
}): BidStrategy {
  assertValidOpportunityProfile(input.opportunity);
  const opportunity = input.opportunity;
  const createdAt = nowIso();

  const posture = postureFromOpportunity(
    opportunity.fitScore,
    opportunity.winProbability,
    opportunity.tier,
  );
  const pricingStance = pricingStanceFromPosture(posture, opportunity.tier);
  const emphasis = deriveEmphasis(opportunity, input.preferredEmphasis);
  const narrativeThemes = buildNarrativeThemes(opportunity, emphasis);
  const workstreams = buildWorkstreams(opportunity, posture);
  const riskBuffers = buildRiskBuffers(opportunity);

  const goNoGoScore = clamp(
    Math.round(
      opportunity.fitScore * 0.6 +
        opportunity.winProbability * 100 * 0.35 -
        (opportunity.gaps.filter((g) => g.severity === "high").length * 8),
    ),
    0,
    100,
  );
  const confidence = round2(
    clamp(0.35 + opportunity.fitScore / 200 + opportunity.winProbability * 0.35, 0.1, 0.95),
  );

  const strategy: BidStrategy = {
    id: stableId("strategy", `${opportunity.id}|${createdAt}`),
    opportunityId: opportunity.id,
    analysisId: opportunity.analysisId,
    requirementIndexId: opportunity.requirementIndexId,
    workspaceId: opportunity.workspaceId,
    status: "ready",
    posture,
    pricingStance,
    emphasis,
    narrativeThemes,
    workstreams,
    riskBuffers,
    goNoGoScore,
    confidence,
    summary: `posture=${posture} pricing=${pricingStance} goNoGo=${goNoGoScore} emphasis=${emphasis.join("+")}`,
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  const validated = validateBidStrategy(strategy);
  if (!validated.ok) {
    throw new Error(
      `Invalid BidStrategy: ${validated.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
  return strategy;
}

function pushTransition(
  transitions: StrategyLifecycleTransition[],
  from: StrategyLifecycleStage,
  to: StrategyLifecycleStage,
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

export function buildStrategyLifecycle(input: {
  strategy: BidStrategy | null;
}): StrategyLifecycle {
  const transitions: StrategyLifecycleTransition[] = [];
  let current: StrategyLifecycleStage = "opportunity";

  if (input.strategy) {
    pushTransition(
      transitions,
      "opportunity",
      "strategy",
      `posture=${input.strategy.posture}|goNoGo=${input.strategy.goNoGoScore}`,
    );
    current = "strategy";
  }

  const complete =
    input.strategy !== null &&
    input.strategy.status === "ready" &&
    current === "strategy";

  return {
    current,
    stages: [...STRATEGY_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildStrategyKernel(input: StrategyKernelInput): StrategyKernelResult {
  const deploymentId = input.deploymentId?.trim() || "v101-p4-strategy-default";
  const generatedAt = nowIso();

  assertValidOpportunityProfile(input.opportunity);

  const strategy = buildBidStrategy({
    opportunity: input.opportunity,
    preferredEmphasis: input.preferredEmphasis,
  });

  const lifecycle = buildStrategyLifecycle({ strategy });
  const ready = lifecycle.complete;

  return {
    version: V101_BID_STRATEGY_VERSION,
    freezeVersion: V101_BID_STRATEGY_FREEZE_VERSION,
    reportId: `bid-strategy-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    opportunity: input.opportunity,
    strategy,
    lifecycle,
    ready,
    readinessScore: ready ? 100 : 0,
    summary: [
      `bid-strategy ready=${ready}`,
      `tier=${input.opportunity.tier}`,
      `posture=${strategy.posture}`,
      `pricing=${strategy.pricingStance}`,
      `goNoGo=${strategy.goNoGoScore}`,
      `workstreams=${strategy.workstreams.length}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V101_BID_STRATEGY_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertStrategyKernelPass(
  result: StrategyKernelResult,
): asserts result is StrategyKernelResult & {
  ready: true;
  strategy: BidStrategy;
} {
  if (!result.ready || !result.strategy) {
    throw new Error(`V101 bid strategy kernel not ready: ${result.summary}`);
  }
}
