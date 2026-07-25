/**
 * Product Report — Delivery types
 */

import type { DELIVERY_CHANNELS } from "../engine/engine.constants";

export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];
export type DeliveryMetadata = Record<string, unknown>;

export type ReportDelivery = {
  id: string;
  renderId: string;
  channel: DeliveryChannel;
  recipient: string;
  detail: string;
  metadata: DeliveryMetadata;
  deliveredAt: string;
};

export type DeliverReportInput = {
  id?: string;
  renderId: string;
  channel: DeliveryChannel;
  recipient: string;
  metadata?: DeliveryMetadata;
};
