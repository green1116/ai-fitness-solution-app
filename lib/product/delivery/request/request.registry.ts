/**
 * Product Delivery — Request registry
 */

import {
  DELIVERY_REQUEST_PRIORITIES,
  PRODUCT_DELIVERY_ENGINE_BASE,
} from "../management/management.constants";
import type {
  CreateDeliveryRequestInput,
  DeliveryRequest,
  DeliveryRequestPriority,
} from "./request.types";

const requests = new Map<string, DeliveryRequest>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRequest(request: DeliveryRequest): DeliveryRequest {
  return { ...request, metadata: { ...request.metadata } };
}

export function createDeliveryRequest(
  input: CreateDeliveryRequestInput,
): DeliveryRequest {
  const requestKey = input.requestKey.trim().toUpperCase();
  const channelKey = input.channelKey.trim().toUpperCase();
  const templateKey = input.templateKey.trim().toUpperCase();
  if (!requestKey) throw new Error("request.requestKey is required");
  if (!channelKey) throw new Error("request.channelKey is required");
  if (!templateKey) throw new Error("request.templateKey is required");
  if (
    !(DELIVERY_REQUEST_PRIORITIES as readonly string[]).includes(input.priority)
  ) {
    throw new Error(`invalid request priority: ${input.priority}`);
  }
  if (keys.has(requestKey)) {
    throw new Error(`requestKey already exists: ${requestKey}`);
  }

  const id = input.id?.trim() || createId("dlvreq");
  if (requests.has(id)) throw new Error(`request already exists: ${id}`);

  const request: DeliveryRequest = {
    id,
    requestKey,
    channelKey,
    templateKey,
    priority: input.priority,
    detail: `channel=${channelKey} base=${PRODUCT_DELIVERY_ENGINE_BASE}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  requests.set(id, request);
  keys.set(requestKey, id);
  return cloneRequest(request);
}

export function getDeliveryRequest(id: string): DeliveryRequest | undefined {
  const request = requests.get(id.trim());
  return request ? cloneRequest(request) : undefined;
}

export function listDeliveryRequests(filter?: {
  priority?: DeliveryRequestPriority;
}): DeliveryRequest[] {
  let result = [...requests.values()];
  if (filter?.priority) {
    result = result.filter((r) => r.priority === filter.priority);
  }
  return result
    .slice()
    .sort((a, b) => a.requestKey.localeCompare(b.requestKey))
    .map(cloneRequest);
}

export function clearDeliveryRequests(): void {
  requests.clear();
  keys.clear();
}
