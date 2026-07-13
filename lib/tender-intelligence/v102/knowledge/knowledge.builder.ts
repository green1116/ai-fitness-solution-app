/**
 * E02-P1 — Tender Knowledge Graph builder
 * Builds KnowledgeNode → KnowledgeEdge → KnowledgeGraph lifecycle
 */

import { createHash, randomUUID } from "node:crypto";

import {
  assertValidKnowledgeGraph,
  KNOWLEDGE_LIFECYCLE_STAGES,
  validateKnowledgeEdge,
  validateKnowledgeKernelInput,
  validateKnowledgeNode,
} from "./knowledge.schema";
import type {
  KnowledgeEdge,
  KnowledgeEdgeKind,
  KnowledgeGraph,
  KnowledgeKernelInput,
  KnowledgeKernelResult,
  KnowledgeLifecycle,
  KnowledgeLifecycleStage,
  KnowledgeLifecycleTransition,
  KnowledgeNode,
  KnowledgeNodeKind,
  KnowledgeSeedEdge,
  KnowledgeSeedNode,
} from "./knowledge.types";
import {
  V102_TENDER_KNOWLEDGE_FREEZE_VERSION,
  V102_TENDER_KNOWLEDGE_VERSION,
} from "./knowledge.types";

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

function findFirstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return undefined;
}

export function buildKnowledgeNode(input: {
  kind: KnowledgeNodeKind;
  label: string;
  aliases?: string[];
  properties?: Record<string, string>;
  sourceHint?: string;
  confidence?: number;
}): KnowledgeNode {
  const label = normalizeLabel(input.label);
  if (!label) throw new Error("KnowledgeNode label is required");

  const node: KnowledgeNode = {
    id: stableId("node", `${input.kind}|${label}`),
    kind: input.kind,
    label,
    aliases: [...new Set((input.aliases ?? []).map(normalizeLabel).filter(Boolean))],
    properties: Object.freeze({ ...(input.properties ?? {}) }),
    sourceHint: input.sourceHint?.trim() || undefined,
    confidence: round2(Math.min(1, Math.max(0, input.confidence ?? 0.8))),
    readOnly: true,
  };

  const validated = validateKnowledgeNode(node);
  if (!validated.ok) {
    throw new Error(
      `Invalid KnowledgeNode: ${validated.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
  return node;
}

export function buildKnowledgeEdge(input: {
  kind: KnowledgeEdgeKind;
  from: KnowledgeNode;
  to: KnowledgeNode;
  label?: string;
  weight?: number;
  properties?: Record<string, string>;
}): KnowledgeEdge {
  const edge: KnowledgeEdge = {
    id: stableId("edge", `${input.kind}|${input.from.id}|${input.to.id}`),
    kind: input.kind,
    fromNodeId: input.from.id,
    toNodeId: input.to.id,
    label: normalizeLabel(input.label ?? `${input.from.label} → ${input.to.label}`),
    weight: round2(Math.max(0, input.weight ?? 1)),
    properties: Object.freeze({ ...(input.properties ?? {}) }),
    readOnly: true,
  };

  const validated = validateKnowledgeEdge(edge, new Set([input.from.id, input.to.id]));
  if (!validated.ok) {
    throw new Error(
      `Invalid KnowledgeEdge: ${validated.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
  return edge;
}

function extractNodesFromText(input: KnowledgeKernelInput): KnowledgeNode[] {
  const text = input.rawText?.trim() ?? "";
  const nodes: KnowledgeNode[] = [];
  const seen = new Set<string>();

  const push = (seed: KnowledgeSeedNode) => {
    const node = buildKnowledgeNode(seed);
    if (seen.has(node.id)) return;
    seen.add(node.id);
    nodes.push(node);
  };

  const projectLabel =
    input.projectHint?.trim() ||
    findFirstMatch(text, [
      /项目名称[:：]\s*([^\n]+)/,
      /工程名称[:：]\s*([^\n]+)/,
    ]);
  if (projectLabel) {
    push({
      kind: "project",
      label: projectLabel,
      sourceHint: "project",
      confidence: 0.95,
    });
  }

  const orgLabel =
    input.organizationHint?.trim() ||
    findFirstMatch(text, [/招标人[:：]\s*([^\n]+)/, /采购人[:：]\s*([^\n]+)/]);
  if (orgLabel) {
    push({
      kind: "organization",
      label: orgLabel,
      sourceHint: "organization",
      confidence: 0.92,
    });
  }

  const location = findFirstMatch(text, [/建设地点[:：]\s*([^\n]+)/, /项目地点[:：]\s*([^\n]+)/]);
  if (location) {
    push({
      kind: "location",
      label: location,
      sourceHint: "location",
      confidence: 0.9,
    });
  }

  if (/跑步机|有氧|力量区|器械/.test(text)) {
    push({
      kind: "equipment",
      label: "健身器械配置",
      aliases: ["跑步机", "力量器械"].filter((a) => text.includes(a)),
      sourceHint: "equipment",
      confidence: 0.85,
      properties: { category: "fitness-equipment" },
    });
  }

  if (/GB\/T\s*22517|国标|标准/.test(text)) {
    push({
      kind: "standard",
      label: text.includes("22517") ? "GB/T 22517" : "相关国家标准",
      sourceHint: "standard",
      confidence: 0.88,
    });
  }

  if (/预算|限价|万元|报价/.test(text)) {
    const budgetHint = findFirstMatch(text, [/限价\s*([0-9]+(?:\.[0-9]+)?)\s*万/, /预算[^\n]{0,20}?([0-9]+(?:\.[0-9]+)?)\s*万/]);
    push({
      kind: "budget",
      label: budgetHint ? `预算限价 ${budgetHint} 万元` : "项目预算",
      sourceHint: "budget",
      confidence: 0.87,
      properties: budgetHint ? { amountWan: budgetHint } : {},
    });
  }

  if (/方案书|设备清单|预算书|施工组织/.test(text)) {
    push({
      kind: "deliverable",
      label: "投标交付成果包",
      aliases: ["方案书", "设备清单", "预算书", "施工组织方案"].filter((a) =>
        text.includes(a),
      ),
      sourceHint: "deliverable",
      confidence: 0.86,
    });
  }

  if (/技术标|商务标|评标|强制|质保/.test(text)) {
    push({
      kind: "clause",
      label: "评标与合规条款",
      sourceHint: "clause",
      confidence: 0.84,
    });
  }

  if (/面积|净高|功能需求|技术标准/.test(text)) {
    push({
      kind: "requirement",
      label: "技术与功能需求",
      sourceHint: "requirement",
      confidence: 0.86,
    });
  }

  for (const seed of input.seedNodes ?? []) {
    push(seed);
  }

  return nodes;
}

function resolveNodeByLabel(
  nodes: KnowledgeNode[],
  label: string,
): KnowledgeNode | undefined {
  const normalized = normalizeLabel(label).toLowerCase();
  return nodes.find(
    (n) =>
      n.label.toLowerCase() === normalized ||
      n.aliases.some((a) => a.toLowerCase() === normalized),
  );
}

function buildDefaultEdges(nodes: KnowledgeNode[]): KnowledgeEdge[] {
  const byKind = (kind: KnowledgeNodeKind) => nodes.find((n) => n.kind === kind);
  const edges: KnowledgeEdge[] = [];
  const seen = new Set<string>();

  const push = (edge: KnowledgeEdge) => {
    if (seen.has(edge.id)) return;
    seen.add(edge.id);
    edges.push(edge);
  };

  const project = byKind("project");
  const org = byKind("organization");
  const location = byKind("location");
  const requirement = byKind("requirement");
  const equipment = byKind("equipment");
  const standard = byKind("standard");
  const budget = byKind("budget");
  const deliverable = byKind("deliverable");
  const clause = byKind("clause");

  if (project && org) {
    push(
      buildKnowledgeEdge({
        kind: "owns",
        from: org,
        to: project,
        label: "招标人拥有项目",
        weight: 1,
      }),
    );
  }
  if (project && location) {
    push(
      buildKnowledgeEdge({
        kind: "located_in",
        from: project,
        to: location,
        label: "项目建设地点",
        weight: 1,
      }),
    );
  }
  if (project && requirement) {
    push(
      buildKnowledgeEdge({
        kind: "requires",
        from: project,
        to: requirement,
        label: "项目包含需求",
        weight: 1,
      }),
    );
  }
  if (requirement && equipment) {
    push(
      buildKnowledgeEdge({
        kind: "requires",
        from: requirement,
        to: equipment,
        label: "需求约束设备",
        weight: 0.9,
      }),
    );
  }
  if (equipment && standard) {
    push(
      buildKnowledgeEdge({
        kind: "references",
        from: equipment,
        to: standard,
        label: "设备引用标准",
        weight: 0.95,
      }),
    );
  }
  if (project && budget) {
    push(
      buildKnowledgeEdge({
        kind: "constrains",
        from: budget,
        to: project,
        label: "预算约束项目",
        weight: 0.9,
      }),
    );
  }
  if (project && deliverable) {
    push(
      buildKnowledgeEdge({
        kind: "requires",
        from: project,
        to: deliverable,
        label: "项目要求交付成果",
        weight: 0.88,
      }),
    );
  }
  if (clause && project) {
    push(
      buildKnowledgeEdge({
        kind: "constrains",
        from: clause,
        to: project,
        label: "条款约束项目",
        weight: 0.85,
      }),
    );
  }
  if (org && deliverable) {
    push(
      buildKnowledgeEdge({
        kind: "belongs_to",
        from: deliverable,
        to: org,
        label: "交付成果归属招标人",
        weight: 0.7,
      }),
    );
  }

  return edges;
}

function buildSeedEdges(
  nodes: KnowledgeNode[],
  seeds: KnowledgeSeedEdge[] | undefined,
): KnowledgeEdge[] {
  if (!seeds?.length) return [];
  const edges: KnowledgeEdge[] = [];
  for (const seed of seeds) {
    const from = resolveNodeByLabel(nodes, seed.fromLabel);
    const to = resolveNodeByLabel(nodes, seed.toLabel);
    if (!from || !to) continue;
    edges.push(
      buildKnowledgeEdge({
        kind: seed.kind,
        from,
        to,
        label: seed.label,
        weight: seed.weight,
        properties: seed.properties,
      }),
    );
  }
  return edges;
}

export function buildKnowledgeNodes(input: KnowledgeKernelInput): KnowledgeNode[] {
  const nodes = extractNodesFromText(input);
  if (nodes.length < 1) {
    throw new Error("KnowledgeGraph requires at least one node");
  }
  return nodes;
}

export function buildKnowledgeEdges(
  nodes: KnowledgeNode[],
  seedEdges?: KnowledgeSeedEdge[],
): KnowledgeEdge[] {
  const defaults = buildDefaultEdges(nodes);
  const seeded = buildSeedEdges(nodes, seedEdges);
  const merged = new Map<string, KnowledgeEdge>();
  for (const edge of [...defaults, ...seeded]) {
    merged.set(edge.id, edge);
  }
  return [...merged.values()];
}

export function buildKnowledgeGraph(input: {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  titleHint?: string;
}): KnowledgeGraph {
  const createdAt = nowIso();
  const kindCoverage = [...new Set(input.nodes.map((n) => n.kind))];
  const title =
    input.titleHint?.trim() ||
    input.nodes.find((n) => n.kind === "project")?.label ||
    "Tender Knowledge Graph";

  const status: KnowledgeGraph["status"] =
    input.nodes.length >= 2 && input.edges.length >= 1 ? "ready" : "drafted";

  const graph: KnowledgeGraph = {
    id: stableId(
      "graph",
      `${title}|${input.nodes.map((n) => n.id).join("|")}|${input.edges.map((e) => e.id).join("|")}`,
    ),
    status,
    title,
    nodeCount: input.nodes.length,
    edgeCount: input.edges.length,
    kindCoverage,
    nodes: input.nodes,
    edges: input.edges,
    summary: [
      `nodes=${input.nodes.length}`,
      `edges=${input.edges.length}`,
      `kinds=${kindCoverage.length}`,
      `status=${status}`,
    ].join(" "),
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  assertValidKnowledgeGraph(graph);
  return graph;
}

function pushTransition(
  transitions: KnowledgeLifecycleTransition[],
  from: KnowledgeLifecycleStage,
  to: KnowledgeLifecycleStage,
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

export function buildKnowledgeLifecycle(input: {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  graph: KnowledgeGraph | null;
}): KnowledgeLifecycle {
  const transitions: KnowledgeLifecycleTransition[] = [];
  let current: KnowledgeLifecycleStage = "node";

  if (input.nodes.length > 0) {
    // start at node
  }

  if (input.edges.length > 0) {
    pushTransition(transitions, "node", "edge", `edges=${input.edges.length}`);
    current = "edge";
  }

  if (input.graph) {
    pushTransition(
      transitions,
      current,
      "graph",
      `status=${input.graph.status}|nodes=${input.graph.nodeCount}`,
    );
    current = "graph";
  }

  const complete =
    input.graph !== null &&
    input.graph.status === "ready" &&
    input.nodes.length >= 2 &&
    input.edges.length >= 1 &&
    current === "graph";

  return {
    current,
    stages: [...KNOWLEDGE_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildKnowledgeKernel(input: KnowledgeKernelInput): KnowledgeKernelResult {
  const validated = validateKnowledgeKernelInput(input);
  if (!validated.ok) {
    throw new Error(
      `Invalid knowledge kernel input: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }

  const deploymentId = input.deploymentId?.trim() || "v102-p1-knowledge-default";
  const generatedAt = nowIso();

  const nodes = buildKnowledgeNodes(input);
  const edges = buildKnowledgeEdges(nodes, input.seedEdges);
  const graph = buildKnowledgeGraph({
    nodes,
    edges,
    titleHint: input.titleHint,
  });
  const lifecycle = buildKnowledgeLifecycle({ nodes, edges, graph });
  const ready = lifecycle.complete;

  return {
    version: V102_TENDER_KNOWLEDGE_VERSION,
    freezeVersion: V102_TENDER_KNOWLEDGE_FREEZE_VERSION,
    reportId: `tender-knowledge-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    nodes,
    edges,
    graph,
    lifecycle,
    ready,
    readinessScore: ready
      ? 100
      : Math.min(90, Math.round((nodes.length + edges.length) * 8)),
    summary: [
      `tender-knowledge ready=${ready}`,
      `nodes=${nodes.length}`,
      `edges=${edges.length}`,
      `graph=${graph.status}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V102_TENDER_KNOWLEDGE_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertKnowledgeKernelPass(
  result: KnowledgeKernelResult,
): asserts result is KnowledgeKernelResult & {
  ready: true;
  graph: KnowledgeGraph;
} {
  if (!result.ready || !result.graph) {
    throw new Error(`V102 tender knowledge kernel not ready: ${result.summary}`);
  }
}
