/**
 * V72 P2 — Signal dependency graph (declarative)
 */
import { INTELLIGENCE_CATALOG } from "./intelligence.catalog";
import type {
  CycleCheck,
  Dependency,
  DependencyManifest,
  SignalDependencyAdjacency,
  SignalDependencyGraph,
  SignalImpact,
  SignalNode,
  SignalNodeManifest,
} from "./signal.dependency";
import { V72_SIGNAL_DEPENDENCY_VERSION } from "./signal.dependency";

export const SIGNAL_NODE_CATALOG: SignalNode[] = [
  {
    id: "INT-NOD-001",
    insightRef: "INT-001",
    label: "workflow-orchestration-baseline-health",
    order: 1,
    required: true,
    description: "Workflow orchestration baseline health signal node",
  },
  {
    id: "INT-NOD-002",
    insightRef: "INT-002",
    label: "dependency-graph-acyclic-status",
    order: 2,
    required: true,
    description: "Dependency graph acyclic status signal node",
  },
  {
    id: "INT-NOD-003",
    insightRef: "INT-003",
    label: "policy-gate-compliance-rate",
    order: 3,
    required: true,
    description: "Policy gate compliance rate signal node",
  },
  {
    id: "INT-NOD-004",
    insightRef: "INT-004",
    label: "compatibility-matrix-coverage",
    order: 4,
    required: true,
    description: "Compatibility matrix coverage signal node",
  },
  {
    id: "INT-NOD-005",
    insightRef: "INT-005",
    label: "governance-risk-escalation-watch",
    order: 5,
    required: true,
    description: "Governance risk escalation watch signal node",
  },
  {
    id: "INT-NOD-006",
    insightRef: "INT-006",
    label: "lifecycle-state-distribution",
    order: 6,
    required: true,
    description: "Lifecycle state distribution signal node",
  },
  {
    id: "INT-NOD-007",
    insightRef: "INT-007",
    label: "compliance-checklist-pass-rate",
    order: 7,
    required: true,
    description: "Compliance checklist pass rate signal node",
  },
  {
    id: "INT-NOD-008",
    insightRef: "INT-008",
    label: "intelligence-foundation-catalog",
    order: 8,
    required: false,
    description: "Intelligence foundation catalog signal node",
  },
];

export const SIGNAL_DEPENDENCY_CATALOG: Dependency[] = [
  {
    id: "INT-DEP-001",
    upstream: "INT-NOD-001",
    downstream: "INT-NOD-002",
    required: true,
    optional: false,
    order: 1,
    impact: "critical",
    description: "Dependency acyclic status requires orchestration baseline health",
  },
  {
    id: "INT-DEP-002",
    upstream: "INT-NOD-002",
    downstream: "INT-NOD-003",
    required: true,
    optional: false,
    order: 2,
    impact: "high",
    description: "Policy compliance rate requires dependency graph status",
  },
  {
    id: "INT-DEP-003",
    upstream: "INT-NOD-003",
    downstream: "INT-NOD-004",
    required: true,
    optional: false,
    order: 3,
    impact: "high",
    description: "Compatibility coverage requires policy gate compliance",
  },
  {
    id: "INT-DEP-004",
    upstream: "INT-NOD-004",
    downstream: "INT-NOD-005",
    required: true,
    optional: false,
    order: 4,
    impact: "medium",
    description: "Governance risk watch requires compatibility coverage",
  },
  {
    id: "INT-DEP-005",
    upstream: "INT-NOD-005",
    downstream: "INT-NOD-006",
    required: true,
    optional: false,
    order: 5,
    impact: "medium",
    description: "Lifecycle distribution requires governance risk context",
  },
  {
    id: "INT-DEP-006",
    upstream: "INT-NOD-006",
    downstream: "INT-NOD-007",
    required: true,
    optional: false,
    order: 6,
    impact: "high",
    description: "Compliance pass rate requires lifecycle state distribution",
  },
  {
    id: "INT-DEP-007",
    upstream: "INT-NOD-007",
    downstream: "INT-NOD-008",
    required: true,
    optional: false,
    order: 7,
    impact: "critical",
    description: "Intelligence foundation requires compliance pass rate",
  },
  {
    id: "INT-DEP-008",
    upstream: "INT-NOD-001",
    downstream: "INT-NOD-004",
    required: false,
    optional: true,
    order: 8,
    impact: "low",
    description: "Optional parallel shortcut from baseline health to compatibility coverage",
  },
];

export function isSignalDependencyRefsAligned(): boolean {
  const insightIds = new Set(INTELLIGENCE_CATALOG.map((i) => i.id));
  const nodeIds = new Set(SIGNAL_NODE_CATALOG.map((n) => n.id));

  const nodesAligned = SIGNAL_NODE_CATALOG.every((n) => insightIds.has(n.insightRef));
  const edgesAligned = SIGNAL_DEPENDENCY_CATALOG.every(
    (d) => nodeIds.has(d.upstream) && nodeIds.has(d.downstream),
  );
  const coverageComplete = SIGNAL_NODE_CATALOG.every((n) =>
    SIGNAL_DEPENDENCY_CATALOG.some((d) => d.upstream === n.id || d.downstream === n.id),
  );

  return nodesAligned && edgesAligned && coverageComplete;
}

export function buildSignalNodeManifest(): SignalNodeManifest {
  const nodes = SIGNAL_NODE_CATALOG;
  const catalogComplete = nodes.length >= 6;

  return {
    version: V72_SIGNAL_DEPENDENCY_VERSION,
    nodeCount: nodes.length,
    catalogComplete,
    nodes,
    summary: [`signal-nodes count=${nodes.length}`, `complete=${catalogComplete}`].join(" "),
  };
}

export function buildDependencyManifest(): DependencyManifest {
  const dependencies = SIGNAL_DEPENDENCY_CATALOG;
  const requiredCount = dependencies.filter((d) => d.required).length;
  const optionalCount = dependencies.filter((d) => d.optional).length;
  const catalogComplete =
    dependencies.length >= 6 && requiredCount >= 4 && optionalCount >= 1;

  return {
    version: V72_SIGNAL_DEPENDENCY_VERSION,
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

export function buildDeclarativeSignalAdjacency(): SignalDependencyAdjacency {
  const adj: SignalDependencyAdjacency = {};

  for (const node of SIGNAL_NODE_CATALOG) {
    adj[node.id] = [];
  }

  for (const dep of SIGNAL_DEPENDENCY_CATALOG) {
    adj[dep.upstream] = [...(adj[dep.upstream] ?? []), dep.downstream];
  }

  return adj;
}

export function computeCycleCheck(): CycleCheck {
  const adj = buildDeclarativeSignalAdjacency();
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
    checkedEdgeCount: SIGNAL_DEPENDENCY_CATALOG.length,
    cycleDetected,
    summary: [
      `cycle-check acyclic=${acyclic}`,
      `nodes=${nodes.length}`,
      `edges=${SIGNAL_DEPENDENCY_CATALOG.length}`,
    ].join(" "),
  };
}

export function buildSignalDependencyGraph(): SignalDependencyGraph {
  const adjacency = buildDeclarativeSignalAdjacency();
  const cycleCheck = computeCycleCheck();
  const nodeCount = Object.keys(adjacency).length;
  const edgeCount = SIGNAL_DEPENDENCY_CATALOG.length;
  const graphComplete = nodeCount >= 6 && edgeCount >= 6 && cycleCheck.acyclic;

  return {
    version: V72_SIGNAL_DEPENDENCY_VERSION,
    nodeCount,
    edgeCount,
    graphComplete,
    adjacency,
    cycleCheck,
    summary: [
      `signal-dependency-graph nodes=${nodeCount}`,
      `edges=${edgeCount}`,
      `acyclic=${cycleCheck.acyclic}`,
      `complete=${graphComplete}`,
    ].join(" "),
  };
}

export function getSignalNodeById(id: string): SignalNode | undefined {
  return SIGNAL_NODE_CATALOG.find((n) => n.id === id);
}

export function getDependencyById(id: string): Dependency | undefined {
  return SIGNAL_DEPENDENCY_CATALOG.find((d) => d.id === id);
}

export function getUpstreamNodes(nodeId: string): string[] {
  return SIGNAL_DEPENDENCY_CATALOG.filter((d) => d.downstream === nodeId).map(
    (d) => d.upstream,
  );
}

export function getDownstreamNodes(nodeId: string): string[] {
  return SIGNAL_DEPENDENCY_CATALOG.filter((d) => d.upstream === nodeId).map(
    (d) => d.downstream,
  );
}

export function getDependenciesByImpact(impact: SignalImpact): Dependency[] {
  return SIGNAL_DEPENDENCY_CATALOG.filter((d) => d.impact === impact);
}

export function computeDeclarativeImpactScore(input: { impact: SignalImpact }): number {
  const scores: Record<SignalImpact, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return scores[input.impact];
}
