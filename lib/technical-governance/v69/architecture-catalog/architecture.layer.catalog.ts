/**
 * V69 P1 — Architecture layer catalog (declarative)
 */
import type { ArchitectureLayerEntry, ArchitectureLayerManifest } from "./catalog.types";
import { V69_ARCHITECTURE_CATALOG_VERSION } from "./catalog.types";

export const ARCHITECTURE_LAYER_CATALOG: ArchitectureLayerEntry[] = [
  {
    id: "ARC-LAY-001",
    kind: "presentation",
    label: "presentation_layer",
    stackOrder: 1,
    required: true,
    description: "UI surfaces, pages, and client components",
  },
  {
    id: "ARC-LAY-002",
    kind: "application",
    label: "application_layer",
    stackOrder: 2,
    required: true,
    description: "API routes, server actions, orchestration",
  },
  {
    id: "ARC-LAY-003",
    kind: "domain",
    label: "domain_layer",
    stackOrder: 3,
    required: true,
    description: "Business domain modules and engines",
  },
  {
    id: "ARC-LAY-004",
    kind: "integration",
    label: "integration_layer",
    stackOrder: 4,
    required: true,
    description: "External integrations and adapters",
  },
  {
    id: "ARC-LAY-005",
    kind: "data",
    label: "data_layer",
    stackOrder: 5,
    required: true,
    description: "Persistence, schema, and data access",
  },
  {
    id: "ARC-LAY-006",
    kind: "infrastructure",
    label: "infrastructure_layer",
    stackOrder: 6,
    required: true,
    description: "Deployment, runtime, and environment",
  },
  {
    id: "ARC-LAY-007",
    kind: "governance",
    label: "governance_layer",
    stackOrder: 7,
    required: true,
    description: "Platform and technical governance modules",
  },
  {
    id: "ARC-LAY-008",
    kind: "security",
    label: "security_layer",
    stackOrder: 8,
    required: true,
    description: "Auth, RBAC, and security boundaries",
  },
];

export function buildArchitectureLayerManifest(): ArchitectureLayerManifest {
  const layers = ARCHITECTURE_LAYER_CATALOG;
  const kinds = new Set(layers.map((l) => l.kind));
  const catalogComplete = layers.length >= 6 && kinds.size >= 5;

  return {
    version: V69_ARCHITECTURE_CATALOG_VERSION,
    entryCount: layers.length,
    kindCount: kinds.size,
    catalogComplete,
    layers,
    summary: [
      `architecture-layers count=${layers.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getLayerById(id: string): ArchitectureLayerEntry | undefined {
  return ARCHITECTURE_LAYER_CATALOG.find((l) => l.id === id);
}
