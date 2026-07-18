/**
 * E08-P1 — Ecosystem Relationship Registry
 */

import { RELATIONSHIP_KINDS } from "../core/ecosystem.constants";
import type { RelationshipKind } from "../core/ecosystem.types";
import type {
  RelationshipDefinition,
  RelationshipRegistryManifest,
} from "./relationship.types";

export const RELATIONSHIP_CATALOG: RelationshipDefinition[] = [
  {
    id: "e08.rel.supply",
    kind: "supply",
    name: "Supply Link",
    description: "Inbound supply relationship from ecosystem suppliers",
    inputHints: ["sku", "capacity"],
    outputHints: ["availability", "leadTime"],
    readOnly: true,
  },
  {
    id: "e08.rel.distribute",
    kind: "distribute",
    name: "Distribution Link",
    description: "Outbound channel distribution relationship",
    inputHints: ["territory", "quota"],
    outputHints: ["coverage", "throughput"],
    readOnly: true,
  },
  {
    id: "e08.rel.serve",
    kind: "serve",
    name: "Customer Serve Link",
    description: "Customer-facing service relationship",
    inputHints: ["account", "need"],
    outputHints: ["serviceLevel", "satisfaction"],
    readOnly: true,
  },
  {
    id: "e08.rel.comply",
    kind: "comply",
    name: "Regulatory Comply Link",
    description: "Compliance relationship with regulators",
    inputHints: ["policy", "evidence"],
    outputHints: ["verdict", "findings"],
    readOnly: true,
  },
  {
    id: "e08.rel.alliance",
    kind: "alliance",
    name: "Alliance Link",
    description: "Strategic alliance relationship with partners",
    inputHints: ["scope", "commitment"],
    outputHints: ["jointPlan", "sharedValue"],
    readOnly: true,
  },
  {
    id: "e08.rel.coordinate",
    kind: "coordinate",
    name: "Hub Coordinate Link",
    description: "Cross-ecosystem coordination through the hub",
    inputHints: ["partners", "goal"],
    outputHints: ["plan", "assignments"],
    readOnly: true,
  },
];

export function getRelationshipById(
  id: string,
): RelationshipDefinition | undefined {
  return RELATIONSHIP_CATALOG.find((r) => r.id === id);
}

export function listRelationshipsByKind(
  kind: RelationshipKind,
): RelationshipDefinition[] {
  return RELATIONSHIP_CATALOG.filter((r) => r.kind === kind);
}

export function buildRelationshipRegistryManifest(
  relationships: RelationshipDefinition[] = RELATIONSHIP_CATALOG,
): RelationshipRegistryManifest {
  const kinds = new Set(relationships.map((r) => r.kind));
  const catalogComplete = RELATIONSHIP_KINDS.every((k) => kinds.has(k));
  if (!catalogComplete) {
    throw new Error("Relationship catalog incomplete: missing kinds");
  }

  return {
    relationshipCount: relationships.length,
    kinds: [...kinds] as RelationshipKind[],
    relationships,
    catalogComplete: true,
    readOnly: true,
  };
}
