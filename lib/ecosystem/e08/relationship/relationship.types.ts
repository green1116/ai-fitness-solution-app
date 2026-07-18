/**
 * E08-P1 — Ecosystem Relationship types
 */

import type { RelationshipKind } from "../core/ecosystem.types";

export type RelationshipDefinition = {
  id: string;
  kind: RelationshipKind;
  name: string;
  description: string;
  inputHints: string[];
  outputHints: string[];
  readOnly: true;
};

export type RelationshipRegistryManifest = {
  relationshipCount: number;
  kinds: RelationshipKind[];
  relationships: RelationshipDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
