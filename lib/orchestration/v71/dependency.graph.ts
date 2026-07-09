/**
 * V71 P2 — Workflow dependency graph (declarative)
 */
import { ORCHESTRATION_CATALOG } from "./orchestration.catalog";
import type {
  CycleCheck,
  Dependency,
  DependencyManifest,
  WorkflowDependencyAdjacency,
  WorkflowDependencyGraph,
  WorkflowImpact,
  WorkflowNode,
  WorkflowNodeManifest,
} from "./workflow.dependency";
import { V71_WORKFLOW_DEPENDENCY_VERSION } from "./workflow.dependency";

export const WORKFLOW_NODE_CATALOG: WorkflowNode[] = [
  {
    id: "ORC-NOD-001",
    orchestrationRef: "ORC-001",
    label: "delivery-lifecycle-orchestration",
    order: 1,
    required: true,
    description: "Delivery lifecycle orchestration workflow node",
  },
  {
    id: "ORC-NOD-002",
    orchestrationRef: "ORC-002",
    label: "dependency-resolution-orchestration",
    order: 2,
    required: true,
    description: "Dependency resolution orchestration workflow node",
  },
  {
    id: "ORC-NOD-003",
    orchestrationRef: "ORC-003",
    label: "policy-gate-orchestration",
    order: 3,
    required: true,
    description: "Policy gate orchestration workflow node",
  },
  {
    id: "ORC-NOD-004",
    orchestrationRef: "ORC-004",
    label: "compatibility-scan-orchestration",
    order: 4,
    required: true,
    description: "Compatibility scan orchestration workflow node",
  },
  {
    id: "ORC-NOD-005",
    orchestrationRef: "ORC-005",
    label: "upgrade-plan-orchestration",
    order: 5,
    required: true,
    description: "Upgrade plan orchestration workflow node",
  },
  {
    id: "ORC-NOD-006",
    orchestrationRef: "ORC-006",
    label: "lifecycle-transition-orchestration",
    order: 6,
    required: true,
    description: "Lifecycle transition orchestration workflow node",
  },
  {
    id: "ORC-NOD-007",
    orchestrationRef: "ORC-007",
    label: "compliance-audit-orchestration",
    order: 7,
    required: true,
    description: "Compliance audit orchestration workflow node",
  },
  {
    id: "ORC-NOD-008",
    orchestrationRef: "ORC-008",
    label: "signoff-freeze-orchestration",
    order: 8,
    required: false,
    description: "Sign-off freeze orchestration workflow node",
  },
];

export const WORKFLOW_DEPENDENCY_CATALOG: Dependency[] = [
  {
    id: "ORC-DEP-001",
    upstream: "ORC-NOD-001",
    downstream: "ORC-NOD-002",
    required: true,
    optional: false,
    order: 1,
    impact: "critical",
    description: "Dependency resolution requires delivery lifecycle orchestration",
  },
  {
    id: "ORC-DEP-002",
    upstream: "ORC-NOD-002",
    downstream: "ORC-NOD-003",
    required: true,
    optional: false,
    order: 2,
    impact: "high",
    description: "Policy gate requires dependency graph manifest",
  },
  {
    id: "ORC-DEP-003",
    upstream: "ORC-NOD-003",
    downstream: "ORC-NOD-004",
    required: true,
    optional: false,
    order: 3,
    impact: "high",
    description: "Compatibility scan requires policy compliance report",
  },
  {
    id: "ORC-DEP-004",
    upstream: "ORC-NOD-004",
    downstream: "ORC-NOD-005",
    required: true,
    optional: false,
    order: 4,
    impact: "medium",
    description: "Upgrade plan requires compatibility matrix report",
  },
  {
    id: "ORC-DEP-005",
    upstream: "ORC-NOD-005",
    downstream: "ORC-NOD-006",
    required: true,
    optional: false,
    order: 5,
    impact: "medium",
    description: "Lifecycle transition requires upgrade plan manifest",
  },
  {
    id: "ORC-DEP-006",
    upstream: "ORC-NOD-006",
    downstream: "ORC-NOD-007",
    required: true,
    optional: false,
    order: 6,
    impact: "high",
    description: "Compliance audit requires lifecycle state report",
  },
  {
    id: "ORC-DEP-007",
    upstream: "ORC-NOD-007",
    downstream: "ORC-NOD-008",
    required: true,
    optional: false,
    order: 7,
    impact: "critical",
    description: "Sign-off freeze requires compliance audit report",
  },
  {
    id: "ORC-DEP-008",
    upstream: "ORC-NOD-001",
    downstream: "ORC-NOD-004",
    required: false,
    optional: true,
    order: 8,
    impact: "low",
    description: "Optional parallel shortcut from catalog init to compatibility scan",
  },
];

export function isWorkflowDependencyRefsAligned(): boolean {
  const orchestrationIds = new Set(ORCHESTRATION_CATALOG.map((o) => o.id));
  const nodeIds = new Set(WORKFLOW_NODE_CATALOG.map((n) => n.id));

  const nodesAligned = WORKFLOW_NODE_CATALOG.every((n) =>
    orchestrationIds.has(n.orchestrationRef),
  );
  const edgesAligned = WORKFLOW_DEPENDENCY_CATALOG.every(
    (d) => nodeIds.has(d.upstream) && nodeIds.has(d.downstream),
  );
  const coverageComplete = WORKFLOW_NODE_CATALOG.every((n) =>
    WORKFLOW_DEPENDENCY_CATALOG.some((d) => d.upstream === n.id || d.downstream === n.id),
  );

  return nodesAligned && edgesAligned && coverageComplete;
}

export function buildWorkflowNodeManifest(): WorkflowNodeManifest {
  const nodes = WORKFLOW_NODE_CATALOG;
  const catalogComplete = nodes.length >= 6;

  return {
    version: V71_WORKFLOW_DEPENDENCY_VERSION,
    nodeCount: nodes.length,
    catalogComplete,
    nodes,
    summary: [
      `workflow-nodes count=${nodes.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildDependencyManifest(): DependencyManifest {
  const dependencies = WORKFLOW_DEPENDENCY_CATALOG;
  const requiredCount = dependencies.filter((d) => d.required).length;
  const optionalCount = dependencies.filter((d) => d.optional).length;
  const catalogComplete =
    dependencies.length >= 6 && requiredCount >= 4 && optionalCount >= 1;

  return {
    version: V71_WORKFLOW_DEPENDENCY_VERSION,
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

export function buildDeclarativeWorkflowAdjacency(): WorkflowDependencyAdjacency {
  const adj: WorkflowDependencyAdjacency = {};

  for (const node of WORKFLOW_NODE_CATALOG) {
    adj[node.id] = [];
  }

  for (const dep of WORKFLOW_DEPENDENCY_CATALOG) {
    adj[dep.upstream] = [...(adj[dep.upstream] ?? []), dep.downstream];
  }

  return adj;
}

export function computeCycleCheck(): CycleCheck {
  const adj = buildDeclarativeWorkflowAdjacency();
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
    checkedEdgeCount: WORKFLOW_DEPENDENCY_CATALOG.length,
    cycleDetected,
    summary: [
      `cycle-check acyclic=${acyclic}`,
      `nodes=${nodes.length}`,
      `edges=${WORKFLOW_DEPENDENCY_CATALOG.length}`,
    ].join(" "),
  };
}

export function buildWorkflowDependencyGraph(): WorkflowDependencyGraph {
  const adjacency = buildDeclarativeWorkflowAdjacency();
  const cycleCheck = computeCycleCheck();
  const nodeCount = Object.keys(adjacency).length;
  const edgeCount = WORKFLOW_DEPENDENCY_CATALOG.length;
  const graphComplete = nodeCount >= 6 && edgeCount >= 6 && cycleCheck.acyclic;

  return {
    version: V71_WORKFLOW_DEPENDENCY_VERSION,
    nodeCount,
    edgeCount,
    graphComplete,
    adjacency,
    cycleCheck,
    summary: [
      `workflow-dependency-graph nodes=${nodeCount}`,
      `edges=${edgeCount}`,
      `acyclic=${cycleCheck.acyclic}`,
      `complete=${graphComplete}`,
    ].join(" "),
  };
}

export function getWorkflowNodeById(id: string): WorkflowNode | undefined {
  return WORKFLOW_NODE_CATALOG.find((n) => n.id === id);
}

export function getDependencyById(id: string): Dependency | undefined {
  return WORKFLOW_DEPENDENCY_CATALOG.find((d) => d.id === id);
}

export function getUpstreamNodes(nodeId: string): string[] {
  return WORKFLOW_DEPENDENCY_CATALOG.filter((d) => d.downstream === nodeId).map(
    (d) => d.upstream,
  );
}

export function getDownstreamNodes(nodeId: string): string[] {
  return WORKFLOW_DEPENDENCY_CATALOG.filter((d) => d.upstream === nodeId).map(
    (d) => d.downstream,
  );
}

export function getDependenciesByImpact(impact: WorkflowImpact): Dependency[] {
  return WORKFLOW_DEPENDENCY_CATALOG.filter((d) => d.impact === impact);
}

export function computeDeclarativeImpactScore(input: {
  impact: WorkflowImpact;
}): number {
  const scores: Record<WorkflowImpact, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return scores[input.impact];
}
