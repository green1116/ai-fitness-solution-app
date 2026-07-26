/**
 * Product API SDK — schema types (definition only)
 */

import type { SDK_SCHEMA_KINDS } from "../management/management.constants";

export type SdkSchemaKind = (typeof SDK_SCHEMA_KINDS)[number];
export type SdkSchemaMetadata = Record<string, unknown>;

export type SdkSchema = {
  id: string;
  operationId: string;
  schemaKey: string;
  kind: SdkSchemaKind;
  shapeRef: string;
  detail: string;
  metadata: SdkSchemaMetadata;
  createdAt: string;
};

export type RegisterSdkSchemaInput = {
  id?: string;
  operationId: string;
  schemaKey: string;
  kind: SdkSchemaKind;
  shapeRef: string;
  metadata?: SdkSchemaMetadata;
};
