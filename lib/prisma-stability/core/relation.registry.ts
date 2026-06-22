/**
 * Prisma Stability — relation registry
 */

import type { ParsedSchema } from "../core/schema.parser";

export type RelationEdge = {
  fromModel: string;
  fromField: string;
  toModel: string;
  line: number;
};

const edges: RelationEdge[] = [];

export function registerRelationsFromSchema(schema: ParsedSchema): RelationEdge[] {
  edges.length = 0;
  for (const model of schema.models) {
    for (const field of model.fields) {
      if (field.isRelation && field.relationModel) {
        edges.push({
          fromModel: model.name,
          fromField: field.name,
          toModel: field.relationModel,
          line: field.line,
        });
      }
    }
  }
  return [...edges];
}

export function getRelationEdges(): RelationEdge[] {
  return [...edges];
}
