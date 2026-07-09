/**
 * V73 P2 — Knowledge dependency graph (declarative)
 */
import { KNOWLEDGE_CATALOG } from "./knowledge.catalog";
import type {
  CycleCheck,
  Dependency,
  DependencyManifest,
  KnowledgeDependencyAdjacency,
  KnowledgeDependencyGraph,
  KnowledgeImpact,
  KnowledgeNode,
  KnowledgeNodeManifest,
} from "./knowledge.dependency";
import { V73_KNOWLEDGE_DEPENDENCY_VERSION } from "./knowledge.dependency";

export const KNOWLEDGE_NODE_CATALOG: KnowledgeNode[] = [
  {
    id: "KNW-NOD-001",
    knowledgeRef: "KNW-001",
    label: "operational-intelligence-baseline",
    order: 1,
    required: true,
    description: "Operational intelligence baseline knowledge node",
  },
  {
    id: "KNW-NOD-002",
    knowledgeRef: "KNW-002",
    label: "signal-dependency-graph",
    order: 2,
    required: true,
    description: "Signal dependency graph knowledge node",
  },
  {
    id: "KNW-NOD-003",
    knowledgeRef: "KNW-003",
    label: "intelligence-policy-gates",
    order: 3,
    required: true,
    description: "Intelligence policy gates knowledge node",
  },
  {
    id: "KNW-NOD-004",
    knowledgeRef: "KNW-004",
    label: "compatibility-matrix-guide",
    order: 4,
    required: true,
    description: "Compatibility matrix guide knowledge node",
  },
  {
    id: "KNW-NOD-005",
    knowledgeRef: "KNW-005",
    label: "governance-risk-escalation",
    order: 5,
    required: true,
    description: "Governance risk escalation knowledge node",
  },
  {
    id: "KNW-NOD-006",
    knowledgeRef: "KNW-006",
    label: "lifecycle-state-reference",
    order: 6,
    required: true,
    description: "Lifecycle state reference knowledge node",
  },
  {
    id: "KNW-NOD-007",
    knowledgeRef: "KNW-007",
    label: "compliance-checklist-reference",
    order: 7,
    required: true,
    description: "Compliance checklist reference knowledge node",
  },
  {
    id: "KNW-NOD-008",
    knowledgeRef: "KNW-008",
    label: "knowledge-foundation-catalog",
    order: 8,
    required: false,
    description: "Knowledge foundation catalog node",
  },
];

export const KNOWLEDGE_DEPENDENCY_CATALOG: Dependency[] = [
  {
    id: "KNW-DEP-001",
    upstream: "KNW-NOD-001",
    downstream: "KNW-NOD-002",
    required: true,
    optional: false,
    order: 1,
    impact: "critical",
    description: "Signal dependency graph requires intelligence baseline knowledge",
  },
  {
    id: "KNW-DEP-002",
    upstream: "KNW-NOD-002",
    downstream: "KNW-NOD-003",
    required: true,
    optional: false,
    order: 2,
    impact: "high",
    description: "Policy gates knowledge requires dependency graph context",
  },
  {
    id: "KNW-DEP-003",
    upstream: "KNW-NOD-003",
    downstream: "KNW-NOD-004",
    required: true,
    optional: false,
    order: 3,
    impact: "high",
    description: "Compatibility matrix guide requires policy gate knowledge",
  },
  {
    id: "KNW-DEP-004",
    upstream: "KNW-NOD-004",
    downstream: "KNW-NOD-005",
    required: true,
    optional: false,
    order: 4,
    impact: "medium",
    description: "Governance risk knowledge requires compatibility matrix context",
  },
  {
    id: "KNW-DEP-005",
    upstream: "KNW-NOD-005",
    downstream: "KNW-NOD-006",
    required: true,
    optional: false,
    order: 5,
    impact: "medium",
    description: "Lifecycle reference requires governance risk knowledge",
  },
  {
    id: "KNW-DEP-006",
    upstream: "KNW-NOD-006",
    downstream: "KNW-NOD-007",
    required: true,
    optional: false,
    order: 6,
    impact: "high",
    description: "Compliance checklist requires lifecycle state knowledge",
  },
  {
    id: "KNW-DEP-007",
    upstream: "KNW-NOD-007",
    downstream: "KNW-NOD-008",
    required: true,
    optional: false,
    order: 7,
    impact: "critical",
    description: "Knowledge foundation requires compliance checklist knowledge",
  },
  {
    id: "KNW-DEP-008",
    upstream: "KNW-NOD-001",
    downstream: "KNW-NOD-004",
    required: false,
    optional: true,
    order: 8,
    impact: "low",
    description: "Optional parallel shortcut from baseline to compatibility matrix guide",
  },
];

export function isKnowledgeDependencyRefsAligned(): boolean {
  const knowledgeIds = new Set(KNOWLEDGE_CATALOG.map((k) => k.id));
  const nodeIds = new Set(KNOWLEDGE_NODE_CATALOG.map((n) => n.id));

  const nodesAligned = KNOWLEDGE_NODE_CATALOG.every((n) => knowledgeIds.has(n.knowledgeRef));
  const edgesAligned = KNOWLEDGE_DEPENDENCY_CATALOG.every(
    (d) => nodeIds.has(d.upstream) && nodeIds.has(d.downstream),
  );
  const coverageComplete = KNOWLEDGE_NODE_CATALOG.every((n) =>
    KNOWLEDGE_DEPENDENCY_CATALOG.some((d) => d.upstream === n.id || d.downstream === n.id),
  );

  return nodesAligned && edgesAligned && coverageComplete;
}

export function buildKnowledgeNodeManifest(): KnowledgeNodeManifest {
  const nodes = KNOWLEDGE_NODE_CATALOG;
  const catalogComplete = nodes.length >= 6;

  return {
    version: V73_KNOWLEDGE_DEPENDENCY_VERSION,
    nodeCount: nodes.length,
    catalogComplete,
    nodes,
    summary: [`knowledge-nodes count=${nodes.length}`, `complete=${catalogComplete}`].join(" "),
  };
}

export function buildDependencyManifest(): DependencyManifest {
  const dependencies = KNOWLEDGE_DEPENDENCY_CATALOG;
  const requiredCount = dependencies.filter((d) => d.required).length;
  const optionalCount = dependencies.filter((d) => d.optional).length;
  const catalogComplete =
    dependencies.length >= 6 && requiredCount >= 4 && optionalCount >= 1;

  return {
    version: V73_KNOWLEDGE_DEPENDENCY_VERSION,
    edgeCount: dependencies.length,
    requiredCount,
    optionalCount,
    catalogComplete,
    dependencies,
    summary: [
      `dependencies count=${dependencies.length}`,
      `required=${requiredCount}`,
      `optional=${optionalCount}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildDeclarativeKnowledgeAdjacency(): KnowledgeDependencyAdjacency {
  const adj: KnowledgeDependencyAdjacency = {};

  for (const node of KNOWLEDGE_NODE_CATALOG) {
    adj[node.id] = [];
  }

  for (const dep of KNOWLEDGE_DEPENDENCY_CATALOG) {
    adj[dep.upstream] = [...(adj[dep.upstream] ?? []), dep.downstream];
  }

  return adj;
}

export function computeCycleCheck(): CycleCheck {
  const adj = buildDeclarativeKnowledgeAdjacency();
  const nodes = Object.keys(adj);
  const visited = new Set<string>();
  const stack = new Set<string>();
  let cycleDetected = false;

  function dfs(node: string): void {
    if (stack.has(node)) {
      cycleDetected = true;
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    for (const next of adj[node] ?? []) {
      dfs(next);
    }
    stack.delete(node);
  }

  for (const node of nodes) {
    dfs(node);
  }

  const acyclic = !cycleDetected;

  return {
    acyclic,
    checkedNodeCount: nodes.length,
    checkedEdgeCount: KNOWLEDGE_DEPENDENCY_CATALOG.length,
    cycleDetected,
    summary: [
      `cycle-check acyclic=${acyclic}`,
      `nodes=${nodes.length}`,
      `edges=${KNOWLEDGE_DEPENDENCY_CATALOG.length}`,
    ].join(" "),
  };
}

export function buildKnowledgeDependencyGraph(): KnowledgeDependencyGraph {
  const adjacency = buildDeclarativeKnowledgeAdjacency();
  const cycleCheck = computeCycleCheck();
  const nodeCount = Object.keys(adjacency).length;
  const edgeCount = KNOWLEDGE_DEPENDENCY_CATALOG.length;
  const graphComplete = nodeCount >= 6 && edgeCount >= 6 && cycleCheck.acyclic;

  return {
    version: V73_KNOWLEDGE_DEPENDENCY_VERSION,
    nodeCount,
    edgeCount,
    graphComplete,
    adjacency,
    cycleCheck,
    summary: [
      `knowledge-dependency-graph nodes=${nodeCount}`,
      `edges=${edgeCount}`,
      `acyclic=${cycleCheck.acyclic}`,
      `complete=${graphComplete}`,
    ].join(" "),
  };
}

export function getKnowledgeNodeById(id: string): KnowledgeNode | undefined {
  return KNOWLEDGE_NODE_CATALOG.find((n) => n.id === id);
}

export function getDependencyById(id: string): Dependency | undefined {
  return KNOWLEDGE_DEPENDENCY_CATALOG.find((d) => d.id === id);
}

export function getUpstreamNodes(nodeId: string): string[] {
  return KNOWLEDGE_DEPENDENCY_CATALOG.filter((d) => d.downstream === nodeId).map(
    (d) => d.upstream,
  );
}

export function getDownstreamNodes(nodeId: string): string[] {
  return KNOWLEDGE_DEPENDENCY_CATALOG.filter((d) => d.upstream === nodeId).map(
    (d) => d.downstream,
  );
}

export function getDependenciesByImpact(impact: KnowledgeImpact): Dependency[] {
  return KNOWLEDGE_DEPENDENCY_CATALOG.filter((d) => d.impact === impact);
}

export function computeDeclarativeImpactScore(input: { impact: KnowledgeImpact }): number {
  const scores: Record<KnowledgeImpact, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return scores[input.impact];
}
