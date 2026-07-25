/**
 * Product Payment — Provider registry
 */

import {
  PAYMENT_PROVIDER_KINDS,
  PROVIDER_STATUSES,
} from "../integration/integration.constants";
import type {
  DisableProviderInput,
  PaymentProvider,
  PaymentProviderKind,
  ProviderStatus,
  RegisterProviderInput,
} from "./provider.types";

const providers = new Map<string, PaymentProvider>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProvider(provider: PaymentProvider): PaymentProvider {
  return { ...provider, metadata: { ...provider.metadata } };
}

export function registerProvider(
  input: RegisterProviderInput,
): PaymentProvider {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  if (!code) throw new Error("provider.code is required");
  if (!name) throw new Error("provider.name is required");
  if (!(PAYMENT_PROVIDER_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid provider kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("payprv");
  if (providers.has(id)) throw new Error(`provider already exists: ${id}`);

  const provider: PaymentProvider = {
    id,
    code,
    name,
    kind: input.kind,
    status: PROVIDER_STATUSES[0],
    detail: `kind=${input.kind} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  providers.set(id, provider);
  return cloneProvider(provider);
}

export function disableProvider(
  input: DisableProviderInput,
): PaymentProvider {
  const providerId = input.providerId.trim();
  if (!providerId) throw new Error("provider.providerId is required");
  const existing = providers.get(providerId);
  if (!existing) throw new Error(`provider not found: ${providerId}`);
  if (existing.status === "DISABLED") {
    throw new Error(`provider already disabled: ${providerId}`);
  }

  const updated: PaymentProvider = {
    ...existing,
    status: "DISABLED",
    detail: `kind=${existing.kind} status=DISABLED`,
    metadata: { ...existing.metadata },
  };
  providers.set(providerId, updated);
  return cloneProvider(updated);
}

export function getProvider(id: string): PaymentProvider | undefined {
  const provider = providers.get(id.trim());
  return provider ? cloneProvider(provider) : undefined;
}

export function listProviders(filter?: {
  kind?: PaymentProviderKind;
  status?: ProviderStatus;
}): PaymentProvider[] {
  let result = [...providers.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
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
