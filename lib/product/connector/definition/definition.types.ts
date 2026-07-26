/**
 * Product Connector — definition types (no runtime invocation)
 */

export type DefinitionMetadata = Record<string, unknown>;

export type ConnectorDefinition = {
  id: string;
  connectorId: string;
  operationKey: string;
  direction: string;
  summary: string;
  detail: string;
  metadata: DefinitionMetadata;
  createdAt: string;
};

export type DefineConnectorDefinitionInput = {
  id?: string;
  connectorId: string;
  operationKey: string;
  direction: string;
  summary: string;
  metadata?: DefinitionMetadata;
};
