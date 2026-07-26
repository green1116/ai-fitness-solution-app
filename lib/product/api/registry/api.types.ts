/**
 * Product API — Registry types
 */

import type { API_KINDS } from "../management/management.constants";

export type ApiKind = (typeof API_KINDS)[number];
export type ApiMetadata = Record<string, unknown>;

export type ProductApi = {
  id: string;
  apiKey: string;
  name: string;
  kind: ApiKind;
  detail: string;
  metadata: ApiMetadata;
  createdAt: string;
};

export type RegisterApiInput = {
  id?: string;
  apiKey: string;
  name: string;
  kind: ApiKind;
  metadata?: ApiMetadata;
};
