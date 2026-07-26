/**
 * Product API Authentication — Authentication context types
 */

export type ContextMetadata = Record<string, unknown>;

export type ApiAuthenticationContext = {
  id: string;
  credentialId: string;
  identityId: string;
  tokenValidationId: string;
  authenticated: boolean;
  detail: string;
  metadata: ContextMetadata;
  createdAt: string;
};

export type BuildApiAuthenticationContextInput = {
  id?: string;
  credentialId: string;
  identityId: string;
  tokenValidationId: string;
  metadata?: ContextMetadata;
};
