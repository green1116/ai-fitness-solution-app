/**
 * Product API — Definition types
 */

export type DefinitionMetadata = Record<string, unknown>;

export type ApiDefinition = {
  id: string;
  apiId: string;
  path: string;
  method: string;
  summary: string;
  detail: string;
  metadata: DefinitionMetadata;
  createdAt: string;
};

export type DefineApiDefinitionInput = {
  id?: string;
  apiId: string;
  path: string;
  method: string;
  summary: string;
  metadata?: DefinitionMetadata;
};
