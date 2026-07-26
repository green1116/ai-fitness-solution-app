/**
 * Product Delivery — Status types
 */

import type { DELIVERY_STATUSES } from "../management/management.constants";

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];
export type StatusMetadata = Record<string, unknown>;

export type DeliveryStatusRecord = {
  id: string;
  requestId: string;
  status: DeliveryStatus;
  attempt: number;
  detail: string;
  metadata: StatusMetadata;
  createdAt: string;
  updatedAt: string;
};

export type OpenDeliveryStatusInput = {
  id?: string;
  requestId: string;
  metadata?: StatusMetadata;
};

export type UpdateDeliveryStatusInput = {
  statusId: string;
  status: DeliveryStatus;
  attempt?: number;
};
