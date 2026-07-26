/**
 * Product API Authentication — Identity mapping types
 */

export type IdentityMetadata = Record<string, unknown>;

export type ApiIdentityMapping = {
  id: string;
  credentialId: string;
  authPrincipalId: string;
  productPrincipalRef: string;
  detail: string;
  metadata: IdentityMetadata;
  createdAt: string;
};

export type MapApiIdentityInput = {
  id?: string;
  credentialId: string;
  authPrincipalId: string;
  productPrincipalRef: string;
  metadata?: IdentityMetadata;
};
