/**
 * Product SSO — Provider types
 */

import type {
  SSO_PROVIDER_PROTOCOLS,
  SSO_PROVIDER_STATUSES,
} from "../federation/federation.constants";

export type SsoProviderProtocol = (typeof SSO_PROVIDER_PROTOCOLS)[number];
export type SsoProviderStatus = (typeof SSO_PROVIDER_STATUSES)[number];
export type ProviderMetadata = Record<string, unknown>;

export type SsoProvider = {
  id: string;
  name: string;
  protocol: SsoProviderProtocol;
  status: SsoProviderStatus;
  issuer: string;
  detail: string;
  metadata: ProviderMetadata;
  createdAt: string;
  activatedAt?: string;
};

export type RegisterProviderInput = {
  id?: string;
  name: string;
  protocol: SsoProviderProtocol;
  issuer: string;
  metadata?: ProviderMetadata;
};

export type ActivateProviderInput = {
  providerId: string;
};

export type DisableProviderInput = {
  providerId: string;
};
