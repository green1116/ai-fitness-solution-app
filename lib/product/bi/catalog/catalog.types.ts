/**
 * Product BI — Catalog types
 */

export type CatalogMetadata = Record<string, unknown>;

export type BiCatalogEntry = {
  id: string;
  connectorId: string;
  datasetCode: string;
  sourceRef: string;
  detail: string;
  metadata: CatalogMetadata;
  registeredAt: string;
};

export type RegisterCatalogEntryInput = {
  id?: string;
  connectorId: string;
  datasetCode: string;
  sourceRef: string;
  metadata?: CatalogMetadata;
};
