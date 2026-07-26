/**
 * Product API SDK — client types (definition only, no runtime)
 */

import type {
  SDK_CLIENT_KINDS,
  SDK_CLIENT_STATUSES,
} from "../management/management.constants";

export type SdkClientKind = (typeof SDK_CLIENT_KINDS)[number];
export type SdkClientStatus = (typeof SDK_CLIENT_STATUSES)[number];
export type SdkClientMetadata = Record<string, unknown>;

export type SdkClient = {
  id: string;
  clientKey: string;
  name: string;
  kind: SdkClientKind;
  status: SdkClientStatus;
  gatewayKeyRef: string;
  detail: string;
  metadata: SdkClientMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterSdkClientInput = {
  id?: string;
  clientKey: string;
  name: string;
  kind: SdkClientKind;
  gatewayKeyRef: string;
  metadata?: SdkClientMetadata;
};

export type UpdateSdkClientStatusInput = {
  clientId: string;
  status: SdkClientStatus;
};
