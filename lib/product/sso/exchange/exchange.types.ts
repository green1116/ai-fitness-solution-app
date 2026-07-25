/**
 * Product SSO — Exchange types (federation → local session)
 */

export type ExchangeMetadata = Record<string, unknown>;

export type SsoExchange = {
  id: string;
  assertionId: string;
  principalId: string;
  providerId: string;
  sessionId: string;
  detail: string;
  metadata: ExchangeMetadata;
  exchangedAt: string;
};

export type ExchangeSessionInput = {
  id?: string;
  assertionId: string;
  sessionId?: string;
  metadata?: ExchangeMetadata;
};
