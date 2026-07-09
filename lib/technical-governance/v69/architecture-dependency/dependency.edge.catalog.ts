/**
 * V69 P2 — Architecture dependency edge catalog (declarative, ARC-DEF-* aligned)
 */
import type {
  ArchitectureDependencyEdge,
  ArchitectureDependencyEdgeManifest,
} from "./dependency.types";
import { V69_ARCHITECTURE_DEPENDENCY_VERSION } from "./dependency.types";

export const ARCHITECTURE_DEPENDENCY_EDGE_CATALOG: ArchitectureDependencyEdge[] = [
  {
    id: "ADEP-EDGE-001",
    fromArcDefRef: "ARC-DEF-001",
    toArcDefRef: "ARC-DEF-002",
    kindRef: "ADEP-KND-001",
    strengthRef: "ADEP-STR-003",
    boundaryRef: "ADEP-BND-001",
    direction: "outbound",
    required: true,
    description: "Next.js presentation → API orchestration (sync, strong)",
  },
  {
    id: "ADEP-EDGE-002",
    fromArcDefRef: "ARC-DEF-002",
    toArcDefRef: "ARC-DEF-003",
    kindRef: "ADEP-KND-001",
    strengthRef: "ADEP-STR-002",
    boundaryRef: "ADEP-BND-001",
    direction: "outbound",
    required: true,
    description: "API orchestration → domain engines",
  },
  {
    id: "ADEP-EDGE-003",
    fromArcDefRef: "ARC-DEF-002",
    toArcDefRef: "ARC-DEF-004",
    kindRef: "ADEP-KND-003",
    strengthRef: "ADEP-STR-003",
    boundaryRef: "ADEP-BND-002",
    direction: "outbound",
    required: true,
    description: "API orchestration → Prisma data (cross-layer data)",
  },
  {
    id: "ADEP-EDGE-004",
    fromArcDefRef: "ARC-DEF-003",
    toArcDefRef: "ARC-DEF-004",
    kindRef: "ADEP-KND-003",
    strengthRef: "ADEP-STR-003",
    boundaryRef: "ADEP-BND-002",
    direction: "outbound",
    required: true,
    description: "Domain engines → Prisma data access",
  },
  {
    id: "ADEP-EDGE-005",
    fromArcDefRef: "ARC-DEF-008",
    toArcDefRef: "ARC-DEF-001",
    kindRef: "ADEP-KND-004",
    strengthRef: "ADEP-STR-004",
    boundaryRef: "ADEP-BND-003",
    direction: "inbound",
    required: true,
    description: "Security RBAC envelope over Next.js application",
  },
  {
    id: "ADEP-EDGE-006",
    fromArcDefRef: "ARC-DEF-005",
    toArcDefRef: "ARC-DEF-006",
    kindRef: "ADEP-KND-004",
    strengthRef: "ADEP-STR-002",
    boundaryRef: "ADEP-BND-004",
    direction: "outbound",
    required: true,
    description: "Deployment pipeline → platform governance (readonly)",
  },
  {
    id: "ADEP-EDGE-007",
    fromArcDefRef: "ARC-DEF-007",
    toArcDefRef: "ARC-DEF-002",
    kindRef: "ADEP-KND-005",
    strengthRef: "ADEP-STR-001",
    boundaryRef: "ADEP-BND-005",
    direction: "inbound",
    required: true,
    description: "Monitoring integration signal into API layer",
  },
  {
    id: "ADEP-EDGE-008",
    fromArcDefRef: "ARC-DEF-006",
    toArcDefRef: "ARC-DEF-007",
    kindRef: "ADEP-KND-005",
    strengthRef: "ADEP-STR-002",
    boundaryRef: "ADEP-BND-004",
    direction: "bidirectional",
    required: true,
    description: "Platform governance ↔ monitoring observability",
  },
];

export function buildArchitectureDependencyEdgeManifest(): ArchitectureDependencyEdgeManifest {
  const edges = ARCHITECTURE_DEPENDENCY_EDGE_CATALOG;
  const directions = new Set(edges.map((e) => e.direction));
  const catalogComplete = edges.length >= 6 && directions.size >= 2;

  return {
    version: V69_ARCHITECTURE_DEPENDENCY_VERSION,
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

export function getEdgesFromArcDef(arcDefRef: string): ArchitectureDependencyEdge[] {
  return ARCHITECTURE_DEPENDENCY_EDGE_CATALOG.filter((e) => e.fromArcDefRef === arcDefRef);
}

export function getEdgesToArcDef(arcDefRef: string): ArchitectureDependencyEdge[] {
  return ARCHITECTURE_DEPENDENCY_EDGE_CATALOG.filter((e) => e.toArcDefRef === arcDefRef);
}
