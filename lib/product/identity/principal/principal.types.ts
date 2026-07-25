/**
 * Product Identity — Principal types
 */

import type { PRINCIPAL_KINDS } from "../authentication/authentication.constants";

export type PrincipalKind = (typeof PRINCIPAL_KINDS)[number];
export type PrincipalMetadata = Record<string, unknown>;

export type IdentityPrincipal = {
  id: string;
  kind: PrincipalKind;
  subject: string;
  displayName: string;
  detail: string;
  metadata: PrincipalMetadata;
  createdAt: string;
};

export type RegisterPrincipalInput = {
  id?: string;
  kind: PrincipalKind;
  subject: string;
  displayName: string;
  metadata?: PrincipalMetadata;
};
