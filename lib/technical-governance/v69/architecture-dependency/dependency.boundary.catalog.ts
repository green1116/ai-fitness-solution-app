/**
 * V69 P2 — Architecture dependency boundary catalog (declarative allowed boundaries)
 */
import type {
  ArchitectureDependencyBoundaryDefinition,
  ArchitectureDependencyBoundaryManifest,
} from "./dependency.types";
import { V69_ARCHITECTURE_DEPENDENCY_VERSION } from "./dependency.types";

export const ARCHITECTURE_DEPENDENCY_BOUNDARY_CATALOG: ArchitectureDependencyBoundaryDefinition[] =
  [
    {
      id: "ADEP-BND-001",
      kind: "layer-adjacent",
      label: "layer_adjacent_down",
      allowed: true,
      required: true,
      description: "Adjacent layer downward dependency (e.g. presentation → application)",
    },
    {
      id: "ADEP-BND-002",
      kind: "cross-layer",
      label: "cross_layer_skip",
      allowed: true,
      required: true,
      description: "Cross-layer skip allowed (e.g. application → data)",
    },
    {
      id: "ADEP-BND-003",
      kind: "security-envelope",
      label: "security_envelope",
      allowed: true,
      required: true,
      description: "Security layer envelope wrapping presentation/application",
    },
    {
      id: "ADEP-BND-004",
      kind: "governance-readonly",
      label: "governance_readonly",
      allowed: true,
      required: true,
      description: "Governance read-only observability boundary",
    },
    {
      id: "ADEP-BND-005",
      kind: "integration-signal",
      label: "integration_signal",
      allowed: true,
      required: true,
      description: "Integration layer signal into application",
    },
    {
      id: "ADEP-BND-006",
      kind: "layer-adjacent",
      label: "layer_adjacent_up",
      allowed: false,
      required: true,
      description: "Upward layer skip disallowed by default (declarative deny)",
    },
  ];

export function buildArchitectureDependencyBoundaryManifest(): ArchitectureDependencyBoundaryManifest {
  const boundaries = ARCHITECTURE_DEPENDENCY_BOUNDARY_CATALOG;
  const kinds = new Set(boundaries.map((b) => b.kind));
  const catalogComplete = boundaries.length >= 5 && kinds.size >= 4;

  return {
    version: V69_ARCHITECTURE_DEPENDENCY_VERSION,
    boundaryCount: boundaries.length,
    kindCount: kinds.size,
    catalogComplete,
    boundaries,
    summary: [
      `dependency-boundaries count=${boundaries.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getDependencyBoundaryById(
  id: string,
): ArchitectureDependencyBoundaryDefinition | undefined {
  return ARCHITECTURE_DEPENDENCY_BOUNDARY_CATALOG.find((b) => b.id === id);
}

export function isBoundaryAllowedForEdge(boundaryRef: string): boolean {
  const boundary = getDependencyBoundaryById(boundaryRef);
  return boundary?.allowed === true;
}
