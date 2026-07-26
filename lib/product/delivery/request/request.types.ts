/**
 * Product Delivery — Request types
 */

import type { DELIVERY_REQUEST_PRIORITIES } from "../management/management.constants";

export type DeliveryRequestPriority =
  (typeof DELIVERY_REQUEST_PRIORITIES)[number];
export type RequestMetadata = Record<string, unknown>;

export type DeliveryRequest = {
  id: string;
  requestKey: string;
  channelKey: string;
  templateKey: string;
  priority: DeliveryRequestPriority;
  detail: string;
  metadata: RequestMetadata;
  createdAt: string;
};

export type CreateDeliveryRequestInput = {
  id?: string;
  requestKey: string;
  channelKey: string;
  templateKey: string;
  priority: DeliveryRequestPriority;
  metadata?: RequestMetadata;
};
