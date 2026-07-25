/**
 * Product SSO — Provider registry
 */

import {
  SSO_PROVIDER_PROTOCOLS,
  SSO_PROVIDER_STATUSES,
} from "../federation/federation.constants";
import type {
  ActivateProviderInput,
  DisableProviderInput,
  RegisterProviderInput,
  SsoProvider,
  SsoProviderProtocol,
  SsoProviderStatus,
} from "./provider.types";

const providers = new Map<string, SsoProvider>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProvider(provider: SsoProvider): SsoProvider {
  return { ...provider, metadata: { ...provider.metadata } };
}

export function registerProvider(
  input: RegisterProviderInput,
): SsoProvider {
  const name = input.name.trim();
  const issuer = input.issuer.trim();
  if (!name) throw new Error("provider.name is required");
  if (!issuer) throw new Error("provider.issuer is required");
  if (!(SSO_PROVIDER_PROTOCOLS as readonly string[]).includes(input.protocol)) {
    throw new Error(`invalid sso protocol: ${input.protocol}`);
  }

  const id = input.id?.trim() || createId("ssoprv");
  if (providers.has(id)) throw new Error(`provider already exists: ${id}`);

  const status = SSO_PROVIDER_STATUSES[0];
  const provider: SsoProvider = {
    id,
    name,
    protocol: input.protocol,
    status,
    issuer,
    detail: `protocol=${input.protocol} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  providers.set(id, provider);
  return cloneProvider(provider);
}

export function activateProvider(
  input: ActivateProviderInput,
): SsoProvider {
  const providerId = input.providerId.trim();
  if (!providerId) throw new Error("provider.providerId is required");
  const existing = providers.get(providerId);
  if (!existing) throw new Error(`provider not found: ${providerId}`);
  if (existing.status === "ACTIVE") {
    throw new Error(`provider already active: ${providerId}`);
  }
  if (existing.status === "DISABLED") {
    throw new Error(`provider disabled: ${providerId}`);
  }

  const now = nowIso();
  const updated: SsoProvider = {
    ...existing,
    status: "ACTIVE",
    detail: `protocol=${existing.protocol} status=ACTIVE`,
    metadata: { ...existing.metadata },
    activatedAt: now,
  };
  providers.set(providerId, updated);
  return cloneProvider(updated);
}

export function disableProvider(input: DisableProviderInput): SsoProvider {
  const providerId = input.providerId.trim();
  if (!providerId) throw new Error("provider.providerId is required");
  const existing = providers.get(providerId);
  if (!existing) throw new Error(`provider not found: ${providerId}`);
  if (existing.status === "DISABLED") {
    throw new Error(`provider already disabled: ${providerId}`);
  }

  const updated: SsoProvider = {
    ...existing,
    status: "DISABLED",
    detail: `protocol=${existing.protocol} status=DISABLED`,
    metadata: { ...existing.metadata },
  };
  providers.set(providerId, updated);
  return cloneProvider(updated);
}

export function getProvider(id: string): SsoProvider | undefined {
  const provider = providers.get(id.trim());
  return provider ? cloneProvider(provider) : undefined;
}

export function listProviders(filter?: {
  protocol?: SsoProviderProtocol;
  status?: SsoProviderStatus;
}): SsoProvider[] {
  let result = [...providers.values()];
  if (filter?.protocol) {
    result = result.filter((p) => p.protocol === filter.protocol);
  }
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProvider);
}

export function clearProviders(): void {
  providers.clear();
}
