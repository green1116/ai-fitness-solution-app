/**
 * Product Connector — binding registry (soft listing refs, no execution)
 */

import { CONNECTOR_BINDING_STATUSES } from "../management/management.constants";
import { getConnector } from "../registry/connector.registry";
import type {
  BindConnectorInput,
  ConnectorBinding,
  ConnectorBindingStatus,
  UpdateConnectorBindingStatusInput,
} from "./binding.types";

const bindings = new Map<string, ConnectorBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(binding: ConnectorBinding): ConnectorBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindConnector(input: BindConnectorInput): ConnectorBinding {
  const connectorId = input.connectorId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const listingKeyRef = input.listingKeyRef.trim().toUpperCase();
  if (!connectorId) throw new Error("binding.connectorId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!listingKeyRef) throw new Error("binding.listingKeyRef is required");

  const connector = getConnector(connectorId);
  if (!connector) throw new Error(`connector not found: ${connectorId}`);
  if (connector.status === "RETIRED") {
    throw new Error(`connector retired: ${connectorId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.connectorId === connectorId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("connbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: ConnectorBinding = {
    id,
    connectorId,
    bindingKey,
    listingKeyRef,
    status: CONNECTOR_BINDING_STATUSES[1],
    detail: `listing=${listingKeyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function updateConnectorBindingStatus(
  input: UpdateConnectorBindingStatusInput,
): ConnectorBinding {
  const bindingId = input.bindingId.trim();
  if (!bindingId) throw new Error("binding.bindingId is required");
  if (
    !(CONNECTOR_BINDING_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid binding status: ${input.status}`);
  }

  const existing = bindings.get(bindingId);
  if (!existing) throw new Error(`binding not found: ${bindingId}`);

  const updated: ConnectorBinding = {
    ...existing,
    status: input.status,
    detail: `listing=${existing.listingKeyRef} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  bindings.set(bindingId, updated);
  return cloneBinding(updated);
}

export function getConnectorBinding(id: string): ConnectorBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listConnectorBindings(filter?: {
  connectorId?: string;
  status?: ConnectorBindingStatus;
}): ConnectorBinding[] {
  let result = [...bindings.values()];
  if (filter?.connectorId) {
    const connectorId = filter.connectorId.trim();
    result = result.filter((b) => b.connectorId === connectorId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearConnectorBindings(): void {
  bindings.clear();
}
