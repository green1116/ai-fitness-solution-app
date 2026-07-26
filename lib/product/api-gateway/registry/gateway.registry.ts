/**
 * Product API Gateway — gateway registry
 */

import { GATEWAY_STATUSES } from "../management/management.constants";
import type {
  GatewayStatus,
  ProductGateway,
  RegisterGatewayInput,
  UpdateGatewayStatusInput,
} from "./gateway.types";

const gateways = new Map<string, ProductGateway>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneGateway(gateway: ProductGateway): ProductGateway {
  return { ...gateway, metadata: { ...gateway.metadata } };
}

export function registerGateway(input: RegisterGatewayInput): ProductGateway {
  const gatewayKey = input.gatewayKey.trim().toUpperCase();
  const name = input.name.trim();
  if (!gatewayKey) throw new Error("gateway.gatewayKey is required");
  if (!name) throw new Error("gateway.name is required");
  if (keys.has(gatewayKey)) {
    throw new Error(`gatewayKey already exists: ${gatewayKey}`);
  }

  const id = input.id?.trim() || createId("apigw");
  if (gateways.has(id)) throw new Error(`gateway already exists: ${id}`);

  const now = nowIso();
  const gateway: ProductGateway = {
    id,
    gatewayKey,
    name,
    status: GATEWAY_STATUSES[0],
    detail: `status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  gateways.set(id, gateway);
  keys.set(gatewayKey, id);
  return cloneGateway(gateway);
}

export function updateGatewayStatus(
  input: UpdateGatewayStatusInput,
): ProductGateway {
  const gatewayId = input.gatewayId.trim();
  if (!gatewayId) throw new Error("gateway.gatewayId is required");
  if (!(GATEWAY_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid gateway status: ${input.status}`);
  }

  const existing = gateways.get(gatewayId);
  if (!existing) throw new Error(`gateway not found: ${gatewayId}`);

  const updated: ProductGateway = {
    ...existing,
    status: input.status,
    detail: `status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  gateways.set(gatewayId, updated);
  return cloneGateway(updated);
}

export function getGateway(id: string): ProductGateway | undefined {
  const gateway = gateways.get(id.trim());
  return gateway ? cloneGateway(gateway) : undefined;
}

export function listGateways(filter?: {
  status?: GatewayStatus;
}): ProductGateway[] {
  let result = [...gateways.values()];
  if (filter?.status) {
    result = result.filter((g) => g.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.gatewayKey.localeCompare(b.gatewayKey))
    .map(cloneGateway);
}

export function clearGateways(): void {
  gateways.clear();
  keys.clear();
}
