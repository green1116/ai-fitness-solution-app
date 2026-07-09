/**
 * V68 P2 — Dependency type catalog (declarative)
 */
import type { DependencyTypeDefinition, DependencyTypeManifest } from "./graph.types";
import { V68_DEPENDENCY_GRAPH_VERSION } from "./graph.types";

export const DEPENDENCY_TYPE_CATALOG: DependencyTypeDefinition[] = [
  {
    id: "DEP-TYP-001",
    kind: "sync",
    label: "synchronous_call",
    blastRadius: "high",
    required: true,
    description: "Synchronous request/response dependency",
  },
  {
    id: "DEP-TYP-002",
    kind: "async",
    label: "async_event",
    blastRadius: "medium",
    required: true,
    description: "Asynchronous event or message dependency",
  },
  {
    id: "DEP-TYP-003",
    kind: "data",
    label: "data_store",
    blastRadius: "high",
    required: true,
    description: "Shared data or persistence dependency",
  },
  {
    id: "DEP-TYP-004",
    kind: "control",
    label: "control_plane",
    blastRadius: "medium",
    required: true,
    description: "Control-plane orchestration dependency",
  },
  {
    id: "DEP-TYP-005",
    kind: "observability",
    label: "observability_signal",
    blastRadius: "low",
    required: true,
    description: "Metrics, health, or SLO observability dependency",
  },
];

export function buildDependencyTypeManifest(): DependencyTypeManifest {
  const types = DEPENDENCY_TYPE_CATALOG;
  const kinds = new Set(types.map((t) => t.kind));
  const catalogComplete = types.length >= 4 && kinds.size >= 4;

  return {
    version: V68_DEPENDENCY_GRAPH_VERSION,
    typeCount: types.length,
    kindCount: kinds.size,
    catalogComplete,
    types,
    summary: [
      `dependency-types count=${types.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getDependencyTypeById(id: string): DependencyTypeDefinition | undefined {
  return DEPENDENCY_TYPE_CATALOG.find((t) => t.id === id);
}
