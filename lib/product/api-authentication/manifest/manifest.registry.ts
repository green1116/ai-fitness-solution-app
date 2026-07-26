/**
 * Product API Authentication — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listApiAuthenticationContexts } from "../context/context.registry";
import { getApiCredential } from "../credential/credential.registry";
import { listApiIdentityMappings } from "../identity/identity.registry";
import { listApiAuthKeys } from "../key/key.registry";
import { listApiTokenValidations } from "../token/token.registry";

export type ApiAuthenticationReleaseManifest = {
  id: string;
  credentialId: string;
  credentialKey: string;
  checksum: string;
  keyId: string;
  tokenValidationId: string;
  identityId: string;
  contextId: string;
  createdAt: string;
};

const releases = new Map<string, ApiAuthenticationReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: ApiAuthenticationReleaseManifest,
): ApiAuthenticationReleaseManifest {
  return { ...release };
}

export function createApiAuthenticationReleaseManifest(input: {
  id?: string;
  credentialId: string;
}): ApiAuthenticationReleaseManifest {
  const credentialId = input.credentialId.trim();
  if (!credentialId) throw new Error("manifest.credentialId is required");

  const credential = getApiCredential(credentialId);
  if (!credential) throw new Error(`credential not found: ${credentialId}`);

  const keys = listApiAuthKeys({ credentialId });
  if (keys.length < 1) throw new Error("api key missing");
  const validations = listApiTokenValidations({ credentialId });
  const valid = validations.find((v) => v.verdict === "VALID");
  if (!valid) throw new Error("valid token validation missing");
  const identities = listApiIdentityMappings({ credentialId });
  if (identities.length < 1) throw new Error("identity mapping missing");
  const contexts = listApiAuthenticationContexts({ credentialId });
  const authenticated = contexts.find((c) => c.authenticated === true);
  if (!authenticated) throw new Error("authenticated context missing");

  const payload = {
    credentialKey: credential.credentialKey,
    kind: credential.kind,
    status: credential.status,
    apiKeyRef: credential.apiKeyRef,
    keyId: keys[0].keyId,
    token: { verdict: valid.verdict, keyId: valid.keyId },
    identity: {
      authPrincipalId: identities[0].authPrincipalId,
      productPrincipalRef: identities[0].productPrincipalRef,
    },
    context: { authenticated: authenticated.authenticated },
  };

  const id = input.id?.trim() || createId("apiauthrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: ApiAuthenticationReleaseManifest = {
    id,
    credentialId,
    credentialKey: credential.credentialKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    keyId: keys[0].id,
    tokenValidationId: valid.id,
    identityId: identities[0].id,
    contextId: authenticated.id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getApiAuthenticationReleaseManifest(
  id: string,
): ApiAuthenticationReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listApiAuthenticationReleaseManifests(): ApiAuthenticationReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearApiAuthenticationReleaseManifests(): void {
  releases.clear();
}
