/**
 * Product SSO — Connection types (principal ↔ provider)
 */

import type { SSO_CONNECTION_STATUSES } from "../federation/federation.constants";

export type SsoConnectionStatus = (typeof SSO_CONNECTION_STATUSES)[number];
export type ConnectionMetadata = Record<string, unknown>;

export type SsoConnection = {
  id: string;
  principalId: string;
  providerId: string;
  externalSubject: string;
  status: SsoConnectionStatus;
  detail: string;
  metadata: ConnectionMetadata;
  linkedAt: string;
  updatedAt: string;
};

export type LinkConnectionInput = {
  id?: string;
  principalId: string;
  providerId: string;
  externalSubject: string;
  metadata?: ConnectionMetadata;
};

export type UpdateConnectionStatusInput = {
  connectionId: string;
  status: SsoConnectionStatus;
};
