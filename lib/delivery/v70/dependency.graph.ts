/**
 * V70 P2 — Release dependency graph (declarative)
 */
import { RELEASE_CATALOG } from "./release.catalog";
import type {
  CycleCheck,
  Dependency,
  DependencyManifest,
  ReleaseDependencyAdjacency,
  ReleaseDependencyGraph,
  ReleaseImpact,
  ReleaseNode,
  ReleaseNodeManifest,
} from "./release.dependency";
import { V70_RELEASE_DEPENDENCY_VERSION } from "./release.dependency";

export const RELEASE_NODE_CATALOG: ReleaseNode[] = [
  {
    id: "DLV-NOD-001",
    releaseRef: "DLV-REL-001",
    label: "technical-governance-baseline",
    order: 2,
    required: true,
    description: "V69 technical governance release node",
  },
  {
    id: "DLV-NOD-002",
    releaseRef: "DLV-REL-002",
    label: "platform-governance-baseline",
    order: 1,
    required: true,
    description: "V68 platform governance release node",
  },
  {
    id: "DLV-NOD-003",
    releaseRef: "DLV-REL-003",
    label: "application-runtime",
    order: 3,
    required: true,
    description: "Application production release node",
  },
  {
    id: "DLV-NOD-004",
    releaseRef: "DLV-REL-004",
    label: "api-surface",
    order: 4,
    required: true,
    description: "API surface release node",
  },
  {
    id: "DLV-NOD-005",
    releaseRef: "DLV-REL-005",
    label: "delivery-lifecycle-foundation",
    order: 5,
    required: true,
    description: "V70 delivery lifecycle release node",
  },
  {
    id: "DLV-NOD-006",
    releaseRef: "DLV-REL-006",
    label: "staging-candidate",
    order: 6,
    required: true,
    description: "Staging candidate release node",
  },
  {
    id: "DLV-NOD-007",
    releaseRef: "DLV-REL-007",
    label: "canary-probe",
    order: 7,
    required: false,
    description: "Canary probe release node",
  },
  {
    id: "DLV-NOD-008",
    releaseRef: "DLV-REL-008",
    label: "legacy-portal",
    order: 8,
    required: false,
    description: "Retired legacy portal release node",
  },
];

export const RELEASE_DEPENDENCY_CATALOG: Dependency[] = [
  {
    id: "DLV-DEP-001",
    upstream: "DLV-NOD-002",
    downstream: "DLV-NOD-001",
    required: true,
    optional: false,
    order: 1,
    impact: "critical",
    description: "Technical governance depends on platform governance",
  },
  {
    id: "DLV-DEP-002",
    upstream: "DLV-NOD-003",
    downstream: "DLV-NOD-004",
    required: true,
    optional: false,
    order: 2,
    impact: "high",
    description: "API surface depends on application runtime",
  },
  {
    id: "DLV-DEP-003",
    upstream: "DLV-NOD-001",
    downstream: "DLV-NOD-005",
    required: true,
    optional: false,
    order: 3,
    impact: "high",
    description: "Delivery lifecycle depends on technical governance",
  },
  {
    id: "DLV-DEP-004",
    upstream: "DLV-NOD-003",
    downstream: "DLV-NOD-006",
    required: true,
    optional: false,
    order: 4,
    impact: "medium",
    description: "Staging candidate depends on application runtime",
  },
  {
    id: "DLV-DEP-005",
    upstream: "DLV-NOD-004",
    downstream: "DLV-NOD-006",
    required: true,
    optional: false,
    order: 5,
    impact: "medium",
    description: "Staging candidate depends on API surface",
  },
  {
    id: "DLV-DEP-006",
    upstream: "DLV-NOD-006",
    downstream: "DLV-NOD-007",
    required: false,
    optional: true,
    order: 6,
    impact: "low",
    description: "Canary probe optionally depends on staging candidate",
  },
  {
    id: "DLV-DEP-007",
    upstream: "DLV-NOD-003",
    downstream: "DLV-NOD-008",
    required: false,
    optional: true,
    order: 7,
    impact: "low",
    description: "Legacy portal optional link to application runtime",
  },
  {
    id: "DLV-DEP-008",
    upstream: "DLV-NOD-001",
    downstream: "DLV-NOD-003",
    required: true,
    optional: false,
    order: 8,
    impact: "critical",
    description: "Application runtime depends on governance baseline",
  },
];

export function isReleaseDependencyRefsAligned(): boolean {
  const releaseIds = new Set(RELEASE_CATALOG.map((r) => r.id));
  const nodeIds = new Set(RELEASE_NODE_CATALOG.map((n) => n.id));

  const nodesAligned = RELEASE_NODE_CATALOG.every((n) => releaseIds.has(n.releaseRef));
  const edgesAligned = RELEASE_DEPENDENCY_CATALOG.every(
    (d) => nodeIds.has(d.upstream) && nodeIds.has(d.downstream),
  );
  const coverageComplete = RELEASE_NODE_CATALOG.every((n) =>
    RELEASE_DEPENDENCY_CATALOG.some((d) => d.upstream === n.id || d.downstream === n.id),
  );

  return nodesAligned && edgesAligned && coverageComplete;
}

export function buildReleaseNodeManifest(): ReleaseNodeManifest {
  const nodes = RELEASE_NODE_CATALOG;
  const catalogComplete = nodes.length >= 6;

  return {
    version: V70_RELEASE_DEPENDENCY_VERSION,
    nodeCount: nodes.length,
    catalogComplete,
    nodes,
    summary: [
      `release-nodes count=${nodes.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildDependencyManifest(): DependencyManifest {
  const dependencies = RELEASE_DEPENDENCY_CATALOG;
  const requiredCount = dependencies.filter((d) => d.required).length;
  const optionalCount = dependencies.filter((d) => d.optional).length;
  const catalogComplete =
    dependencies.length >= 6 && requiredCount >= 4 && optionalCount >= 1;

  return {
    version: V70_RELEASE_DEPENDENCY_VERSION,
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

export function buildDeclarativeReleaseAdjacency(): ReleaseDependencyAdjacency {
  const adj: ReleaseDependencyAdjacency = {};

  for (const node of RELEASE_NODE_CATALOG) {
    adj[node.id] = [];
  }

  for (const dep of RELEASE_DEPENDENCY_CATALOG) {
    adj[dep.upstream] = [...(adj[dep.upstream] ?? []), dep.downstream];
  }

  return adj;
}

export function computeCycleCheck(): CycleCheck {
  const adj = buildDeclarativeReleaseAdjacency();
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
    checkedEdgeCount: RELEASE_DEPENDENCY_CATALOG.length,
    cycleDetected,
    summary: [
      `cycle-check acyclic=${acyclic}`,
      `nodes=${nodes.length}`,
      `edges=${RELEASE_DEPENDENCY_CATALOG.length}`,
    ].join(" "),
  };
}

export function buildReleaseDependencyGraph(): ReleaseDependencyGraph {
  const adjacency = buildDeclarativeReleaseAdjacency();
  const cycleCheck = computeCycleCheck();
  const nodeCount = Object.keys(adjacency).length;
  const edgeCount = RELEASE_DEPENDENCY_CATALOG.length;
  const graphComplete = nodeCount >= 6 && edgeCount >= 6 && cycleCheck.acyclic;

  return {
    version: V70_RELEASE_DEPENDENCY_VERSION,
    nodeCount,
    edgeCount,
    graphComplete,
    adjacency,
    cycleCheck,
    summary: [
      `release-dependency-graph nodes=${nodeCount}`,
      `edges=${edgeCount}`,
      `acyclic=${cycleCheck.acyclic}`,
      `complete=${graphComplete}`,
    ].join(" "),
  };
}

export function getReleaseNodeById(id: string): ReleaseNode | undefined {
  return RELEASE_NODE_CATALOG.find((n) => n.id === id);
}

export function getDependencyById(id: string): Dependency | undefined {
  return RELEASE_DEPENDENCY_CATALOG.find((d) => d.id === id);
}

export function getUpstreamNodes(nodeId: string): string[] {
  return RELEASE_DEPENDENCY_CATALOG.filter((d) => d.downstream === nodeId).map(
    (d) => d.upstream,
  );
}

export function getDownstreamNodes(nodeId: string): string[] {
  return RELEASE_DEPENDENCY_CATALOG.filter((d) => d.upstream === nodeId).map(
    (d) => d.downstream,
  );
}

export function getDependenciesByImpact(impact: ReleaseImpact): Dependency[] {
  return RELEASE_DEPENDENCY_CATALOG.filter((d) => d.impact === impact);
}

export function computeDeclarativeImpactScore(input: {
  impact: ReleaseImpact;
}): number {
  const scores: Record<ReleaseImpact, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return scores[input.impact];
}
