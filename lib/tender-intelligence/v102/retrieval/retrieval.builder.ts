/**
 * E02-P4 — Knowledge Retrieval builder
 * KnowledgeGraph → Query → KnowledgeContext lifecycle
 */

import { createHash, randomUUID } from "node:crypto";

import type {
  KnowledgeEdge,
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeNodeKind,
} from "../knowledge/knowledge.types";
import {
  assertValidKnowledgeContext,
  RETRIEVAL_LIFECYCLE_STAGES,
  validateKnowledgeQuery,
  validateRetrievalKernelInput,
} from "./retrieval.schema";
import type {
  KnowledgeContext,
  KnowledgeContextSnippet,
  KnowledgeHit,
  KnowledgeQuery,
  RetrievalKernelInput,
  RetrievalKernelResult,
  RetrievalLifecycle,
  RetrievalLifecycleStage,
  RetrievalLifecycleTransition,
} from "./retrieval.types";
import {
  V102_KNOWLEDGE_RETRIEVAL_FREEZE_VERSION,
  V102_KNOWLEDGE_RETRIEVAL_VERSION,
} from "./retrieval.types";

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

const DOMAIN_KEYWORDS = [
  "设备",
  "标准",
  "预算",
  "限价",
  "跑步机",
  "需求",
  "项目",
  "招标",
  "质保",
  "面积",
  "交付",
  "器械",
  "有氧",
  "条款",
  "地点",
  "国标",
] as const;

function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  const parts = lower
    .split(/[\s,，。；;、:：/\\|()\-—_]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  const keywords = DOMAIN_KEYWORDS.filter((k) => text.includes(k));
  const standards = [...lower.matchAll(/gb\/t\s*(\d+)/g)].flatMap((m) => [
    m[0].trim(),
    m[1]!,
  ]);

  return uniqueTerms([...parts, ...keywords, ...standards]);
}

function uniqueTerms(terms: string[]): string[] {
  return [...new Set(terms)];
}

export function buildKnowledgeQuery(input: {
  queryText: string;
  nodeKinds?: KnowledgeQuery["nodeKinds"];
  edgeKinds?: KnowledgeQuery["edgeKinds"];
  limit?: number;
  expandNeighbors?: boolean;
}): KnowledgeQuery {
  const text = input.queryText.trim();
  if (text.length < 2) throw new Error("queryText must be at least 2 characters");

  const query: KnowledgeQuery = {
    id: stableId("query", text),
    text,
    nodeKinds: input.nodeKinds ? [...input.nodeKinds] : undefined,
    edgeKinds: input.edgeKinds ? [...input.edgeKinds] : undefined,
    limit: Math.max(1, input.limit ?? 8),
    expandNeighbors: input.expandNeighbors ?? true,
    createdAt: nowIso(),
    readOnly: true,
  };

  const validated = validateKnowledgeQuery(query);
  if (!validated.ok) {
    throw new Error(
      `Invalid KnowledgeQuery: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
  return query;
}

function scoreNode(node: KnowledgeNode, terms: string[]): {
  score: number;
  matched: string[];
} {
  const haystack = [
    node.label,
    ...node.aliases,
    node.kind,
    node.sourceHint ?? "",
    ...Object.values(node.properties),
  ]
    .join(" ")
    .toLowerCase();

  const matched: string[] = [];
  let score = 0;
  for (const term of terms) {
    if (haystack.includes(term)) {
      matched.push(term);
      score += node.label.toLowerCase().includes(term) ? 1.0 : 0.55;
      if (node.aliases.some((a) => a.toLowerCase().includes(term))) score += 0.25;
    }
  }

  if (matched.length > 0) {
    score += node.confidence * 0.4;
  }

  return { score: round2(score), matched: uniqueTerms(matched) };
}

function scoreEdge(
  edge: KnowledgeEdge,
  nodesById: Map<string, KnowledgeNode>,
  terms: string[],
): { score: number; matched: string[] } {
  const from = nodesById.get(edge.fromNodeId);
  const to = nodesById.get(edge.toNodeId);
  const haystack = [
    edge.label,
    edge.kind,
    from?.label ?? "",
    to?.label ?? "",
    ...Object.values(edge.properties),
  ]
    .join(" ")
    .toLowerCase();

  const matched: string[] = [];
  let score = 0;
  for (const term of terms) {
    if (haystack.includes(term)) {
      matched.push(term);
      score += edge.label.toLowerCase().includes(term) ? 0.9 : 0.45;
    }
  }

  if (matched.length > 0) {
    score += Math.min(1, edge.weight) * 0.3;
  }

  return { score: round2(score), matched: uniqueTerms(matched) };
}

export function rankKnowledgeHits(input: {
  graph: KnowledgeGraph;
  query: KnowledgeQuery;
}): KnowledgeHit[] {
  const terms = uniqueTerms(tokenize(input.query.text));
  if (terms.length < 1) {
    // fallback: use full query as one term
    terms.push(input.query.text.toLowerCase());
  }

  const nodesById = new Map(input.graph.nodes.map((n) => [n.id, n]));
  const hits: KnowledgeHit[] = [];

  for (const node of input.graph.nodes) {
    if (input.query.nodeKinds && !input.query.nodeKinds.includes(node.kind)) continue;
    const { score, matched } = scoreNode(node, terms);
    if (score <= 0 || matched.length < 1) continue;
    hits.push({
      id: stableId("hit", `node|${node.id}|${score}`),
      hitKind: "node",
      score,
      rank: 0,
      label: node.label,
      nodeId: node.id,
      nodeKind: node.kind,
      evidence: `node:${node.kind}|${node.sourceHint ?? "graph"}`,
      matchedTerms: matched,
      readOnly: true,
    });
  }

  for (const edge of input.graph.edges) {
    if (input.query.edgeKinds && !input.query.edgeKinds.includes(edge.kind)) continue;
    const { score, matched } = scoreEdge(edge, nodesById, terms);
    if (score <= 0 || matched.length < 1) continue;
    hits.push({
      id: stableId("hit", `edge|${edge.id}|${score}`),
      hitKind: "edge",
      score,
      rank: 0,
      label: edge.label,
      edgeId: edge.id,
      edgeKind: edge.kind,
      evidence: `edge:${edge.kind}|${edge.fromNodeId}->${edge.toNodeId}`,
      matchedTerms: matched,
      readOnly: true,
    });
  }

  hits.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  const limited = hits.slice(0, input.query.limit).map((hit, index) => ({
    ...hit,
    rank: index + 1,
  }));

  return limited;
}

function collectFocusedGraph(input: {
  graph: KnowledgeGraph;
  hits: KnowledgeHit[];
  expandNeighbors: boolean;
}): { focusedNodes: KnowledgeNode[]; focusedEdges: KnowledgeEdge[] } {
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  for (const hit of input.hits) {
    if (hit.nodeId) nodeIds.add(hit.nodeId);
    if (hit.edgeId) edgeIds.add(hit.edgeId);
  }

  if (input.expandNeighbors) {
    for (const edge of input.graph.edges) {
      if (nodeIds.has(edge.fromNodeId) || nodeIds.has(edge.toNodeId)) {
        edgeIds.add(edge.id);
        nodeIds.add(edge.fromNodeId);
        nodeIds.add(edge.toNodeId);
      }
    }
  }

  const focusedNodes = input.graph.nodes.filter((n) => nodeIds.has(n.id));
  const focusedEdges = input.graph.edges.filter((e) => edgeIds.has(e.id));
  return { focusedNodes, focusedEdges };
}

function buildSnippets(input: {
  hits: KnowledgeHit[];
  focusedNodes: KnowledgeNode[];
  focusedEdges: KnowledgeEdge[];
}): KnowledgeContextSnippet[] {
  const snippets: KnowledgeContextSnippet[] = [];

  for (const hit of input.hits.slice(0, 6)) {
    if (hit.hitKind === "node") {
      const node = input.focusedNodes.find((n) => n.id === hit.nodeId);
      snippets.push({
        id: stableId("snip", `node|${hit.id}`),
        label: hit.label,
        kind: (node?.kind ?? hit.nodeKind ?? "other") as KnowledgeNodeKind,
        text: `命中节点「${hit.label}」· 匹配词: ${hit.matchedTerms.join(", ") || "n/a"}`,
        score: hit.score,
        readOnly: true,
      });
    } else {
      const edge = input.focusedEdges.find((e) => e.id === hit.edgeId);
      snippets.push({
        id: stableId("snip", `edge|${hit.id}`),
        label: hit.label,
        kind: edge?.kind ?? hit.edgeKind ?? "related_to",
        text: `命中关系「${hit.label}」· 匹配词: ${hit.matchedTerms.join(", ") || "n/a"}`,
        score: hit.score,
        readOnly: true,
      });
    }
  }

  return snippets;
}

export function buildKnowledgeContext(input: {
  graph: KnowledgeGraph;
  query: KnowledgeQuery;
  titleHint?: string;
}): KnowledgeContext {
  const createdAt = nowIso();
  const hits = rankKnowledgeHits({ graph: input.graph, query: input.query });
  if (hits.length < 1) {
    throw new Error("Retrieval produced no hits for query");
  }

  const { focusedNodes, focusedEdges } = collectFocusedGraph({
    graph: input.graph,
    hits,
    expandNeighbors: input.query.expandNeighbors,
  });

  const snippets = buildSnippets({ hits, focusedNodes, focusedEdges });
  const nodeHitCount = hits.filter((h) => h.hitKind === "node").length;
  const edgeHitCount = hits.filter((h) => h.hitKind === "edge").length;
  const topScore = hits[0]?.score ?? 0;

  const status: KnowledgeContext["status"] =
    hits.length >= 2 && topScore >= 0.8 ? "ready" : "ranked";

  const title =
    input.titleHint?.trim() ||
    `检索上下文 · ${input.query.text.slice(0, 24)}`;

  const narrative = [
    `基于图谱「${input.graph.title}」执行查询「${input.query.text}」`,
    `命中 ${hits.length} 条（节点 ${nodeHitCount} / 关系 ${edgeHitCount}）`,
    `聚焦子图：节点 ${focusedNodes.length} · 边 ${focusedEdges.length}`,
    status === "ready"
      ? "上下文已就绪，可进入下游生成/推理"
      : "上下文已形成排序结果，建议补充查询词以提升命中",
  ];

  const context: KnowledgeContext = {
    id: stableId("ctx", `${input.graph.id}|${input.query.id}|${hits.map((h) => h.id).join("|")}`),
    queryId: input.query.id,
    graphId: input.graph.id,
    status,
    title,
    hitCount: hits.length,
    nodeHitCount,
    edgeHitCount,
    topScore,
    hits,
    focusedNodes,
    focusedEdges,
    snippets,
    narrative,
    summary: [
      `status=${status}`,
      `hits=${hits.length}`,
      `nodes=${focusedNodes.length}`,
      `edges=${focusedEdges.length}`,
      `top=${topScore}`,
    ].join(" "),
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  assertValidKnowledgeContext(context);
  return context;
}

function pushTransition(
  transitions: RetrievalLifecycleTransition[],
  from: RetrievalLifecycleStage,
  to: RetrievalLifecycleStage,
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

export function buildRetrievalLifecycle(input: {
  graph: KnowledgeGraph;
  query: KnowledgeQuery | null;
  context: KnowledgeContext | null;
}): RetrievalLifecycle {
  const transitions: RetrievalLifecycleTransition[] = [];
  let current: RetrievalLifecycleStage = "graph";

  if (input.query) {
    pushTransition(
      transitions,
      "graph",
      "query",
      `query=${input.query.text.slice(0, 32)}|limit=${input.query.limit}`,
    );
    current = "query";
  }

  if (input.context) {
    pushTransition(
      transitions,
      current,
      "context",
      `status=${input.context.status}|hits=${input.context.hitCount}`,
    );
    current = "context";
  }

  const complete =
    input.context !== null &&
    input.context.status === "ready" &&
    input.context.hitCount >= 2 &&
    current === "context";

  return {
    current,
    stages: [...RETRIEVAL_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildRetrievalKernel(
  input: RetrievalKernelInput,
): RetrievalKernelResult {
  const validated = validateRetrievalKernelInput(input);
  if (!validated.ok) {
    throw new Error(
      `Invalid retrieval kernel input: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }

  const deploymentId = input.deploymentId?.trim() || "v102-p4-retrieval-default";
  const generatedAt = nowIso();

  const query = buildKnowledgeQuery({
    queryText: input.queryText,
    nodeKinds: input.nodeKinds,
    edgeKinds: input.edgeKinds,
    limit: input.limit,
    expandNeighbors: input.expandNeighbors,
  });

  const context = buildKnowledgeContext({
    graph: input.graph,
    query,
    titleHint: input.titleHint,
  });

  const lifecycle = buildRetrievalLifecycle({
    graph: input.graph,
    query,
    context,
  });

  const ready = lifecycle.complete;

  return {
    version: V102_KNOWLEDGE_RETRIEVAL_VERSION,
    freezeVersion: V102_KNOWLEDGE_RETRIEVAL_FREEZE_VERSION,
    reportId: `knowledge-retrieval-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    graph: input.graph,
    query,
    context,
    lifecycle,
    ready,
    readinessScore: ready
      ? 100
      : Math.min(90, Math.round(context.hitCount * 10 + context.topScore * 20)),
    summary: [
      `knowledge-retrieval ready=${ready}`,
      `query=${query.text}`,
      `hits=${context.hitCount}`,
      `context=${context.status}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V102_KNOWLEDGE_RETRIEVAL_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertRetrievalKernelPass(
  result: RetrievalKernelResult,
): asserts result is RetrievalKernelResult & {
  ready: true;
  context: KnowledgeContext;
} {
  if (!result.ready || !result.context) {
    throw new Error(`V102 knowledge retrieval kernel not ready: ${result.summary}`);
  }
}
