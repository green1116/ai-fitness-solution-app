/**
 * Product App — definition types (metadata only, no runtime)
 */

export type DefinitionMetadata = Record<string, unknown>;

export type AppDefinition = {
  id: string;
  appId: string;
  definitionKey: string;
  summary: string;
  capabilityRef: string;
  detail: string;
  metadata: DefinitionMetadata;
  createdAt: string;
};

export type RegisterAppDefinitionInput = {
  id?: string;
  appId: string;
  definitionKey: string;
  summary: string;
  capabilityRef: string;
  metadata?: DefinitionMetadata;
};
