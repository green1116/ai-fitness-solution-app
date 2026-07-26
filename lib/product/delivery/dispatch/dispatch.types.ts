/**
 * Product Delivery — Dispatch contract types (provider-agnostic)
 */

import type { DELIVERY_DISPATCH_CONTRACT_STATUSES } from "../management/management.constants";

export type DeliveryDispatchContractStatus =
  (typeof DELIVERY_DISPATCH_CONTRACT_STATUSES)[number];
export type DispatchMetadata = Record<string, unknown>;

export type DeliveryDispatchContract = {
  id: string;
  requestId: string;
  channelKey: string;
  contractKey: string;
  status: DeliveryDispatchContractStatus;
  detail: string;
  metadata: DispatchMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterDeliveryDispatchContractInput = {
  id?: string;
  requestId: string;
  channelKey: string;
  contractKey: string;
  metadata?: DispatchMetadata;
};

export type UpdateDeliveryDispatchContractStatusInput = {
  contractId: string;
  status: DeliveryDispatchContractStatus;
};
