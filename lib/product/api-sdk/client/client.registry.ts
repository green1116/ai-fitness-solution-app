/**
 * Product API SDK — client registry
 */

import {
  SDK_CLIENT_KINDS,
  SDK_CLIENT_STATUSES,
} from "../management/management.constants";
import type {
  RegisterSdkClientInput,
  SdkClient,
  SdkClientKind,
  SdkClientStatus,
  UpdateSdkClientStatusInput,
} from "./client.types";

const clients = new Map<string, SdkClient>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneClient(client: SdkClient): SdkClient {
  return { ...client, metadata: { ...client.metadata } };
}

export function registerSdkClient(input: RegisterSdkClientInput): SdkClient {
  const clientKey = input.clientKey.trim().toUpperCase();
  const name = input.name.trim();
  const gatewayKeyRef = input.gatewayKeyRef.trim().toUpperCase();
  if (!clientKey) throw new Error("client.clientKey is required");
  if (!name) throw new Error("client.name is required");
  if (!gatewayKeyRef) throw new Error("client.gatewayKeyRef is required");
  if (!(SDK_CLIENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid client kind: ${input.kind}`);
  }
  if (keys.has(clientKey)) {
    throw new Error(`clientKey already exists: ${clientKey}`);
  }

  const id = input.id?.trim() || createId("apisdkcli");
  if (clients.has(id)) throw new Error(`client already exists: ${id}`);

  const now = nowIso();
  const client: SdkClient = {
    id,
    clientKey,
    name,
    kind: input.kind,
    status: SDK_CLIENT_STATUSES[0],
    gatewayKeyRef,
    detail: `kind=${input.kind} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  clients.set(id, client);
  keys.set(clientKey, id);
  return cloneClient(client);
}

export function updateSdkClientStatus(
  input: UpdateSdkClientStatusInput,
): SdkClient {
  const clientId = input.clientId.trim();
  if (!clientId) throw new Error("client.clientId is required");
  if (!(SDK_CLIENT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid client status: ${input.status}`);
  }

  const existing = clients.get(clientId);
  if (!existing) throw new Error(`client not found: ${clientId}`);

  const updated: SdkClient = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  clients.set(clientId, updated);
  return cloneClient(updated);
}

export function getSdkClient(id: string): SdkClient | undefined {
  const client = clients.get(id.trim());
  return client ? cloneClient(client) : undefined;
}

export function listSdkClients(filter?: {
  kind?: SdkClientKind;
  status?: SdkClientStatus;
}): SdkClient[] {
  let result = [...clients.values()];
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.clientKey.localeCompare(b.clientKey))
    .map(cloneClient);
}

export function clearSdkClients(): void {
  clients.clear();
  keys.clear();
}
