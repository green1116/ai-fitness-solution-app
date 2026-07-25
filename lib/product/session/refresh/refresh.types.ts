/**
 * Product Session — Refresh flow types
 */

export type RefreshMetadata = Record<string, unknown>;

export type SessionRefreshRecord = {
  id: string;
  sessionId: string;
  accessTokenId: string;
  refreshTokenId: string;
  detail: string;
  metadata: RefreshMetadata;
  refreshedAt: string;
};

export type RecordRefreshInput = {
  id?: string;
  sessionId: string;
  accessTokenId: string;
  refreshTokenId: string;
  metadata?: RefreshMetadata;
};
