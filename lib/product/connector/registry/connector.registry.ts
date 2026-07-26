/**
 * Product Connector — registry
 */

import {
  CONNECTOR_KINDS,
  CONNECTOR_STATUSES,
} from "../management/management.constants";
import type {
  ConnectorKind,
  ConnectorStatus,
  ProductConnector,
  RegisterConnectorInput,
  UpdateConnectorStatusInput,
} from "./connector.types";

const connectors = new Map<string, ProductConnector>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneConnector(connector: ProductConnector): ProductConnector {
  return { ...connector, metadata: { ...connector.metadata } };
}

export function registerConnector(
  input: RegisterConnectorInput,
): ProductConnector {
  const connectorKey = input.connectorKey.trim().toUpperCase();
  const name = input.name.trim();
  if (!connectorKey) throw new Error("connector.connectorKey is required");
  if (!name) throw new Error("connector.name is required");
  if (!(CONNECTOR_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid connector kind: ${input.kind}`);
  }
  if (keys.has(connectorKey)) {
    throw new Error(`connectorKey already exists: ${connectorKey}`);
  }

  const id = input.id?.trim() || createId("conn");
  if (connectors.has(id)) throw new Error(`connector already exists: ${id}`);

  const now = nowIso();
  const connector: ProductConnector = {
    id,
    connectorKey,
    name,
    kind: input.kind,
    status: CONNECTOR_STATUSES[0],
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  connectors.set(id, connector);
  keys.set(connectorKey, id);
  return cloneConnector(connector);
}

export function updateConnectorStatus(
  input: UpdateConnectorStatusInput,
): ProductConnector {
  const connectorId = input.connectorId.trim();
  if (!connectorId) throw new Error("connector.connectorId is required");
  if (!(CONNECTOR_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid connector status: ${input.status}`);
  }

  const existing = connectors.get(connectorId);
  if (!existing) throw new Error(`connector not found: ${connectorId}`);

  const updated: ProductConnector = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  connectors.set(connectorId, updated);
  return cloneConnector(updated);
}

export function getConnector(id: string): ProductConnector | undefined {
  const connector = connectors.get(id.trim());
  return connector ? cloneConnector(connector) : undefined;
}

export function listConnectors(filter?: {
  kind?: ConnectorKind;
  status?: ConnectorStatus;
}): ProductConnector[] {
  let result = [...connectors.values()];
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.connectorKey.localeCompare(b.connectorKey))
    .map(cloneConnector);
}

export function clearConnectors(): void {
  connectors.clear();
  keys.clear();
}
