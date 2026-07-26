/**
 * Product API Authentication — Credential types
 */

import type {
  API_CREDENTIAL_KINDS,
  API_CREDENTIAL_STATUSES,
} from "../management/management.constants";

export type ApiCredentialKind = (typeof API_CREDENTIAL_KINDS)[number];
export type ApiCredentialStatus = (typeof API_CREDENTIAL_STATUSES)[number];
export type CredentialMetadata = Record<string, unknown>;

export type ApiCredential = {
  id: string;
  credentialKey: string;
  apiKeyRef: string;
  kind: ApiCredentialKind;
  status: ApiCredentialStatus;
  principalRef: string;
  detail: string;
  metadata: CredentialMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterApiCredentialInput = {
  id?: string;
  credentialKey: string;
  apiKeyRef: string;
  kind: ApiCredentialKind;
  principalRef: string;
  metadata?: CredentialMetadata;
};

export type UpdateApiCredentialStatusInput = {
  credentialId: string;
  status: ApiCredentialStatus;
};
