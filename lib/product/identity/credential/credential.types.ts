/**
 * Product Identity — Credential types
 */

import type { CREDENTIAL_KINDS } from "../authentication/authentication.constants";

export type CredentialKind = (typeof CREDENTIAL_KINDS)[number];
export type CredentialMetadata = Record<string, unknown>;

export type IdentityCredential = {
  id: string;
  principalId: string;
  kind: CredentialKind;
  label: string;
  active: boolean;
  detail: string;
  metadata: CredentialMetadata;
  issuedAt: string;
};

export type IssueCredentialInput = {
  id?: string;
  principalId: string;
  kind: CredentialKind;
  label: string;
  metadata?: CredentialMetadata;
};
