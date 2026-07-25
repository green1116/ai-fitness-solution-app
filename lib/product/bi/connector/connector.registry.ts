/**
 * Product BI — Connector registry
 */

import {
  BI_CONNECTOR_KINDS,
  BI_CONNECTOR_STATUSES,
} from "../integration/integration.constants";
import type {
  BiConnector,
  BiConnectorKind,
  BiConnectorStatus,
  ConnectBiInput,
  RegisterConnectorInput,
} from "./connector.types";

const connectors = new Map<string, BiConnector>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneConnector(connector: BiConnector): BiConnector {
  return { ...connector, metadata: { ...connector.metadata } };
}

export function registerConnector(
  input: RegisterConnectorInput,
): BiConnector {
  const name = input.name.trim();
  const endpoint = input.endpoint.trim();
  if (!name) throw new Error("connector.name is required");
  if (!endpoint) throw new Error("connector.endpoint is required");
  if (!(BI_CONNECTOR_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid bi connector kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("bicn");
  if (connectors.has(id)) throw new Error(`connector already exists: ${id}`);

  const now = nowIso();
  const connector: BiConnector = {
    id,
    name,
    kind: input.kind,
    endpoint,
    status: BI_CONNECTOR_STATUSES[0],
    detail: `kind=${input.kind} status=DISCONNECTED`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  connectors.set(id, connector);
  return cloneConnector(connector);
}

export function connectBi(input: ConnectBiInput): BiConnector {
  const connectorId = input.connectorId.trim();
  if (!connectorId) throw new Error("connector.connectorId is required");

  const existing = connectors.get(connectorId);
  if (!existing) throw new Error(`connector not found: ${connectorId}`);
  if (existing.status === "CONNECTED") {
    throw new Error(`connector already connected: ${connectorId}`);
  }

  const updated: BiConnector = {
    ...existing,
    status: "CONNECTED",
    detail: `kind=${existing.kind} status=CONNECTED`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  connectors.set(connectorId, updated);
  return cloneConnector(updated);
}

export function getConnector(id: string): BiConnector | undefined {
  const connector = connectors.get(id.trim());
  return connector ? cloneConnector(connector) : undefined;
}

export function listConnectors(filter?: {
  kind?: BiConnectorKind;
  status?: BiConnectorStatus;
}): BiConnector[] {
  let result = [...connectors.values()];
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneConnector);
}

export function clearConnectors(): void {
  connectors.clear();
}
