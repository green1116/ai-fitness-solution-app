/**
 * Product Identity — Credential registry
 */

import { CREDENTIAL_KINDS } from "../authentication/authentication.constants";
import { getPrincipal } from "../principal/principal.registry";
import type {
  CredentialKind,
  IdentityCredential,
  IssueCredentialInput,
} from "./credential.types";

const credentials = new Map<string, IdentityCredential>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCredential(
  credential: IdentityCredential,
): IdentityCredential {
  return { ...credential, metadata: { ...credential.metadata } };
}

export function issueCredential(
  input: IssueCredentialInput,
): IdentityCredential {
  const principalId = input.principalId.trim();
  const label = input.label.trim();
  if (!principalId) throw new Error("credential.principalId is required");
  if (!label) throw new Error("credential.label is required");
  if (!(CREDENTIAL_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid credential kind: ${input.kind}`);
  }
  if (!getPrincipal(principalId)) {
    throw new Error(`principal not found: ${principalId}`);
  }

  const id = input.id?.trim() || createId("idcrd");
  if (credentials.has(id)) {
    throw new Error(`credential already exists: ${id}`);
  }

  const credential: IdentityCredential = {
    id,
    principalId,
    kind: input.kind,
    label,
    active: true,
    detail: `kind=${input.kind} active=true`,
    metadata: { ...(input.metadata ?? {}) },
    issuedAt: nowIso(),
  };
  credentials.set(id, credential);
  return cloneCredential(credential);
}

export function getCredential(id: string): IdentityCredential | undefined {
  const credential = credentials.get(id.trim());
  return credential ? cloneCredential(credential) : undefined;
}

export function listCredentials(filter?: {
  principalId?: string;
  kind?: CredentialKind;
}): IdentityCredential[] {
  let result = [...credentials.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((c) => c.principalId === pid);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCredential);
}

export function clearCredentials(): void {
  credentials.clear();
}
