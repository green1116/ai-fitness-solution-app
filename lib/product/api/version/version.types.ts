/**
 * Product API — Version types
 */

export type VersionMetadata = Record<string, unknown>;

export type ApiVersion = {
  id: string;
  apiId: string;
  versionTag: string;
  definitionIds: string[];
  detail: string;
  metadata: VersionMetadata;
  createdAt: string;
};

export type RegisterApiVersionInput = {
  id?: string;
  apiId: string;
  versionTag: string;
  definitionIds: string[];
  metadata?: VersionMetadata;
};
