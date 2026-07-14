/**
 * E02-P6 — Enterprise Memory Agent builder
 * Agent → Retrieval → Recommendation lifecycle
 */

import { createHash, randomUUID } from "node:crypto";

import { runRetrievalKernelOrThrow } from "../retrieval";
import { runSimilarityKernelOrThrow } from "../similarity";
import type { KnowledgeContext } from "../retrieval/retrieval.types";
import type { SimilarTenderProfile } from "../similarity/similarity.types";
import {
  buildMemoryAgentRegistryManifest,
  isMemoryAgentDependencyGraphValid,
} from "./memory-agent.registry";
import {
  assertValidMemoryAgentRecommendation,
  assertValidMemoryAgentRegistry,
  MEMORY_AGENT_LIFECYCLE_STAGES,
  validateMemoryAgentKernelInput,
} from "./memory-agent.schema";
import type {
  MemoryAgentKernelInput,
  MemoryAgentKernelResult,
  MemoryAgentLifecycle,
  MemoryAgentLifecycleStage,
  MemoryAgentLifecycleTransition,
  MemoryAgentRecommendation,
  MemoryRecommendationItem,
} from "./memory-agent.types";
import {
  V102_MEMORY_AGENT_FREEZE_VERSION,
  V102_MEMORY_AGENT_VERSION,
} from "./memory-agent.types";

function nowIso(): string {
  return new Date().toISOString();
}

function stableId(prefix: string, seed: string): string {
  const hash = createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return `${prefix}_${hash}`;
}

function pushTransition(
  transitions: MemoryAgentLifecycleTransition[],
  from: MemoryAgentLifecycleStage,
  to: MemoryAgentLifecycleStage,
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

export function buildMemoryRecommendations(input: {
  context: KnowledgeContext;
  profile: SimilarTenderProfile;
  titleHint?: string;
}): MemoryAgentRecommendation {
  const createdAt = nowIso();
  const items: MemoryRecommendationItem[] = [];

  const topMatch = input.profile.matches[0];
  if (topMatch) {
    items.push({
      id: stableId("rec", `reuse|${topMatch.id}`),
      category: "reuse",
      title: `复用「${topMatch.title}」成熟材料`,
      rationale: `重叠度=${topMatch.overlapScore} · 信号=${topMatch.sharedSignals.slice(0, 3).join("/")}`,
      priority: topMatch.overlapScore >= 0.6 ? "high" : "medium",
      sourceRefs: [topMatch.id, ...topMatch.reuseHints.slice(0, 2)],
      readOnly: true,
    });

    for (const hint of topMatch.reuseHints.slice(0, 2)) {
      items.push({
        id: stableId("rec", `hint|${topMatch.id}|${hint}`),
        category: hint.includes("证据") || hint.includes("标准")
          ? "evidence"
          : hint.includes("报价") || hint.includes("限价")
            ? "pricing"
            : hint.includes("条款") || hint.includes("合规")
              ? "compliance"
              : "delivery",
        title: hint,
        rationale: `来自相似项目 ${topMatch.title}`,
        priority: "medium",
        sourceRefs: [topMatch.id],
        readOnly: true,
      });
    }
  }

  const standardHit = input.context.hits.find(
    (h) =>
      h.nodeKind === "standard" ||
      h.label.includes("22517") ||
      h.matchedTerms.some((t) => t.includes("标准") || t.includes("22517")),
  );
  if (standardHit) {
    items.push({
      id: stableId("rec", `compliance|${standardHit.id}`),
      category: "compliance",
      title: "强化标准符合性与质保证据包",
      rationale: `检索命中「${standardHit.label}」· score=${standardHit.score}`,
      priority: "high",
      sourceRefs: [standardHit.id, input.context.id],
      readOnly: true,
    });
  }

  const budgetHit = input.context.hits.find(
    (h) =>
      h.nodeKind === "budget" ||
      h.label.includes("预算") ||
      h.matchedTerms.some((t) => t.includes("预算") || t.includes("限价")),
  );
  if (budgetHit) {
    items.push({
      id: stableId("rec", `pricing|${budgetHit.id}`),
      category: "pricing",
      title: "对齐历史限价带与报价拆分",
      rationale: `检索命中「${budgetHit.label}」并结合相似项目预算带`,
      priority: "high",
      sourceRefs: [
        budgetHit.id,
        ...input.profile.matches.slice(0, 2).map((m) => m.budgetBand),
      ],
      readOnly: true,
    });
  }

  if (items.length < 2) {
    items.push({
      id: stableId("rec", `fallback|${input.context.id}`),
      category: "reuse",
      title: "基于记忆库补强投标材料",
      rationale: "上下文与相似画像已建立，建议至少复用设备清单与交付模板",
      priority: "medium",
      sourceRefs: [input.context.id, input.profile.id],
      readOnly: true,
    });
  }

  // dedupe by id
  const deduped = [...new Map(items.map((i) => [i.id, i])).values()];
  const highPriorityCount = deduped.filter((i) => i.priority === "high").length;
  const status: MemoryAgentRecommendation["status"] =
    deduped.length >= 2 && highPriorityCount >= 1 ? "ready" : "drafted";

  const title =
    input.titleHint?.trim() ||
    `企业记忆推荐 · ${input.context.title.slice(0, 20)}`;

  const recommendation: MemoryAgentRecommendation = {
    id: stableId(
      "memrec",
      `${input.context.id}|${input.profile.id}|${deduped.map((i) => i.id).join("|")}`,
    ),
    status,
    title,
    contextId: input.context.id,
    profileId: input.profile.id,
    itemCount: deduped.length,
    highPriorityCount,
    items: deduped,
    narrative: [
      "Memory Agent 已完成检索上下文装载",
      `相似招标画像匹配 ${input.profile.matchCount} 条 · top=${input.profile.topScore}`,
      `生成推荐 ${deduped.length} 条（高优先 ${highPriorityCount}）`,
      status === "ready"
        ? "推荐已就绪，可进入投标材料复用与证据编排"
        : "推荐已起草，建议补充检索词以提升高优先条目",
    ],
    summary: [
      `status=${status}`,
      `items=${deduped.length}`,
      `high=${highPriorityCount}`,
    ].join(" "),
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  assertValidMemoryAgentRecommendation(recommendation);
  return recommendation;
}

export function buildMemoryAgentLifecycle(input: {
  hasRegistry: boolean;
  context: KnowledgeContext | null;
  recommendation: MemoryAgentRecommendation | null;
}): MemoryAgentLifecycle {
  const transitions: MemoryAgentLifecycleTransition[] = [];
  let current: MemoryAgentLifecycleStage = "agent";

  if (input.hasRegistry && input.context) {
    pushTransition(
      transitions,
      "agent",
      "retrieval",
      `context=${input.context.id}|hits=${input.context.hitCount}`,
    );
    current = "retrieval";
  }

  if (input.recommendation) {
    pushTransition(
      transitions,
      current,
      "recommendation",
      `status=${input.recommendation.status}|items=${input.recommendation.itemCount}`,
    );
    current = "recommendation";
  }

  const complete =
    input.hasRegistry &&
    input.context !== null &&
    input.recommendation !== null &&
    input.recommendation.status === "ready" &&
    current === "recommendation";

  return {
    current,
    stages: [...MEMORY_AGENT_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildMemoryAgentKernel(
  input: MemoryAgentKernelInput,
): MemoryAgentKernelResult {
  const validated = validateMemoryAgentKernelInput(input);
  if (!validated.ok) {
    throw new Error(
      `Invalid memory agent input: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }

  const deploymentId = input.deploymentId?.trim() || "v102-p6-memory-agent-default";
  const generatedAt = nowIso();

  const registry = buildMemoryAgentRegistryManifest();
  assertValidMemoryAgentRegistry(registry);
  if (!registry.catalogComplete || !isMemoryAgentDependencyGraphValid()) {
    throw new Error("Memory agent registry is incomplete or dependency graph invalid");
  }

  const retrieval = runRetrievalKernelOrThrow({
    deploymentId: `${deploymentId}-retrieval`,
    graph: input.graph,
    queryText: input.queryText,
    titleHint: input.titleHint
      ? `${input.titleHint} · 检索`
      : undefined,
    limit: input.retrievalLimit ?? 10,
    expandNeighbors: true,
  });

  const similarity = runSimilarityKernelOrThrow({
    deploymentId: `${deploymentId}-similarity`,
    context: retrieval.context,
    titleHint: input.titleHint
      ? `${input.titleHint} · 相似画像`
      : undefined,
    limit: input.similarityLimit ?? 5,
  });

  const recommendation = buildMemoryRecommendations({
    context: retrieval.context,
    profile: similarity.profile,
    titleHint: input.titleHint,
  });

  const lifecycle = buildMemoryAgentLifecycle({
    hasRegistry: true,
    context: retrieval.context,
    recommendation,
  });

  const ready = lifecycle.complete;

  return {
    version: V102_MEMORY_AGENT_VERSION,
    freezeVersion: V102_MEMORY_AGENT_FREEZE_VERSION,
    reportId: `memory-agent-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    registry,
    context: retrieval.context,
    profile: similarity.profile,
    recommendation,
    lifecycle,
    ready,
    readinessScore: ready
      ? 100
      : Math.min(
          90,
          Math.round(
            (recommendation.itemCount * 12 + recommendation.highPriorityCount * 15) *
              (retrieval.context.hitCount > 0 ? 1 : 0.5),
          ),
        ),
    summary: [
      `memory-agent ready=${ready}`,
      `agents=${registry.agentCount}`,
      `hits=${retrieval.context.hitCount}`,
      `matches=${similarity.profile.matchCount}`,
      `recs=${recommendation.itemCount}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V102_MEMORY_AGENT_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertMemoryAgentKernelPass(
  result: MemoryAgentKernelResult,
): asserts result is MemoryAgentKernelResult & {
  ready: true;
  context: KnowledgeContext;
  profile: SimilarTenderProfile;
  recommendation: MemoryAgentRecommendation;
} {
  if (
    !result.ready ||
    !result.context ||
    !result.profile ||
    !result.recommendation
  ) {
    throw new Error(`V102 memory agent kernel not ready: ${result.summary}`);
  }
}
