/**
 * V69 P2 — Architecture dependency kind catalog (declarative)
 */
import type {
  ArchitectureDependencyKindDefinition,
  ArchitectureDependencyKindManifest,
} from "./dependency.types";
import { V69_ARCHITECTURE_DEPENDENCY_VERSION } from "./dependency.types";

export const ARCHITECTURE_DEPENDENCY_KIND_CATALOG: ArchitectureDependencyKindDefinition[] = [
  {
    id: "ADEP-KND-001",
    kind: "sync",
    label: "synchronous_call",
    blastRadius: "high",
    required: true,
    description: "Synchronous compile-time or runtime call dependency",
  },
  {
    id: "ADEP-KND-002",
    kind: "async",
    label: "async_event",
    blastRadius: "medium",
    required: true,
    description: "Asynchronous event or message dependency",
  },
  {
    id: "ADEP-KND-003",
    kind: "data",
    label: "data_flow",
    blastRadius: "high",
    required: true,
    description: "Data flow or persistence dependency",
  },
  {
    id: "ADEP-KND-004",
    kind: "control",
    label: "control_plane",
    blastRadius: "medium",
    required: true,
    description: "Control-plane orchestration dependency",
  },
  {
    id: "ADEP-KND-005",
    kind: "observability",
    label: "observability_signal",
    blastRadius: "low",
    required: true,
    description: "Metrics, tracing, or governance signal dependency",
  },
];

export function buildArchitectureDependencyKindManifest(): ArchitectureDependencyKindManifest {
  const kinds = ARCHITECTURE_DEPENDENCY_KIND_CATALOG;
  const uniqueKinds = new Set(kinds.map((k) => k.kind));
  const catalogComplete = kinds.length >= 4 && uniqueKinds.size >= 4;

  return {
    version: V69_ARCHITECTURE_DEPENDENCY_VERSION,
    kindCount: kinds.length,
    uniqueKindCount: uniqueKinds.size,
    catalogComplete,
    kinds,
    summary: [
      `dependency-kinds count=${kinds.length}`,
      `unique=${uniqueKinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getDependencyKindById(
  id: string,
): ArchitectureDependencyKindDefinition | undefined {
  return ARCHITECTURE_DEPENDENCY_KIND_CATALOG.find((k) => k.id === id);
}
