/**
 * V68 P2 — Dependency edge catalog (declarative, aligned with P1 service catalog)
 */
import type { DependencyEdge, DependencyEdgeManifest } from "./graph.types";
import { V68_DEPENDENCY_GRAPH_VERSION } from "./graph.types";

export const DEPENDENCY_EDGE_CATALOG: DependencyEdge[] = [
  {
    id: "DEP-EDGE-001",
    fromServiceRef: "SVC-DEF-001",
    toServiceRef: "SVC-DEF-002",
    typeRef: "DEP-TYP-001",
    direction: "outbound",
    required: true,
    description: "Production API depends on health probe (sync)",
  },
  {
    id: "DEP-EDGE-002",
    fromServiceRef: "SVC-DEF-001",
    toServiceRef: "SVC-DEF-008",
    typeRef: "DEP-TYP-005",
    direction: "outbound",
    required: true,
    description: "Production API observability via SLO monitoring",
  },
  {
    id: "DEP-EDGE-003",
    fromServiceRef: "SVC-DEF-003",
    toServiceRef: "SVC-DEF-004",
    typeRef: "DEP-TYP-004",
    direction: "bidirectional",
    required: true,
    description: "Incident lifecycle ↔ alert routing control plane",
  },
  {
    id: "DEP-EDGE-004",
    fromServiceRef: "SVC-DEF-005",
    toServiceRef: "SVC-DEF-004",
    typeRef: "DEP-TYP-002",
    direction: "outbound",
    required: true,
    description: "On-call response triggered by alert routing events",
  },
  {
    id: "DEP-EDGE-005",
    fromServiceRef: "SVC-DEF-006",
    toServiceRef: "SVC-DEF-002",
    typeRef: "DEP-TYP-001",
    direction: "outbound",
    required: true,
    description: "Deployment verify depends on health probe",
  },
  {
    id: "DEP-EDGE-006",
    fromServiceRef: "SVC-DEF-007",
    toServiceRef: "SVC-DEF-002",
    typeRef: "DEP-TYP-001",
    direction: "outbound",
    required: true,
    description: "Readiness probe depends on health probe",
  },
  {
    id: "DEP-EDGE-007",
    fromServiceRef: "SVC-DEF-008",
    toServiceRef: "SVC-DEF-001",
    typeRef: "DEP-TYP-005",
    direction: "inbound",
    required: true,
    description: "SLO monitoring observes production API (inbound signal)",
  },
  {
    id: "DEP-EDGE-008",
    fromServiceRef: "SVC-DEF-004",
    toServiceRef: "SVC-DEF-005",
    typeRef: "DEP-TYP-002",
    direction: "outbound",
    required: true,
    description: "Alert routing escalates to on-call response",
  },
];

export function buildDependencyEdgeManifest(): DependencyEdgeManifest {
  const edges = DEPENDENCY_EDGE_CATALOG;
  const directions = new Set(edges.map((e) => e.direction));
  const catalogComplete = edges.length >= 6 && directions.size >= 2;

  return {
    version: V68_DEPENDENCY_GRAPH_VERSION,
    edgeCount: edges.length,
    directionCount: directions.size,
    catalogComplete,
    edges,
    summary: [
      `dependency-edges count=${edges.length}`,
      `directions=${directions.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getEdgesFromService(serviceRef: string): DependencyEdge[] {
  return DEPENDENCY_EDGE_CATALOG.filter((e) => e.fromServiceRef === serviceRef);
}

export function getEdgesToService(serviceRef: string): DependencyEdge[] {
  return DEPENDENCY_EDGE_CATALOG.filter((e) => e.toServiceRef === serviceRef);
}
