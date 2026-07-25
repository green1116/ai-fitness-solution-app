/**
 * Product Identity — Token types
 */

import type { TOKEN_KINDS } from "../authentication/authentication.constants";

export type TokenKind = (typeof TOKEN_KINDS)[number];
export type TokenMetadata = Record<string, unknown>;

export type IdentityToken = {
  id: string;
  sessionId: string;
  principalId: string;
  kind: TokenKind;
  value: string;
  detail: string;
  metadata: TokenMetadata;
  issuedAt: string;
};

export type IssueTokenInput = {
  id?: string;
  sessionId: string;
  kind: TokenKind;
  value?: string;
  metadata?: TokenMetadata;
};
