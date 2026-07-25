/**
 * Product SSO — Connection registry
 */

import { SSO_CONNECTION_STATUSES } from "../federation/federation.constants";
import { getProvider } from "../provider/provider.registry";
import type {
  LinkConnectionInput,
  SsoConnection,
  SsoConnectionStatus,
  UpdateConnectionStatusInput,
} from "./connection.types";

const connections = new Map<string, SsoConnection>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneConnection(connection: SsoConnection): SsoConnection {
  return { ...connection, metadata: { ...connection.metadata } };
}

export function linkConnection(input: LinkConnectionInput): SsoConnection {
  const principalId = input.principalId.trim();
  const providerId = input.providerId.trim();
  const externalSubject = input.externalSubject.trim();
  if (!principalId) throw new Error("connection.principalId is required");
  if (!providerId) throw new Error("connection.providerId is required");
  if (!externalSubject) {
    throw new Error("connection.externalSubject is required");
  }

  const provider = getProvider(providerId);
  if (!provider) throw new Error(`provider not found: ${providerId}`);
  if (provider.status !== "ACTIVE") {
    throw new Error(`provider not active: ${providerId}`);
  }

  const duplicate = [...connections.values()].find(
    (c) =>
      c.providerId === providerId &&
      c.externalSubject === externalSubject &&
      c.status === "LINKED",
  );
  if (duplicate) {
    throw new Error(
      `connection already linked: provider=${providerId} subject=${externalSubject}`,
    );
  }

  const id = input.id?.trim() || createId("ssoconn");
  if (connections.has(id)) {
    throw new Error(`connection already exists: ${id}`);
  }

  const now = nowIso();
  const connection: SsoConnection = {
    id,
    principalId,
    providerId,
    externalSubject,
    status: "LINKED",
    detail: `provider=${providerId} subject=${externalSubject}`,
    metadata: { ...(input.metadata ?? {}) },
    linkedAt: now,
    updatedAt: now,
  };
  connections.set(id, connection);
  return cloneConnection(connection);
}

export function updateConnectionStatus(
  input: UpdateConnectionStatusInput,
): SsoConnection {
  const connectionId = input.connectionId.trim();
  if (!connectionId) throw new Error("connection.connectionId is required");
  if (!(SSO_CONNECTION_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid connection status: ${input.status}`);
  }

  const existing = connections.get(connectionId);
  if (!existing) throw new Error(`connection not found: ${connectionId}`);

  const updated: SsoConnection = {
    ...existing,
    status: input.status,
    detail: `provider=${existing.providerId} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  connections.set(connectionId, updated);
  return cloneConnection(updated);
}

export function getConnection(id: string): SsoConnection | undefined {
  const connection = connections.get(id.trim());
  return connection ? cloneConnection(connection) : undefined;
}

export function listConnections(filter?: {
  principalId?: string;
  providerId?: string;
  status?: SsoConnectionStatus;
}): SsoConnection[] {
  let result = [...connections.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((c) => c.principalId === pid);
  }
  if (filter?.providerId) {
    const providerId = filter.providerId.trim();
    result = result.filter((c) => c.providerId === providerId);
  }
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneConnection);
}

export function clearConnections(): void {
  connections.clear();
}
