/**
 * Product Report — Delivery registry
 */

import { DELIVERY_CHANNELS } from "../engine/engine.constants";
import { getRender } from "../render/render.registry";
import type {
  DeliverReportInput,
  DeliveryChannel,
  ReportDelivery,
} from "./delivery.types";

const deliveries = new Map<string, ReportDelivery>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDelivery(delivery: ReportDelivery): ReportDelivery {
  return { ...delivery, metadata: { ...delivery.metadata } };
}

export function deliverReport(input: DeliverReportInput): ReportDelivery {
  const renderId = input.renderId.trim();
  const recipient = input.recipient.trim();
  if (!renderId) throw new Error("delivery.renderId is required");
  if (!recipient) throw new Error("delivery.recipient is required");
  if (!(DELIVERY_CHANNELS as readonly string[]).includes(input.channel)) {
    throw new Error(`invalid delivery channel: ${input.channel}`);
  }
  if (!getRender(renderId)) {
    throw new Error(`render not found: ${renderId}`);
  }

  const id = input.id?.trim() || createId("rptdlv");
  if (deliveries.has(id)) {
    throw new Error(`delivery already exists: ${id}`);
  }

  const delivery: ReportDelivery = {
    id,
    renderId,
    channel: input.channel,
    recipient,
    detail: `channel=${input.channel} recipient=${recipient}`,
    metadata: { ...(input.metadata ?? {}) },
    deliveredAt: nowIso(),
  };
  deliveries.set(id, delivery);
  return cloneDelivery(delivery);
}

export function getDelivery(id: string): ReportDelivery | undefined {
  const delivery = deliveries.get(id.trim());
  return delivery ? cloneDelivery(delivery) : undefined;
}

export function listDeliveries(filter?: {
  channel?: DeliveryChannel;
  renderId?: string;
}): ReportDelivery[] {
  let result = [...deliveries.values()];
  if (filter?.channel) {
    result = result.filter((d) => d.channel === filter.channel);
  }
  if (filter?.renderId) {
    const renderId = filter.renderId.trim();
    result = result.filter((d) => d.renderId === renderId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDelivery);
}

export function clearDeliveries(): void {
  deliveries.clear();
}
