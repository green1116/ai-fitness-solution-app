/**
 * Product API Authentication — API key types
 */

export type KeyMetadata = Record<string, unknown>;

export type ApiAuthKey = {
  id: string;
  keyId: string;
  credentialId: string;
  secretHash: string;
  detail: string;
  metadata: KeyMetadata;
  createdAt: string;
};

export type IssueApiAuthKeyInput = {
  id?: string;
  keyId: string;
  credentialId: string;
  secretMaterial: string;
  metadata?: KeyMetadata;
};
