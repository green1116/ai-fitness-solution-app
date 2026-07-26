/**
 * Product API SDK — operation types (catalog only, no execution)
 */

import type { SDK_OPERATION_METHODS } from "../management/management.constants";

export type SdkOperationMethod = (typeof SDK_OPERATION_METHODS)[number];
export type SdkOperationMetadata = Record<string, unknown>;

export type SdkOperation = {
  id: string;
  clientId: string;
  operationKey: string;
  method: SdkOperationMethod;
  path: string;
  routeKeyRef: string;
  detail: string;
  metadata: SdkOperationMetadata;
  createdAt: string;
};

export type RegisterSdkOperationInput = {
  id?: string;
  clientId: string;
  operationKey: string;
  method: SdkOperationMethod;
  path: string;
  routeKeyRef: string;
  metadata?: SdkOperationMetadata;
};
