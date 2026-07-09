/**
 * V69 P1 — Architecture definition catalog (declarative)
 */
import type { ArchitectureDefinition, ArchitectureDefinitionManifest } from "./catalog.types";
import { V69_ARCHITECTURE_CATALOG_VERSION } from "./catalog.types";

export const ARCHITECTURE_DEFINITION_CATALOG: ArchitectureDefinition[] = [
  {
    id: "ARC-DEF-001",
    name: "nextjs-application",
    layerRef: "ARC-LAY-001",
    criticality: "tier-1",
    lifecycle: "active",
    platformServiceRef: "SVC-DEF-001",
    required: true,
    description: "Next.js application presentation and routing surface",
  },
  {
    id: "ARC-DEF-002",
    name: "api-orchestration",
    layerRef: "ARC-LAY-002",
    criticality: "tier-1",
    lifecycle: "active",
    platformServiceRef: "SVC-DEF-001",
    required: true,
    description: "API route orchestration layer",
  },
  {
    id: "ARC-DEF-003",
    name: "domain-engines",
    layerRef: "ARC-LAY-003",
    criticality: "tier-2",
    lifecycle: "active",
    platformServiceRef: "SVC-DEF-003",
    required: true,
    description: "Domain engines and business logic modules",
  },
  {
    id: "ARC-DEF-004",
    name: "prisma-data-access",
    layerRef: "ARC-LAY-005",
    criticality: "tier-1",
    lifecycle: "active",
    platformServiceRef: "SVC-DEF-001",
    required: true,
    description: "Prisma schema and data access layer",
  },
  {
    id: "ARC-DEF-005",
    name: "deployment-pipeline",
    layerRef: "ARC-LAY-006",
    criticality: "tier-2",
    lifecycle: "active",
    platformServiceRef: "SVC-DEF-006",
    required: true,
    description: "Deployment verify and release pipeline",
  },
  {
    id: "ARC-DEF-006",
    name: "platform-governance",
    layerRef: "ARC-LAY-007",
    criticality: "tier-2",
    lifecycle: "active",
    platformServiceRef: "SVC-DEF-008",
    required: true,
    description: "V68 platform governance modules",
  },
  {
    id: "ARC-DEF-007",
    name: "monitoring-observability",
    layerRef: "ARC-LAY-004",
    criticality: "tier-1",
    lifecycle: "active",
    platformServiceRef: "SVC-DEF-008",
    required: true,
    description: "V67 monitoring integration layer — observability adapters",
  },
  {
    id: "ARC-DEF-008",
    name: "security-rbac",
    layerRef: "ARC-LAY-008",
    criticality: "tier-1",
    lifecycle: "active",
    platformServiceRef: "SVC-DEF-002",
    required: true,
    description: "Authentication, authorization, and RBAC surface",
  },
];

export function buildArchitectureDefinitionManifest(): ArchitectureDefinitionManifest {
  const definitions = ARCHITECTURE_DEFINITION_CATALOG;
  const layerRefs = new Set(definitions.map((d) => d.layerRef));
  const catalogComplete = definitions.length >= 6 && layerRefs.size >= 4;

  return {
    version: V69_ARCHITECTURE_CATALOG_VERSION,
    entryCount: definitions.length,
    layerKindCount: layerRefs.size,
    catalogComplete,
    definitions,
    summary: [
      `architecture-definitions count=${definitions.length}`,
      `layerRefs=${layerRefs.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getArchitectureDefinitionById(id: string): ArchitectureDefinition | undefined {
  return ARCHITECTURE_DEFINITION_CATALOG.find((d) => d.id === id);
}

export function getDefinitionsByLayerRef(layerRef: string): ArchitectureDefinition[] {
  return ARCHITECTURE_DEFINITION_CATALOG.filter((d) => d.layerRef === layerRef);
}
