/**
 * Product P8 — Delivery registry
 */

import { DELIVERY_CHANNELS } from "../tender/tender.constants";
import { getTender } from "../tender/tender.registry";
import type {
  CreateDeliveryInput,
  DeliveryChannel,
  TenderDelivery,
} from "./delivery.types";

const deliveries = new Map<string, TenderDelivery>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDelivery(delivery: TenderDelivery): TenderDelivery {
  return { ...delivery, metadata: { ...delivery.metadata } };
}

export function createDelivery(input: CreateDeliveryInput): TenderDelivery {
  const tenderId = input.tenderId.trim();
  const recipient = input.recipient.trim();
  if (!tenderId) throw new Error("delivery.tenderId is required");
  if (!recipient) throw new Error("delivery.recipient is required");
  if (!(DELIVERY_CHANNELS as readonly string[]).includes(input.channel)) {
    throw new Error(`invalid delivery channel: ${input.channel}`);
  }
  if (!getTender(tenderId)) {
    throw new Error(`tender not found: ${tenderId}`);
  }

  const id = input.id?.trim() || createId("p8dlv");
  if (deliveries.has(id)) {
    throw new Error(`delivery already exists: ${id}`);
  }

  const address = (input.address ?? "").trim() || `via ${input.channel}`;
  const delivery: TenderDelivery = {
    id,
    tenderId,
    channel: input.channel,
    recipient,
    address,
    detail: `channel=${input.channel} recipient=${recipient}`,
    metadata: { ...(input.metadata ?? {}) },
    scheduledAt: nowIso(),
  };
  deliveries.set(id, delivery);
  return cloneDelivery(delivery);
}

export function getDelivery(id: string): TenderDelivery | undefined {
  const delivery = deliveries.get(id.trim());
  return delivery ? cloneDelivery(delivery) : undefined;
}

export function listDeliveries(filter?: {
  tenderId?: string;
  channel?: DeliveryChannel;
}): TenderDelivery[] {
  let result = [...deliveries.values()];
  if (filter?.tenderId) {
    const tid = filter.tenderId.trim();
    result = result.filter((d) => d.tenderId === tid);
  }
  if (filter?.channel) {
    result = result.filter((d) => d.channel === filter.channel);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDelivery);
}

export function clearDeliveries(): void {
  deliveries.clear();
}
