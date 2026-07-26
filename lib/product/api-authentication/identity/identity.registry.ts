/**
 * Product API Authentication — Identity mapping registry
 */

import { getApiCredential } from "../credential/credential.registry";
import type {
  ApiIdentityMapping,
  MapApiIdentityInput,
} from "./identity.types";

const mappings = new Map<string, ApiIdentityMapping>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMapping(mapping: ApiIdentityMapping): ApiIdentityMapping {
  return { ...mapping, metadata: { ...mapping.metadata } };
}

export function mapApiIdentity(
  input: MapApiIdentityInput,
): ApiIdentityMapping {
  const credentialId = input.credentialId.trim();
  const authPrincipalId = input.authPrincipalId.trim().toUpperCase();
  const productPrincipalRef = input.productPrincipalRef.trim().toUpperCase();
  if (!credentialId) throw new Error("identity.credentialId is required");
  if (!authPrincipalId) throw new Error("identity.authPrincipalId is required");
  if (!productPrincipalRef) {
    throw new Error("identity.productPrincipalRef is required");
  }

  const credential = getApiCredential(credentialId);
  if (!credential) throw new Error(`credential not found: ${credentialId}`);
  if (credential.status !== "ACTIVE") {
    throw new Error(`credential not active: ${credentialId}`);
  }

  const duplicate = [...mappings.values()].find(
    (m) => m.credentialId === credentialId,
  );
  if (duplicate) {
    throw new Error(`identity mapping already exists: ${credentialId}`);
  }

  const id = input.id?.trim() || createId("apiidmap");
  if (mappings.has(id)) throw new Error(`identity mapping already exists: ${id}`);

  const mapping: ApiIdentityMapping = {
    id,
    credentialId,
    authPrincipalId,
    productPrincipalRef,
    detail: `auth=${authPrincipalId} product=${productPrincipalRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  mappings.set(id, mapping);
  return cloneMapping(mapping);
}

export function getApiIdentityMapping(
  id: string,
): ApiIdentityMapping | undefined {
  const mapping = mappings.get(id.trim());
  return mapping ? cloneMapping(mapping) : undefined;
}

export function listApiIdentityMappings(filter?: {
  credentialId?: string;
}): ApiIdentityMapping[] {
  let result = [...mappings.values()];
  if (filter?.credentialId) {
    const credentialId = filter.credentialId.trim();
    result = result.filter((m) => m.credentialId === credentialId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMapping);
}

export function clearApiIdentityMappings(): void {
  mappings.clear();
}
