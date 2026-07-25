/**
 * Product P8 — Delivery types
 */

import type { DELIVERY_CHANNELS } from "../tender/tender.constants";

export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];
export type DeliveryMetadata = Record<string, unknown>;

export type TenderDelivery = {
  id: string;
  tenderId: string;
  channel: DeliveryChannel;
  recipient: string;
  address: string;
  detail: string;
  metadata: DeliveryMetadata;
  scheduledAt: string;
};

export type CreateDeliveryInput = {
  id?: string;
  tenderId: string;
  channel: DeliveryChannel;
  recipient: string;
  address?: string;
  metadata?: DeliveryMetadata;
};
