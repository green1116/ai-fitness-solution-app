/**
 * Product API Authentication — Credential registry
 */

import {
  API_CREDENTIAL_KINDS,
  API_CREDENTIAL_STATUSES,
} from "../management/management.constants";
import type {
  ApiCredential,
  ApiCredentialKind,
  ApiCredentialStatus,
  RegisterApiCredentialInput,
  UpdateApiCredentialStatusInput,
} from "./credential.types";

const credentials = new Map<string, ApiCredential>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCredential(credential: ApiCredential): ApiCredential {
  return { ...credential, metadata: { ...credential.metadata } };
}

export function registerApiCredential(
  input: RegisterApiCredentialInput,
): ApiCredential {
  const credentialKey = input.credentialKey.trim().toUpperCase();
  const apiKeyRef = input.apiKeyRef.trim().toUpperCase();
  const principalRef = input.principalRef.trim().toUpperCase();
  if (!credentialKey) throw new Error("credential.credentialKey is required");
  if (!apiKeyRef) throw new Error("credential.apiKeyRef is required");
  if (!principalRef) throw new Error("credential.principalRef is required");
  if (!(API_CREDENTIAL_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid credential kind: ${input.kind}`);
  }
  if (keys.has(credentialKey)) {
    throw new Error(`credentialKey already exists: ${credentialKey}`);
  }

  const id = input.id?.trim() || createId("apicred");
  if (credentials.has(id)) throw new Error(`credential already exists: ${id}`);

  const now = nowIso();
  const credential: ApiCredential = {
    id,
    credentialKey,
    apiKeyRef,
    kind: input.kind,
    status: API_CREDENTIAL_STATUSES[0],
    principalRef,
    detail: `kind=${input.kind} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  credentials.set(id, credential);
  keys.set(credentialKey, id);
  return cloneCredential(credential);
}

export function updateApiCredentialStatus(
  input: UpdateApiCredentialStatusInput,
): ApiCredential {
  const credentialId = input.credentialId.trim();
  if (!credentialId) throw new Error("credential.credentialId is required");
  if (!(API_CREDENTIAL_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid credential status: ${input.status}`);
  }

  const existing = credentials.get(credentialId);
  if (!existing) throw new Error(`credential not found: ${credentialId}`);

  const updated: ApiCredential = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  credentials.set(credentialId, updated);
  return cloneCredential(updated);
}

export function getApiCredential(id: string): ApiCredential | undefined {
  const credential = credentials.get(id.trim());
  return credential ? cloneCredential(credential) : undefined;
}

export function listApiCredentials(filter?: {
  kind?: ApiCredentialKind;
  status?: ApiCredentialStatus;
}): ApiCredential[] {
  let result = [...credentials.values()];
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.credentialKey.localeCompare(b.credentialKey))
    .map(cloneCredential);
}

export function clearApiCredentials(): void {
  credentials.clear();
  keys.clear();
}
