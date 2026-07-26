/**
 * Product API Authentication — API key registry (hash only, no SDK)
 */

import { createHash } from "node:crypto";

import { getApiCredential } from "../credential/credential.registry";
import type { ApiAuthKey, IssueApiAuthKeyInput } from "./key.types";

const keys = new Map<string, ApiAuthKey>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneKey(key: ApiAuthKey): ApiAuthKey {
  return { ...key, metadata: { ...key.metadata } };
}

function hashSecret(material: string): string {
  return createHash("sha256").update(material).digest("hex");
}

export function issueApiAuthKey(input: IssueApiAuthKeyInput): ApiAuthKey {
  const keyId = input.keyId.trim().toUpperCase();
  const credentialId = input.credentialId.trim();
  const secretMaterial = input.secretMaterial.trim();
  if (!keyId) throw new Error("key.keyId is required");
  if (!credentialId) throw new Error("key.credentialId is required");
  if (!secretMaterial) throw new Error("key.secretMaterial is required");

  const credential = getApiCredential(credentialId);
  if (!credential) throw new Error(`credential not found: ${credentialId}`);
  if (credential.status !== "ACTIVE") {
    throw new Error(`credential not active: ${credentialId}`);
  }

  const duplicate = [...keys.values()].find((k) => k.keyId === keyId);
  if (duplicate) throw new Error(`keyId already exists: ${keyId}`);

  const id = input.id?.trim() || createId("apiauthkey");
  if (keys.has(id)) throw new Error(`key already exists: ${id}`);

  const key: ApiAuthKey = {
    id,
    keyId,
    credentialId,
    secretHash: hashSecret(secretMaterial),
    detail: `keyId=${keyId}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  keys.set(id, key);
  return cloneKey(key);
}

export function getApiAuthKey(id: string): ApiAuthKey | undefined {
  const key = keys.get(id.trim());
  return key ? cloneKey(key) : undefined;
}

export function listApiAuthKeys(filter?: {
  credentialId?: string;
}): ApiAuthKey[] {
  let result = [...keys.values()];
  if (filter?.credentialId) {
    const credentialId = filter.credentialId.trim();
    result = result.filter((k) => k.credentialId === credentialId);
  }
  return result
    .slice()
    .sort((a, b) => a.keyId.localeCompare(b.keyId))
    .map(cloneKey);
}

export function clearApiAuthKeys(): void {
  keys.clear();
}

export function hashApiAuthSecret(material: string): string {
  return hashSecret(material.trim());
}
