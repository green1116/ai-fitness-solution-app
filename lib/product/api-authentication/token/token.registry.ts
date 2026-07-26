/**
 * Product API Authentication — Token validation (deterministic, offline)
 */

import { createHash } from "node:crypto";

import { getApiCredential } from "../credential/credential.registry";
import { getApiAuthKey, listApiAuthKeys } from "../key/key.registry";
import type {
  ApiTokenValidation,
  ApiTokenValidationVerdict,
  ValidateApiTokenInput,
} from "./token.types";

const validations = new Map<string, ApiTokenValidation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneValidation(
  validation: ApiTokenValidation,
): ApiTokenValidation {
  return { ...validation, metadata: { ...validation.metadata } };
}

function fingerprint(material: string): string {
  return createHash("sha256").update(material.trim()).digest("hex");
}

export function validateApiToken(
  input: ValidateApiTokenInput,
): ApiTokenValidation {
  const credentialId = input.credentialId.trim();
  const keyId = input.keyId.trim().toUpperCase();
  const presentedSecret = input.presentedSecret.trim();
  if (!credentialId) throw new Error("token.credentialId is required");
  if (!keyId) throw new Error("token.keyId is required");
  if (!presentedSecret) throw new Error("token.presentedSecret is required");

  const credential = getApiCredential(credentialId);
  if (!credential) throw new Error(`credential not found: ${credentialId}`);

  const keys = listApiAuthKeys({ credentialId }).filter(
    (k) => k.keyId === keyId,
  );
  const key = keys[0] ?? getApiAuthKey(keyId);
  const presentedHash = fingerprint(presentedSecret);

  let verdict: ApiTokenValidationVerdict = "INVALID";
  if (credential.status === "EXPIRED") {
    verdict = "EXPIRED";
  } else if (
    credential.status === "ACTIVE" &&
    key &&
    key.credentialId === credentialId &&
    key.secretHash === presentedHash
  ) {
    verdict = "VALID";
  }

  const id = input.id?.trim() || createId("apitoken");
  if (validations.has(id)) throw new Error(`token validation already exists: ${id}`);

  const validation: ApiTokenValidation = {
    id,
    credentialId,
    keyId,
    tokenFingerprint: presentedHash,
    verdict,
    detail: `verdict=${verdict}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  validations.set(id, validation);
  return cloneValidation(validation);
}

export function getApiTokenValidation(
  id: string,
): ApiTokenValidation | undefined {
  const validation = validations.get(id.trim());
  return validation ? cloneValidation(validation) : undefined;
}

export function listApiTokenValidations(filter?: {
  credentialId?: string;
}): ApiTokenValidation[] {
  let result = [...validations.values()];
  if (filter?.credentialId) {
    const credentialId = filter.credentialId.trim();
    result = result.filter((v) => v.credentialId === credentialId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneValidation);
}

export function clearApiTokenValidations(): void {
  validations.clear();
}
