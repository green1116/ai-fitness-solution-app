/**
 * Product Payment — Provider types
 */

import type {
  PAYMENT_PROVIDER_KINDS,
  PROVIDER_STATUSES,
} from "../integration/integration.constants";

export type PaymentProviderKind = (typeof PAYMENT_PROVIDER_KINDS)[number];
export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];
export type ProviderMetadata = Record<string, unknown>;

export type PaymentProvider = {
  id: string;
  code: string;
  name: string;
  kind: PaymentProviderKind;
  status: ProviderStatus;
  detail: string;
  metadata: ProviderMetadata;
  createdAt: string;
};

export type RegisterProviderInput = {
  id?: string;
  code: string;
  name: string;
  kind: PaymentProviderKind;
  metadata?: ProviderMetadata;
};

export type DisableProviderInput = {
  providerId: string;
};
